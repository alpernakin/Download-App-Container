import http from 'http';

import initIO from './socket.js';
import config from './app.config.js';

// here start the connection with mongodb
import './mongodb/connection.js';
// here init the express server
import app from './app.js';

// create the HTTP Server through express app
var server = http.createServer(app);
// initialize the sockets
var _io = initIO(server);
// start to listen API requests through HTTP Server
server.listen(config.app.port, () =>
    console.log(`[The Server Started] the port: [${server.address().port}]`));