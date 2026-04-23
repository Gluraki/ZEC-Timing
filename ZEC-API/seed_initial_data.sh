#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
SEED_DIR="${SCRIPT_DIR}/seed"

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "docker-compose.yml not found at ${COMPOSE_FILE}" >&2
  exit 1
fi

if [[ ! -d "${SEED_DIR}" ]]; then
  echo "Seed directory not found: ${SEED_DIR}" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but not installed." >&2
  exit 1
fi

run_container_python() {
  local service="$1"
  local payload_b64="$2"
  local python_code="$3"

  docker compose -f "${COMPOSE_FILE}" exec -T "${service}" python - "${payload_b64}" <<PY
${python_code}
PY
}

json_b64() {
  local file="$1"
  if [[ ! -s "${file}" ]]; then
    printf 'W10='
    return
  fi
  base64 -w 0 "${file}" | tr -d '\n'
}

wait_for_service() {
  local service="$1"
  local dbname="$2"

  echo "Waiting for ${service} (${dbname})..."
  for _ in {1..30}; do
    if docker compose -f "${COMPOSE_FILE}" exec -T "${service}" pg_isready -U postgres -d "${dbname}" >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  echo "Database ${service} is not ready." >&2
  exit 1
}

wait_for_service "challenge-db" "challengedb"
wait_for_service "score-db" "scoredb"
wait_for_service "user-db" "userdb"

challenge_b64="$(json_b64 "${SEED_DIR}/challenge.json")"
score_b64="$(json_b64 "${SEED_DIR}/penalty_types.json")"
user_b64="$(json_b64 "${SEED_DIR}/user.json")"

run_container_python "challenge-service" "${challenge_b64}" "$(cat <<'PY'
import base64
import json
import sys

from sqlalchemy.orm import Session

from app.crud.challenge import create_challenge, get_challenge_by_name
from app.database.session import engine
from app.exceptions.exceptions import EntityDoesNotExistError
from app.schemas.challenge import ChallengeCreate

payload = json.loads(base64.b64decode(sys.argv[1]).decode())
db = Session(bind=engine)
try:
    for item in payload:
        try:
            get_challenge_by_name(db=db, challenge_name=item["name"])
        except EntityDoesNotExistError:
            create_challenge(db=db, challenge=ChallengeCreate(**item))
finally:
    db.close()
PY
)"

run_container_python "score-service" "${score_b64}" "$(cat <<'PY'
import base64
import json
import sys

from sqlalchemy.orm import Session

from app.crud.penalty import create_penalty_type, get_penalty_type_by_type
from app.database.session import engine
from app.exceptions.exceptions import EntityDoesNotExistError
from app.schemas.penalty import PenaltyTypeCreate

payload = json.loads(base64.b64decode(sys.argv[1]).decode())
db = Session(bind=engine)
try:
    for item in payload:
        try:
            get_penalty_type_by_type(db=db, penalty_type_name=item["type"])
        except EntityDoesNotExistError:
            create_penalty_type(db=db, penalty_type=PenaltyTypeCreate(**item))
finally:
    db.close()
PY
)"

run_container_python "user-service" "${user_b64}" "$(cat <<'PY'
import base64
import json
import sys

from sqlalchemy.orm import Session

from app.crud.user import add_roles_to_user, create_user, get_user_by_username
from app.database.session import engine
from app.exceptions.exceptions import EntityDoesNotExistError
from app.schemas.user import CreateUserKC

payload = json.loads(base64.b64decode(sys.argv[1]).decode())
db = Session(bind=engine)
try:
    for item in payload:
        roles = item.get("roles", [])
        team_id = item.get("team_id")
        username = item["username"]
        password = item["password"]

        try:
            user = get_user_by_username(db=db, username=username)
            current_roles = set(user.roles or [])
            missing_roles = [role for role in roles if role not in current_roles]
            if missing_roles:
                add_roles_to_user(user.kc_id, missing_roles)
        except EntityDoesNotExistError:
            created_user = create_user(
                db=db,
                request=CreateUserKC(username=username, password=password, team_id=team_id),
            )
            if roles:
                add_roles_to_user(created_user.kc_id, roles)
finally:
    db.close()
PY
)"

echo "Seed data applied successfully."
