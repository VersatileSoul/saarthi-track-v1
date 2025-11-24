let ioInstance = null;

const initializeSocket = (io) => {
    ioInstance = io;

    // setting up the server
    ioInstance.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);
        
        // Join station room
        socket.on('join:station', (stationId) => {
            socket.join(`station:${stationId}`);
            console.log(`✅ Client ${socket.id} joined station: ${stationId}`);
        });

        // Join assignment room
        socket.on('join:assignment', (assignmentId) => {
            socket.join(`assignment:${assignmentId}`);
            console.log(`✅ Client ${socket.id} joined assignment: ${assignmentId}`);
        });

        // Join user room (for personal notifications)
        socket.on('join:user', (userId) => {
            socket.join(`user:${userId}`);
            console.log(`✅ Client ${socket.id} joined user: ${userId}`);
        });

        // Leave station room
        socket.on('leave:station', (stationId) => {
            socket.leave(`station:${stationId}`);
            console.log(`❌ Client ${socket.id} left station: ${stationId}`);
        });

        // Leave assignment room
        socket.on('leave:assignment', (assignmentId) => {
            socket.leave(`assignment:${assignmentId}`);
            console.log(`❌ Client ${socket.id} left assignment: ${assignmentId}`);
        });

        // Leave user room
        socket.on('leave:user', (userId) => {
            socket.leave(`user:${userId}`);
            console.log(`❌ Client ${socket.id} left user: ${userId}`);
        });

        // Handle disconnection
        socket.on('disconnect', (socket) => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });

        // Handle error
        socket.on('error', (error) => {
            console.error(`❌ Socket error: ${error.message}`);
        });
    });

    return ioInstance;
};

// Helper functions to emit events 
const emitToStation = (stationId, event, data) => {
    if(ioInstance) {
        const roomName = `station:${stationId}`;
        console.log(`📡 Emitting ${event} to station: ${roomName}`);
        const room = ioInstance.sockets.adapter.rooms.get(roomName);
        // what is room? it is a set of socket ids that are in the room
        // so we can iterate over the room and emit the event to each socket
        if(room) {
            console.log(`📡 Emitting ${event} to ${room.size} clients in station: ${stationId}`);
        }
        else {
            console.log(`❌ No clients found in station: ${stationId}`);
        }
        ioInstance.to(roomName).emit(event, data);
        // what is ioInstance.to(roomName)? it is a method that emits the event to all sockets in the room
        // so we can emit the event to all sockets in the room
        console.log(`📡 Emitted ${event} to ${room.size} clients in station: ${stationId}`);
    }
    else {
        console.log(`❌ Cannot emit ${event} to station: ${stationId}. Socket.io not initialized`);
    }
};

const emitToAssignment = (assignmentId, event, data) => {
    if(ioInstance) {
        ioInstance.to(`assignment:${assignmentId}`).emit(event, data);
        console.log(`📡 Emitted ${event} to ${assignmentId}`);
    }
    else {
        console.log(`❌ Cannot emit ${event} to assignment: ${assignmentId}. Socket.io not initialized`);
    }
};

const emitToUser = (userId, event, data) => {
    if(ioInstance) {
        ioInstance.to(`user:${userId}`).emit(event, data);
        console.log(`📡 Emitted ${event} to user: ${userId}`);
    }
    else {
        console.log(`❌ Cannot emit ${event} to user: ${userId}. Socket.io not initialized`);
    }
};

const emitToAll = (event, data) => {
    if(ioInstance) {
        ioInstance.emit(event, data);
        console.log(`📡 Emitted ${event} to all clients`);
    }
    else {
        console.log(`❌ Cannot emit ${event} to all clients. Socket.io not initialized`);
    }
};

module.exports = {
    initializeSocket,
    emitToStation,
    emitToAssignment,
    emitToUser,
    emitToAll,
};