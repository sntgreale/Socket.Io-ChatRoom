const path = require('path');
const express = require('express');
const app = express();
const socketIO= require('socket.io');

// Configuration
app.set('port', process.env.PORT || 3000);

// File static:  Root folder where browser will get all its resources
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(app.get('port'),() => {
    console.log('Server on port: ' + app.get('port'));
})

const io = socketIO(server);

require('./module/sockets')(io);
