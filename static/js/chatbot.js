const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chat = document.getElementById("chat");
const typing = document.getElementById("typing");
const welcome = document.getElementById("welcome");
const recentChats = document.getElementById("recentChats");


/* =========================
   CONVERSATION
========================= */

const systemMessage = {
    role: "system",
    content: `
You are PitchPro AI Coach, an AI soccer coach inside the PitchPro
youth soccer training platform.

Your job is to help young soccer players improve their soccer skills,
understanding, confidence, and preparation.

You can help with:
- Finishing
- First touch
- Dribbling
- Passing
- Movement
- Positioning
- Game intelligence
- 1v1 ability
- Speed and agility
- Striker training
- Match preparation
- Soccer rules
- Soccer terminology
- Tactics
- Training ideas
- Confidence and mindset

Give practical, age-appropriate advice.

When giving training sessions:
- Organize them into clear steps.
- Include realistic durations when useful.
- Focus on technique and quality.
- Include rest and recovery.
- Avoid extreme exercise.
- Do not recommend restrictive eating.
- Encourage working with the player's real coach.

Keep answers easy to understand and useful for a young soccer player.

If the user asks something unrelated to soccer, politely redirect
the conversation toward soccer coaching.
`
};


/* =========================
   CHAT STATE
========================= */

let conversation = [systemMessage];

let currentChatId = null;


/* =========================
   CHAT STORAGE
========================= */

function getSavedChats() {
    return JSON.parse(
        localStorage.getItem("pitchpro_recent_chats") || "[]"
    );
}


function saveChats(chats) {
    localStorage.setItem(
        "pitchpro_recent_chats",
        JSON.stringify(chats)
    );
}


/* =========================
   CREATE CHAT
========================= */

function createChat() {

    const chatId =
        Date.now().toString();

    const newChat = {
        id: chatId,
        title: "New chat",
        messages: [],
        updatedAt: Date.now()
    };

    const chats = getSavedChats();

    chats.unshift(newChat);

    saveChats(chats);

    currentChatId = chatId;

    conversation = [systemMessage];

    renderRecentChats();

    return newChat;
}


/* =========================
   SAVE CURRENT CHAT
========================= */

function saveCurrentChat() {

    if (!currentChatId) {
        return;
    }

    const chats = getSavedChats();

    const index = chats.findIndex(
        c => c.id === currentChatId
    );

    if (index === -1) {
        return;
    }

    chats[index].messages =
        conversation.filter(
            message => message.role !== "system"
        );

    chats[index].updatedAt = Date.now();

    saveChats(chats);

    renderRecentChats();
}


/* =========================
   CHAT TITLE
========================= */

function generateTitle(text) {

    let title = text.trim();

    if (title.length > 32) {
        title = title.substring(0, 32) + "...";
    }

    return title;
}


function updateChatTitle(text) {

    const chats = getSavedChats();

    const current = chats.find(
        c => c.id === currentChatId
    );

    if (!current) {
        return;
    }

    if (
        current.title === "New chat" &&
        text.trim()
    ) {
        current.title = generateTitle(text);
    }

    current.updatedAt = Date.now();

    saveChats(chats);

    renderRecentChats();
}


/* =========================
   RENDER RECENT CHATS
========================= */

function renderRecentChats() {

    const chats = getSavedChats();

    recentChats.innerHTML = "";

    if (chats.length === 0) {

        recentChats.innerHTML = `
            <div class="no-chats">
                No recent chats yet
            </div>
        `;

        return;
    }

    chats.sort(
        (a, b) => b.updatedAt - a.updatedAt
    );

    chats.forEach(savedChat => {

        const button =
            document.createElement("button");

        button.className =
            "recent-chat" +
            (
                savedChat.id === currentChatId
                    ? " active"
                    : ""
            );

        button.innerHTML = `
            <span class="recent-chat-icon">💬</span>

            <span class="recent-chat-title">
                ${escapeHTML(savedChat.title)}
            </span>

            <span
                class="delete-chat"
                title="Delete chat"
            >
                ×
            </span>
        `;

        button.addEventListener(
            "click",
            function(event) {

                if (
                    event.target.classList.contains(
                        "delete-chat"
                    )
                ) {
                    event.stopPropagation();

                    deleteChat(savedChat.id);

                    return;
                }

                loadChat(savedChat.id);
            }
        );

        recentChats.appendChild(button);
    });
}


/* =========================
   LOAD CHAT
========================= */

