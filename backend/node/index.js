// @ts-check
const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const httpServer = http.createServer(app);

const PORT = parseInt(process.env.PORT, 10) || 3000;
const MESSAGES_PER_MINUTE = 20000;
// Max value to appear in the table
const MAX_TABLE_VALUE = 100;

const MESSAGE_INTERVAL = 60000 / MESSAGES_PER_MINUTE;

const frontendPath = path.join(__dirname, '../../frontend');

app.use(express.static(frontendPath));

const wss = new WebSocket.Server({ server: httpServer });

/**
 * @param {WebSocket} socket
 */
const handleNewConnection = (socket) => {
  console.log('a user connected');
  let intervalId = null;

  socket.on('message', (rawMessage) => {
    if (typeof rawMessage !== 'string') {
      console.log('Unknown message type', rawMessage);
      return;
    }

    // NOTE: parsing errors are consciously ignored in this demo
    const message = JSON.parse(rawMessage);
    if (message.type !== 'ready') {
      console.log('Unknown message type', message.type);
      return;
    }

    if (intervalId != null) {
      console.log('Ignoring the duplicated `ready` message');
      return;
    }

    console.log(
      'Beginning to generate messages for table size',
      message.tableSize
    );

    intervalId = setInterval(() => {
      socket.send(
        JSON.stringify({
          type: 'table update',
          updateData: getRandomTableUpdate(message.tableSize),
        })
      );
    }, MESSAGE_INTERVAL);
  });

  socket.once('close', () => {
    console.log('A user disconnected');
    clearInterval(intervalId);
    socket.removeAllListeners();
  });

  socket.on('error', (error) => {
    console.log('Error occurred', error);
  });
};

wss.on('connection', handleNewConnection);

httpServer.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

const getRandomTableUpdate = (tableSize) => {
  const row = Math.floor(Math.random() * tableSize.height);
  const column = Math.floor(Math.random() * tableSize.width);
  const value = Math.floor(Math.random() * MAX_TABLE_VALUE) + 1;

  return { row, column, value };
};
