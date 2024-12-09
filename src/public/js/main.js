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
        if (button.getAttribute('data-section') === sectionId) {
            button.classList.add('active');
        }
    });

    // Populate dropdowns if we're showing the chats section
    if (sectionId === 'chats') {
        populateChatDropdowns();
    }
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

        // Add status code to error message if not 2xx
        if (!response.ok) {
            displayResponse({ 
                error: `HTTP ${response.status}: ${response.statusText}`,
                details: await response.text()
            });
            return;
        }

        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            displayResponse(data);
        } else {
            const text = await response.text();
            displayResponse({ 
                error: 'Unexpected response format', 
                details: text 
            });
        }
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

function testChatById() {
    const id = document.getElementById('chatId').value;
    if (!id) {
        displayResponse({ error: 'Please enter a Chat ID' });
        return;
    }
    testEndpoint(`/chats/${id}`, 'GET');
}

function testChatMessages() {
    const id = document.getElementById('chatMessagesId').value;
    if (!id) {
        displayResponse({ error: 'Please enter a Chat ID' });
        return;
    }
    testEndpoint(`/chats/${id}/messages`, 'GET');
}

function createChat() {
    const title = document.getElementById('chatTitle').value;
    if (!title) {
        displayResponse({ error: 'Please enter a chat title' });
        return;
    }
    testEndpoint('/chats', 'POST', { roomId: title });
}

function createChatMessage() {
    const chatId = document.getElementById('messageChatId').value;
    const text = document.getElementById('messageText').value;
    
    if (!chatId || !text) {
        displayResponse({ error: 'Please fill all fields' });
        return;
    }
    
    testEndpoint(`/chats/${chatId}/messages`, 'POST', { content: text });
}

function updateChat() {
    const chatId = document.getElementById('updateChatId').value;
    const title = document.getElementById('updateChatTitle').value;
    
    if (!chatId || !title) {
        displayResponse({ error: 'Please fill all fields' });
        return;
    }
    
    testEndpoint(`/chats/${chatId}`, 'PUT', { roomId: title });
}

function deleteChat() {
    const chatId = document.getElementById('deleteChatId').value;
    if (!chatId) {
        displayResponse({ error: 'Please enter a Chat ID' });
        return;
    }
    testEndpoint(`/chats/${chatId}`, 'DELETE');
}

async function populateChatDropdowns() {
    try {
        const response = await fetch(`${API_BASE_URL}/chats`);
        if (!response.ok) {
            console.error(`Failed to fetch chats: ${response.status} ${response.statusText}`);
            return;
        }
        
        const chats = await response.json();
        if (!Array.isArray(chats)) {
            console.error('Expected array of chats but got:', typeof chats);
            return;
        }
        
        // Get all chat dropdown elements
        const dropdowns = document.querySelectorAll('.chat-select');
        
        // Populate each dropdown
        dropdowns.forEach(dropdown => {
            dropdown.innerHTML = '<option value="">Select a chat...</option>';
            chats.forEach(chat => {
                const option = document.createElement('option');
                option.value = chat._id;
                option.textContent = `${chat.roomId} (${chat._id})`;
                dropdown.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

function deleteNote() {
    const noteId = document.getElementById('deleteNoteId').value;
    if (!noteId) {
        displayResponse({ error: 'Please enter a Note ID' });
        return;
    }
    testEndpoint(`/notes/${noteId}`, 'DELETE');
}

function updateNote() {
    const noteId = document.getElementById('updateNoteId').value;
    const title = document.getElementById('updateNoteTitle').value;
    const text = document.getElementById('updateNoteText').value;
    
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
        title,
        text
    };
    
    testEndpoint(`/notes/${noteId}`, 'PUT', body);
}

async function loadMessages(chatId, targetSelect) {
    try {
        const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`);
        if (!response.ok) {
            console.error(`Failed to fetch messages: ${response.status}`);
            return;
        }
        
        const messages = await response.json();
        targetSelect.innerHTML = '<option value="">Select a message...</option>';
        messages.forEach(message => {
            const option = document.createElement('option');
            option.value = message._id;
            option.textContent = `${message.randomName}: ${message.content.substring(0, 30)}...`;
            targetSelect.appendChild(option);
        });
        targetSelect.disabled = false;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Add event listeners for chat selection changes
document.addEventListener('DOMContentLoaded', () => {
    const updateMessageChatId = document.getElementById('updateMessageChatId');
    const deleteMessageChatId = document.getElementById('deleteMessageChatId');
    const messageSelect = document.getElementById('messageSelect');
    const deleteMessageSelect = document.getElementById('deleteMessageSelect');

    updateMessageChatId.addEventListener('change', (e) => {
        if (e.target.value) {
            loadMessages(e.target.value, messageSelect);
        } else {
            messageSelect.disabled = true;
            messageSelect.innerHTML = '<option value="">Select a message...</option>';
        }
    });

    deleteMessageChatId.addEventListener('change', (e) => {
        if (e.target.value) {
            loadMessages(e.target.value, deleteMessageSelect);
        } else {
            deleteMessageSelect.disabled = true;
            deleteMessageSelect.innerHTML = '<option value="">Select a message...</option>';
        }
    });
});

function updateChatMessage() {
    const chatId = document.getElementById('updateMessageChatId').value;
    const messageId = document.getElementById('messageSelect').value;
    const content = document.getElementById('updateMessageText').value;
    
    if (!chatId || !messageId || !content) {
        displayResponse({ error: 'Please fill all fields' });
        return;
    }
    
    testEndpoint(`/chats/${chatId}/messages/${messageId}`, 'PUT', { content });
}

function deleteChatMessage() {
    const chatId = document.getElementById('deleteMessageChatId').value;
    const messageId = document.getElementById('deleteMessageSelect').value;
    
    if (!chatId || !messageId) {
        displayResponse({ error: 'Please select both chat and message' });
        return;
    }
    
    testEndpoint(`/chats/${chatId}/messages/${messageId}`, 'DELETE');
}
