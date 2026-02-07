# Credit Quest 🛡️💰

Credit Quest ist eine gamifizierte Web-App, die dir hilft, deinen Kredit spielerisch und transparent zurückzuzahlen. Verfolge deinen Fortschritt, feiere Meilensteine und behalte den Überblick über deine Finanzen.

![Dashboard Preview](doc/dashboard-preview.png) *(Platzhalter für einen Screenshot)*

## Features

- **Gamifiziertes Dashboard**: Visuelle Fortschrittsbalken und Konfetti-Effekte bei Zahlungen halten dich motiviert.
- **Sondertilgung-Tracker**: Ein spezieller Bereich (Yearly Challenge), der dir hilft, deine jährliche Sondertilgungsmöglichkeit (z.B. 5%) optimal auszunutzen.
- **Intelligenter Zahlungsplan**:
  - Automatische Berechnung des Enddatums ("Frei am...").
  - **Archiv-Funktion**: Vergangene Zahlungen werden automatisch archiviert, sodass du immer den aktuellen Monat im Fokus hast.
  - Abhak-Funktion für geleistete Raten.
- **Daten-Persistenz**: Deine Daten (Kreditprofil, Zahlungen) werden sicher in einem Docker-Volume gespeichert und bleiben auch nach einem Neustart erhalten.
- **Premium UI**: Modernes Dark-Mode Design mit React und Vanilla CSS.

## Technologie-Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js (Express) - dient als leichtgewichtiger Server für die Datenhaltung.
- **Styling**: Vanilla CSS (Variables, Flexbox/Grid)
- **Deployment**: Docker & Docker Compose

## Installation & Nutzung

### Mit Docker (Empfohlen)

Die einfachste Art, die App zu starten. Die Daten werden im Volume `credit_data` gespeichert.

1. Repository klonen.
2. Docker Desktop starten.
3. Im Terminal ausführen:
   ```bash
   docker-compose up --build -d
   ```
4. App öffnen unter: [http://localhost:3005](http://localhost:3005) (Port kann in `docker-compose.yml` angepasst werden).

### Lokale Entwicklung

Benötigt Node.js (v18+).

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Entwicklungsserver starten (Frontend):
   ```bash
   npm run dev
   ```
   *Hinweis: Im Dev-Modus läuft der Express-Backend-Server nicht automatisch. Die API-Requests (`/api/data`) müssen ggf. gemockt oder der Server separat gestartet werden.*

   Um das Backend lokal zu starten:
   ```bash
   node server/server.js
   ```

## Projektstruktur

- `/src`: React Frontend Code
  - `/components`: UI Komponenten (Dashboard, LoanSetup)
  - `/utils`: Finanz-Logik und API-Helper
- `/server`: Node.js Backend Code
- `/data`: (Wird zur Laufzeit erstellt) Speicherort für `db.json`

## Lizenz

MIT
