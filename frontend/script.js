// @ts-check

import { LiveTable } from './live-table.js';

const statusElement = document.querySelector('.status');
const statsElement = document.querySelector('.stats');
const contentTable = document.querySelector('.content-table');

const tableSize = {
  width: 30,
  height: 10,
};
// ms between updates of the table
const TABLE_REFRESH_INTERVAL = 200;
// ms between updates of the status bar
const STATUS_REFRESH_INTERVAL = 200;

init();

function init() {
  if (!statusElement || !statsElement || !contentTable) {
    console.error('Basic elements not found. Check the selectors');
    if (statusElement) {
      reportStatus('Initialization error. Check the console', false);
    }
    return;
  }

  const liveTable = new LiveTable(contentTable);
  liveTable.createStructure(tableSize);

  let messagesReceived = 0;
  let connectionBeginTimestamp = 0;

  const socket = new WebSocket(`ws://${window.location.host}`);

  reportStatus('Connecting to the server');

  socket.addEventListener('open', () => {
    reportStatus('Connected to the server');

    sendSocketMessage({
      type: 'ready',
      tableSize,
    });

    connectionBeginTimestamp = Date.now();

    // NOTE: intervals are not cleared on purpose to keep the demo complexity low
    setInterval(() => {
      liveTable.refreshCells();
    }, TABLE_REFRESH_INTERVAL);
    setInterval(() => {
      const elapsedMs = Date.now() - connectionBeginTimestamp;
      const elapsedSecondsSinceStart = Math.round(elapsedMs / 10) / 100;
      const messagesPerSecond = (messagesReceived / elapsedMs) * 1000;
      statsElement.textContent = `Received messages: ${messagesReceived} in ${elapsedSecondsSinceStart} seconds (${Math.round(
        messagesPerSecond
      )} messages/s, ${Math.round(messagesPerSecond * 60)} messages/min)`;
    }, STATUS_REFRESH_INTERVAL);
  });

  // NOTE: removing event listeners is omitted on purpose to keep the demo complexity low

  socket.addEventListener('message', ({ data }) => {
    messagesReceived++;

    // NOTE: parsing errors are ignored on purpose to keep the demo complexity low
    const parsedMessage = JSON.parse(data);

    if (parsedMessage.type !== 'table update') {
      console.log('Unknown message type received', parsedMessage.type);
      return;
    }

    liveTable.setState(parsedMessage.updateData);
  });

  socket.addEventListener('error', (event) => {
    reportStatus('Socket error, check the console', false);
    console.error('Socket error', event);
  });

  socket.addEventListener('close', () => {
    reportStatus('Socket connection closed. Refresh the page to start again');
  });

  function sendSocketMessage(message) {
    if (socket.readyState !== WebSocket.OPEN) {
      console.error(
        'Cannot send a message to the socket in state',
        socket.readyState
      );
      reportStatus('Internal error, check the console', false);
      return;
    }
    socket.send(JSON.stringify(message));
  }
}

function reportStatus(status, logToConsole = true) {
  statusElement.textContent = status;
  if (logToConsole) {
    console.log(status);
  }
}
