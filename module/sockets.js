// Array of users -- Contains array of user
let users = [];
let messages = [];

// Append message on array of messages
const appendMessage = (user, message) => {
    // mess[0] = username
    // mess[1] = message
    var mess = [user, message];
    messages.push(mess);
};

// Return quantity of messages on array
const numberMessages = () => {
    return messages.length;
};

// Return true if user exist
const existUser = (username) => {
    for (i = 0; i < users.length; i++) {
        if (users[i][1] === username) {
            return true;
        }
    }
}

// Add new user to list users
const addNewUser = (userid, username) => {
    // user[0] = id connection
    // user[1] = username
    user = [userid, username];
    users.push(user);
}

// Remove user to list users
const removeUser = (username) => {
    for (i = 0; i < users.length; i++) {
        if (users[i][1] == username) {
            users.splice(i, 1);
        }
    }
}

// Return quantity of users connected
const numberUsers = () => {
    return users.length;
}

module.exports = function(io) {
    // WebSockets
    io.on('connection', (socket) => {
        console.log('New Connection - ' + socket.id);

        socket.emit('messageHistory', messages);

        // Add message for all
        socket.on('addNewMessage', (data) => {
            if ( numberMessages() >= 500 ) {
                messages = [];
                // To broadcast a message to all the sockets is used: io.sockets.emit(). But it didn't work for me.
                socket.emit('messageHistory', messages);
                socket.broadcast.emit('messageHistory', messages);
            }
            appendMessage(socket.username, data.message);

            socket.emit('addMessage', {
                username: socket.username,
                message: data.message
            });

            socket.broadcast.emit('addMessage', {
                username: socket.username,
                message: data.message
            });
        });

        // Emit show message when user is typing
        socket.on('userTyping', (data) => {
            socket.broadcast.emit('userTyping', {
                username: socket.username,
                message: data.message
            });
        });

        socket.on('addUser', (data) => { // Add the user when he logs in. Show a message of greeting.
            if (data.username == '') { // If username is empty send message error
                socket.emit('showErrorUsername', {
                    message: '* Username is empty'
                });
            } else {
                if (existUser(data.username)) { // If username exist send message error
                    socket.emit('showErrorUsername', {
                        message: '* Username is token'
                    });
                } else {
                    if (numberUsers() >= 49) { // 50 users is the max. (In this script)
                        socket.emit('showErrorUsername', {
                            message: '* The room is full'
                        });
                    } else { // If chat-room is not fully, add the user at the list and emit a message of welcome.
                        socket.username = data.username;
                        socket.emit('loginUser', (data));
                        addNewUser(socket.id, socket.username);
                        // Replace ( socket.emit and - socket.broadcast.emit ) BY io.sockets.emit()
                        socket.emit('refreshUserList', users);
                        socket.broadcast.emit('refreshUserList', users);
                    }
                }
            }
        });

        // Emit message when user connect
        socket.on('greetingMessage', () => {
            // Replace ( socket.emit and - socket.broadcast.emit ) BY io.sockets.emit()
            socket.emit('greetingMessage', {
                username: socket.username,
                message: 'Connected :)'
            });
            socket.broadcast.emit('greetingMessage', {
                username: socket.username,
                message: 'Connected :)'
            });
        });

        // Listen when user disconnect
        // The user must be register on the list of user for emit message when disconnect
        socket.on('disconnect', () => {
            if (existUser(socket.username)) {
                removeUser(socket.username);
                // Replace ( socket.emit and - socket.broadcast.emit ) BY io.sockets.emit()
                socket.broadcast.emit('greetingMessage', {
                    username: socket.username,
                    message: 'Disconnected :('
                });
                // Replace ( socket.emit and - socket.broadcast.emit ) BY io.sockets.emit()
                socket.emit('refreshUserList', users);
                socket.broadcast.emit('refreshUserList', users);
            }
            
        });
    });
};