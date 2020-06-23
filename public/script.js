const socket = io();

// View of login page
let loginPage = document.getElementById('loginPage');

// View of chat page
let chatPage = document.getElementById('chatPage');

// Message error from username
let errorUsernameMessage = document.getElementById('errorUsername');

// Input username
let inputUsername = document.getElementById('inputUsername');

// Button send username for check an regist
let btnSendUsername = document.getElementById('sendUsername');

// List of users connected
let listUsersConnected = document.getElementById('listUsersConnected');

// List of messages
let listMessages = document.getElementById('listMessages');

// Message user typing
let userTypingMessage = document.getElementById('userTypingMessage');

// Input message
let inputMessage = document.getElementById('inputMessage');

// Buton for send message
let btnSendMessage = document.getElementById('sendMessage');

// Message error from message
let errorMessage = document.getElementById('errorMessage');

// Open login page
const closeLoginPage = () => {
    loginPage.style.display = 'none';
    chatPage.style.display = '';
};

// Close login page
const openLoginPage = () => {
    loginPage.style.display = '';
    chatPage.style.display = 'none';
};

// Open chat page
const openChatPage = () => {
    chatPage.style.display = '';
    loginPage.style.display = 'none';
};

// Close chat page
const closeChatPage = () => {
    chatPage.style.display = 'none';
    loginPage.style.display = '';
};

// Show message error when username has error
socket.on('showErrorUsername', (data) => {
    errorUsernameMessage.innerHTML =
    `
    <p>${ data.message }</p>
    `
});

// History of messages
socket.on('messageHistory', (data) => {
    if (data.length == 0) {
        listMessages.innerHTML = '';
    }
    for (i = 0; i < data.length; i++) {
        listMessages.innerHTML +=
        `
        <li> <b id="nameUser">${ data[i][0] }: </b> <i>${ data[i][1] }</i> </li>
        `;
    };
});

// Append message to list
socket.on('addMessage', (data) => {
    userTypingMessage.innerHTML = '';
    listMessages.innerHTML +=
    `<li><b id="nameUser">${ data.username }: </b>
    <i>${ data.message }</i></li>
    `;
});

// Append greeting to list
socket.on('greetingMessage', (data) => {
    listMessages.innerHTML +=
    `
    <li id="greetMessage"> <i> ${ data.username } - ${ data.message } </i> </li>
    `;
});

// Welcome
// Clear area login page and show chat page
socket.on('loginUser', (data) => {
    closeLoginPage();
    openChatPage();
    socket.emit('greetingMessage', {
        username: data.username
    })
})

// Show typing message
socket.on('userTyping', (data) => {
    userTypingMessage.innerHTML =
    `
    <small><em> ${ data.username } ${data.message } </em></small>
    `
});

// Listen when user write username
inputUsername.addEventListener('keypress', () => {
    // Clear area of error message when user is write
    errorUsernameMessage.innerHTML = '';
})

// Listen when user write a message - ( show a message )
inputMessage.addEventListener('keypress', () => {
    errorMessage.innerHTML = '';
    socket.emit('userTyping', {
        username: inputUsername.value,
        message: 'is typing..'
    });
});

// Listen button to send message
btnSendMessage.addEventListener('click', () => {
    if (inputMessage.value == '') {
        errorMessage.innerHTML = 
        `
        <p> | Message is empty | </p>
        `
    } else {
        userTypingMessage.innerHTML = '';
        socket.emit('addNewMessage', {
            message: inputMessage.value
        });
        inputMessage.value = '';
    }
});

// Listen button to send username
btnSendUsername.addEventListener('click', () => {
    socket.emit('addUser', {
        username: inputUsername.value
    });
});

// Refresh list of users connected
socket.on('refreshUserList', (data) => {
    listUsersConnected.innerHTML = '';
    for( i = 0; i < data.length; i ++ ) {
        listUsersConnected.innerHTML +=
        `
        <li><b> ${ data[i][1] } </b> - </li>
        `;
    }
});

