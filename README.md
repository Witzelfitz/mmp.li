# mmp.li API

Öffentliche API für MMP-Projekte an der FHGR. Sie stellt Bestenlisten, Notizbücher, Chats und einen MCP-Endpunkt bereit.

## Entwicklung

Voraussetzungen: Node.js 20 oder neuer und eine erreichbare MongoDB.

```bash
npm ci
npm run check
npm start
```

Die Anwendung verwendet folgende Umgebungsvariablen:

- `PORT` – HTTP-Port, standardmässig `3000`
- `MONGODB_DB_HOST` – MongoDB-Host, standardmässig `127.0.0.1:27017`
- `MONGO_DB_USER` – MongoDB-Benutzer
- `MONGO_DB_PASSWORD` – MongoDB-Passwort
- `MONGO_DB_NAME` – Datenbankname, standardmässig `mmpli`

## Endpunkte

| Methode | Pfad | Zweck |
| --- | --- | --- |
| `GET` | `/health` | Dienst- und Datenbankstatus |
| `GET`, `POST` | `/leaderboards` | Bestenlisten lesen und Einträge erstellen |
| `GET` | `/leaderboards/:projectId` | Eine Bestenliste lesen |
| `GET`, `POST` | `/notes` | Notizbücher lesen und Einträge erstellen |
| `GET`, `DELETE` | `/notes/:noteId` | Notizbuch lesen oder löschen |
| `PUT` | `/notes/entry/:entryId` | Einzelnen Notizeintrag aktualisieren |
| `GET`, `POST`, `PUT`, `DELETE` | `/chats/...` | Chats und Nachrichten verwalten |
| `GET`, `POST` | `/mcp` | MCP-Discovery und JSON-RPC |

Die interaktive Übersicht wird unter [https://mmp.li](https://mmp.li) ausgeliefert.

## Produktionsprüfung

```bash
BASE_URL=https://mmp.li npm run smoke
```

Der Smoke-Test ist rein lesend und verändert keine Daten.
