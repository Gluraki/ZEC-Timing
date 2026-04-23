# Erste Schritte mit ZEC-API

## Voraussetzungen
- Docker
- Docker Compose

## Einrichtungsanleitung

### 1. Anwendung starten
Im root Directory ausführen:
```bash
docker-compose up --build
```

### 2. Keycloak konfigurieren

1. Navigiere zur Keycloak-Administrationskonsole unter http://localhost:8090
    - Kann etwas dauern bis Zugreifbar ist
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
4. Kopiere diese Secrets in die docker-compose Datei -> auth-service
5. Gesamten Docker-Container neu bauen:
    - docker-compose down
    - docker-compose up --build -d

### 3. Seed-Daten importieren
Anpassen können sie die Seed-Daten in `/ZEC-API/seed/`
Zum importieren der Seed-Daten führen sie das `seed_initial_data.sh` aus
    - **Wichtig** das Skript funktioniert nur bei Neuaufsetzung
```bash
./ZEC-API/seed_initial_data.sh
```

### 4. Testen
1. Das Web-Frontend läuft auf http://localhost:3000  
2. Anmeldung testen mit den Standardzugangsdaten: `admin` / `changeme`  
   - **Hinweis:** Ändere auch diese Zugangsdaten nach der ersten Anmeldung aus Sicherheitsgründen  
3. Für API-Tests steht zusätzlich eine vorbereitete Postman-Collection zur Verfügung:  
   - Speicherort: `ZEC-API/templates/postman`  
