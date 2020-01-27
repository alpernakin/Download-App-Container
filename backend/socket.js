import io from 'socket.io';
import { serviceInstance } from './services/download.service.js';

// initialize socket IO through HTTP Server
// returns the socket IO object
export default function initIO(server) {

    var _io = io(server);

    // socket IO event handling
    _io.on('connection', (socket) => {
        console.log(`[Socket Connection] [${socket.id}]`);
        // bind the events
        socket.on('disconnect', (reason) => {
            console.log(`[Socket Disconnected] [${socket.id}]`);
            console.log(reason);
        });
        socket.on('error', (error) => {
            console.log(`[Socket Error] [${socket.id}]`);
            console.log(error);
        });
        socket.on('connect_timeout', (timeout) => {
            console.log(`[Socket Timeout] [${socket.id}]`);
            console.log(timeout);
        });
    });

    let eventId = "download_data_stream";
    let acceptedOperationType = "insert";
    console.log(`[Data Stream Initialization] accepted operation type: [${acceptedOperationType}] on event id: [${eventId}]`);
    // start the data streaming through socket IO
    serviceInstance.streamChangeOn(_io, acceptedOperationType, eventId)
        .then(_ => console.log("[Data Stream Initialized]"))
        .catch(err => console.log(err));

    return _io;
}