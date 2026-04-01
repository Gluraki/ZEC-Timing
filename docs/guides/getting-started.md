# Getting Started with ZEC-API

## Prerequisites
- Docker

## Setup Instructions

### 1. Start the Application
```bash
docker-compose up --build
```
Add `-d` to run in detached mode.

### 2. Configure Keycloak

1. Navigate to your Keycloak admin console at http://localhost:8090
    - Default credentials: `admin` / `admin`
    - **Important:** Change these default credentials immediately after first login for security purposes
2. Create a new realm by importing the configuration file:
    - Location: `ZEC-API/config/keycloak/realm-export.json`
3. Regenerate client secrets:
    - Switch to your newly created **zec-realm**
    - Go to clients
    - Open the **login-client** configuration
    - Navigate to the **Credentials** tab and regenerate the secret
    - Copy the new secret
    - Repeat for **user-admin-client**
4. Update your environment variables with the new client secrets your Docker environment configuration
5. Rebuild the entire docker-container
    - docker-compose down
    - docker-compose up --build -d

### 3. Verify Installation
Once configured, the ZEC-API should be running and ready to accept requests.
