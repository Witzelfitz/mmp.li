# Leaderboard API - Anleitung für Studierende
## Übersicht
Dieses Dokument enthält Anleitungen zur Nutzung der Leaderboard API. Die API ermöglicht es, Daten in ein Leaderboard zu schreiben und diese abzurufen. Die API ist unter https://mmp.li/ erreichbar.

## API Routen
### Alle Leaderboards abrufen
- **URL**: /leaderboards
- **Methode**: GET
- **Beschreibung**: Ruft alle Leaderboards aus der Datenbank ab.
### Leaderboard nach Projekt-ID abrufen
- **URL**: /leaderboards/:projectId
- **Methode**: GET
- **Beschreibung**: Ruft ein spezifisches Leaderboard anhand seiner Projekt-ID ab.

### Neuen Eintrag im Leaderboard erstellen
- **URL**: /leaderboards
- **Methode**: POST
- **Beschreibung**: Erstellt einen neuen Eintrag im Leaderboard.
- Datenparameter:
    - projectId: Die Projekt-ID.
    - name: Der Name des Teilnehmenden.
    - score: Die Punktzahl des Teilnehmenden.

## Code-Beispiele
### Funktion zum Abrufen von Daten (getData)
```javascript
const gameID = "test"; // Setzen Sie hier die entsprechende Spiel-ID

async function getData() {
    try {
        const response = await fetch(`https://mmp.li/leaderboards/${gameID}`);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        // Hier können Sie die Daten verarbeiten
        console.log(data);
    } catch (error) {
        console.error('Fehler:', error);
    }
}
```
### Funktion zum Senden von Daten (postData)
```javascript
async function postData() {
    const data = {
        projectId: gameID, // Die Spiel-ID
        name: "Max",       // Name des Teilnehmenden
        score: 2000,       // Punktzahl
    };

    try {
        const response = await fetch('https://mmp.li/leaderboards/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        // Hier können Sie die Antwort verarbeiten
    } catch (error) {
        console.error('Fehler:', error);
    }
}
```
## Nutzung
Integrieren Sie die Funktionen getData und postData in Ihre Frontend-Anwendung, um die Leaderboard-Daten abzurufen bzw. neue Daten zu senden.

## Mitwirkung
Beiträge zur Verbesserung der API sind willkommen. Einfach einen "issues" erstellen.