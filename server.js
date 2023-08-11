const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/actions/Actions');

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[ socketId ]
        };
    });
}

io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[ socket.id ] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);

        if (Array.isArray(clients)) {
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.JOINED, {
                    clients,
                    username,
                    socketId: socket.id,
                });
            });
        } else {
            console.log('Clients data is not an array:', clients);
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Listening on port ${PORT}`)
);