````markdown
# Erste Schritte mit ZEC-API

## Voraussetzungen
- Docker
- Docker Compose

## Einrichtungsanleitung

### 1. Anwendung starten
```bash
docker-compose up --build
```

### 2. Keycloak konfigurieren

1. Navigiere zur Keycloak-Administrationskonsole unter http://localhost:8090
    - Standardzugangsdaten: `admin` / `admin`
    - **Wichtig:** Ändere diese Standardzugangsdaten unmittelbar nach der ersten Anmeldung aus Sicherheitsgründen
2. Erstelle ein neues Realm, indem du die Konfigurationsdatei importierst:
    - Speicherort: `ZEC-API/templates/keycloak/realm-export.json`
3. Client-Secrets neu generieren:
    - Wechsle zu deinem neu erstellten **zec-realm**
    - Gehe zu „Clients"
    - Öffne die Konfiguration des **login-client**
    - Navigiere zum Tab **Credentials** und generiere das Secret neu
    - Kopiere das neue Secret
    - Wiederhole den Vorgang für den **user-admin-client**
4. Kopiere diese Secrets in 
5. Gesamten Docker-Container neu bauen:
    - docker-compose down
    - docker-compose up --build -d
````

### 3. Testen
1. Das Web-Frontend läuft auf http://localhost:3000 
2. Anmelden testen mit den Standardzugangsdaten: `admin` / `changeme`
    - Auch diese Daten nach erstem Anmelden as Sicherheitsgründen ändern