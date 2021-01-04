# Webapp for WebSocket performance demo

A simple web application written in plain JS (no frameworks) that communicates with a web server
using WebSockets.

It displays a table, whose cells are updated with values coming live from the server.

The web application is served by the index route of the web servers (<http://localhost:3000>).

Updates are flushed to the screen every `TABLE_REFRESH_INTERVAL` ms. This means that even if there
are a lot of updates from the server, they will be reflected in the internal table values cache, and
displayed all at once, after a short delay.

## Configuration

### Table size

To change the table size, change the `tableSize` variable in [script.js](./script.js).

### Refresh interval

To change the time between table updates, change the `TABLE_REFRESH_INTERVAL` variable in
[script.js](./script.js).
