const gameID = "test";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector("#app");
    const getButton = document.querySelector("#get");
    const postButton = document.querySelector("#post");
    

    getButton.addEventListener("click", getData);
    postButton.addEventListener("click", postData);
});

async function getData() {
    try {
        const response = await fetch(`https://mmp.li/leaderboards/${gameID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        app.innerHTML = "";
        data.entries.forEach((entry) => {
            const p = document.createElement("p");
            p.innerText = `${entry.name} - ${entry.score}`;
            app.appendChild(p);                
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function postData() {
    const data = {
        projectId: gameID,
        name: "Max",
        score: 2000,
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
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log(responseData);
        getData();
    } catch (error) {
        console.error('Error:', error);
    }
}
