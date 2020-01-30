import socketio from 'socket.io-client';

const socket = socketio('http://192.168.1.5:3333', {
    autoConnect: false,
});

function subscribeToNewDevs(subscribeFunction) {
    socket.on('new-dev', subscribeFunction);
}

function connect(latitude, longitude, stack) {
    socket.io.opts.query = {
        latitude,
        longitude,
        stack,
    };

    socket.connect();
}

function disconnect() {
    if (socket.connected) {
        socket.disconnect;
    }
}

export {
    connect,
    disconnect,
    subscribeToNewDevs,
};