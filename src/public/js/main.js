const API_BASE_URL = 'https://mmp.li';

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.api-section').forEach(section => {
        section.classList.remove('active');
    });
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update nav buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
}

async function testEndpoint(endpoint, method, body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        displayResponse(data);
    } catch (error) {
        displayResponse({ error: error.message });
    }
}

function testLeaderboardById() {
    const id = document.getElementById('leaderboardId').value;
    if (!id) {
        displayResponse({ error: 'Please enter an ID' });
        return;
    }
    testEndpoint(`/leaderboards/${id}`, 'GET');
}

function createLeaderboard() {
    const projectId = document.getElementById('projectId').value;
    const name = document.getElementById('name').value;
    const score = document.getElementById('score').value;

    if (!projectId || !name || !score) {
        displayResponse({ error: 'Please fill all fields' });
        return;
    }

    const body = {
        projectId,
        name,
        score: parseInt(score)
    };

    testEndpoint('/leaderboards', 'POST', body);
}

function testNoteById() {
    const id = document.getElementById('noteId').value;
    if (!id) {
        displayResponse({ error: 'Please enter an ID' });
        return;
    }
    testEndpoint(`/notes/${id}`, 'GET');
}

function createNote() {
    const noteId = document.getElementById('newNoteId').value;
    const title = document.getElementById('noteTitle').value;
    const text = document.getElementById('noteText').value;

    if (!noteId || !title || !text) {
        displayResponse({ error: 'Please fill all fields' });
        return;
    }

    if (title.length > 20) {
        displayResponse({ error: 'Title must be 20 characters or less' });
        return;
    }

    if (text.length > 200) {
        displayResponse({ error: 'Text must be 200 characters or less' });
        return;
    }

    const body = {
        noteId,
        title,
        text
    };

    testEndpoint('/notes', 'POST', body);
}

function updateNoteEntry() {
    const entryId = document.getElementById('entryId').value;
    const title = document.getElementById('updateTitle').value;
    const text = document.getElementById('updateText').value;

    if (!entryId || !title || !text) {
        displayResponse({ error: 'Please fill all fields' });
        return;
    }

    const body = {
        title,
        text
    };

    testEndpoint(`/notes/entry/${entryId}`, 'PUT', body);
}

function displayResponse(data) {
    const responseElement = document.getElementById('responseData');
    responseElement.textContent = JSON.stringify(data, null, 2);
}