function loadChat(chatId) {

    const chats = getSavedChats();

    const savedChat =
        chats.find(
            c => c.id === chatId
        );

    if (!savedChat) {
        return;
    }

    currentChatId = chatId;

    conversation = [
        systemMessage,
        ...savedChat.messages
    ];

    clearChatUI();

    savedChat.messages.forEach(message => {

        addMessage(
            message.content,
            message.role === "assistant"
                ? "ai-message"
                : "user-message"
        );
    });

    renderRecentChats();

    input.focus();
}


/* =========================
   DELETE CHAT
========================= */

function deleteChat(chatId) {

    let chats = getSavedChats();

    chats = chats.filter(
        c => c.id !== chatId
    );

    saveChats(chats);

    if (currentChatId === chatId) {

        currentChatId = null;

        conversation = [systemMessage];

        clearChatUI();

        renderRecentChats();
    }
}


/* =========================
   CLEAR CHAT UI
========================= */

function clearChatUI() {

    document
        .querySelectorAll(".message")
        .forEach(message => {
            message.remove();
        });

    if (welcome) {
        welcome.style.display = "block";
    }

    typing.style.display = "none";
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(text, type) {

    const message =
        document.createElement("div");

    message.className =
        `message ${type}`;

    const label =
        type === "ai-message"
            ? "AI COACH"
            : "YOU";

    let renderedText;

    if (type === "ai-message") {

        renderedText =
            DOMPurify.sanitize(
                marked.parse(text)
            );

    } else {

        renderedText =
            escapeHTML(text)
                .replace(/\n/g, "<br>");
    }

    message.innerHTML = `
        <div class="message-label">
            ${label}
        </div>

        <div class="message-content">
            ${renderedText}
        </div>
    `;

    chat.insertBefore(
        message,
        typing
    );

    chat.scrollTop =
        chat.scrollHeight;
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================
   SEND MESSAGE
========================= */

async function sendMessage() {

    const text =
        input.value.trim();

    if (
        !text ||
        sendButton.disabled
    ) {
        return;
    }


    /* Create chat if needed */

    if (!currentChatId) {
        createChat();
    }


    /* Hide welcome */

    if (welcome) {
        welcome.style.display =
            "none";
    }


    /* Add user message */

    addMessage(
        text,
        "user-message"
    );


    input.value = "";


    conversation.push({
        role: "user",
        content: text
    });


    /* Give chat its title */

    updateChatTitle(text);


    /* Save immediately */

    saveCurrentChat();


    /* Disable button */

    sendButton.disabled = true;

    sendButton.textContent = "...";


    /* Show typing */

    typing.style.display =
        "block";

    chat.scrollTop =
        chat.scrollHeight;


    try {

        const response =
            await fetch(
                "/api/ai-coach",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        messages:
                            conversation
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI Coach error"
            );
        }


        const reply =
            data.reply;


        conversation.push({
            role: "assistant",
            content: reply
        });


        typing.style.display =
            "none";


        addMessage(
            reply,
            "ai-message"
        );


        /* Save AI response */

        saveCurrentChat();


    } catch (error) {

        console.error(
            "AI Coach error:",
            error
        );


        typing.style.display =
            "none";


        addMessage(
            "I couldn't connect to the AI Coach right now. Check that your Flask server and Groq API key are working.",
            "ai-message"
        );
    }


    sendButton.disabled =
        false;

    sendButton.textContent =
        "Send";

    input.focus();
}


/* =========================
   QUICK QUESTIONS
========================= */

function quickAsk(question) {

    input.value = question;

    sendMessage();
}


/* =========================
   NEW CHAT
========================= */

function newChat() {

    currentChatId = null;

    conversation = [
        systemMessage
    ];

    clearChatUI();

    const firstMessage =
        document.createElement("div");

    firstMessage.className =
        "message ai-message";

    firstMessage.innerHTML = `
        <div class="message-label">
            AI COACH
        </div>

        <div class="message-content">
            New chat ready. What do you want to work on? ⚽
        </div>
    `;

    chat.insertBefore(
        firstMessage,
        typing
    );

    renderRecentChats();

    chat.scrollTop = 0;

    input.focus();
}


/* =========================
   BUTTON
========================= */

sendButton.addEventListener(
    "click",
    sendMessage
);


/* =========================
   ENTER KEY
========================= */

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }
    }
);


/* =========================
   START
========================= */

renderRecentChats();

input.focus();

window.quickAsk = quickAsk;