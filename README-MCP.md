# MCP Integration für mmp.li API

Diese API unterstützt jetzt das **Model Context Protocol (MCP)**, welches KI-Assistenten direkten Zugriff auf deine Daten und Tools ermöglicht.

## 🚀 Quick Start

### 1. Server starten
```bash
npm start
```
Der MCP Endpoint ist verfügbar unter: `http://localhost:3000/mcp`

### 2. MCP Capabilities testen
```bash
curl -X GET http://localhost:3000/mcp
```

### 3. MCP Client verwenden
Du kannst jeden MCP-kompatiblen Client verwenden, z.B.:
- **Claude Desktop**: Füge den Server zur MCP-Konfiguration hinzu
- **MCP CLI**: Nutze den HTTP Transport
- **Custom Clients**: Implementiere das MCP Protocol

## 📋 Verfügbare Resources (Read-only)

| URI | Beschreibung |
|-----|--------------|
| `mmp://database` | **🔥 ALLE Daten aus der gesamten Datenbank** |
| `mmp://leaderboards` | Alle Leaderboards mit Einträgen |
| `mmp://leaderboards/list` | Zusammenfassung der Leaderboards |
| `mmp://notes` | Alle Notizen mit Einträgen |
| `mmp://chats` | Alle Chat-Räume (ohne Nachrichten) |
| `mmp://leaderboards/{projectId}` | Spezifisches Leaderboard |
| `mmp://notes/{noteId}` | Spezifische Notiz |
| `mmp://chats/{chatId}/messages` | Nachrichten eines Chats |

### ⭐ Neue Complete Database Resource
Die `mmp://database` Resource gibt alle Daten aus allen Collections zurück:
```json
{
  "leaderboards": [...],
  "notes": [...], 
  "chats": [...],
  "metadata": {
    "timestamp": "2025-07-29T20:42:28.385Z",
    "counts": {
      "leaderboards": 2,
      "notes": 2,
      "chats": 2
    }
  }
}
```

## 🛠 Verfügbare Tools (Side-effects)

### Leaderboards
- `create_leaderboard_entry` - Füge Eintrag zu Leaderboard hinzu
- `delete_leaderboard` - Lösche ganzes Leaderboard

### Notes
- `create_note` - Erstelle neuen Notiz-Eintrag
- `update_note_entry` - Aktualisiere bestehenden Eintrag
- `delete_note` - Lösche ganze Notiz-Sammlung

### Chats
- `create_chat` - Erstelle neuen Chat-Raum
- `create_message` - Sende Nachricht in Chat
- `delete_chat` - Lösche Chat-Raum
- `delete_message` - Lösche spezifische Nachricht

## 🔧 MCP Konfiguration

### Claude Desktop
Füge zu deiner `claude_desktop_config.json` hinzu:
```json
{
  "mcpServers": {
    "mmp.li": {
      "command": "node",
      "args": ["path/to/mmp.li/src/index.js"],
      "env": {
        "MONGODB_DB_HOST": "your-mongodb-host",
        "MONGO_DB_USER": "your-username",
        "MONGO_DB_PASSWORD": "your-password",
        "MONGO_DB_NAME": "your-database"
      }
    }
  }
}
```

### HTTP Client
```bash
# Initialize connection
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"my-client","version":"1.0.0"}}}'

# List resources
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"resources/list"}'

# Read resource
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"mmp://leaderboards"}}'

# Read complete database
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"resources/read","params":{"uri":"mmp://database"}}'

# Call tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"create_leaderboard_entry","arguments":{"projectId":"test","playerName":"Alice","score":100}}}'
```

## 🏗 Architektur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   MCP Client    │───▶│   HTTP/JSON-RPC  │───▶│   Express App   │
│  (Claude, etc.) │    │    Transport     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  MCP Handlers   │
                                               │  (Resources +   │
                                               │     Tools)      │
                                               └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │    MongoDB      │
                                               │   (Mongoose)    │
                                               └─────────────────┘
```

## 📝 Beispiel-Interaktionen

### KI-Assistant Conversation
```
Human: "Zeige mir alle Daten aus der Datenbank"
Assistant: *liest mmp://database resource*
"Hier ist ein kompletter Überblick deiner Daten:
- 2 Leaderboards mit insgesamt 3 Spieler-Einträgen
- 2 Notizen-Sammlungen
- 2 Chat-Räume
..."
``` 