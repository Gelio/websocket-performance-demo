# Node WebSocket server example

A WebSocket demo server written in [Node.js](https://nodejs.org/en/) that interacts with
[the webapp](../../frontend)

## Installing the dependencies

To install server's dependencies, run:

```sh
npm install
```

## Running the server

Run:

```sh
node index.js
```

and then go to <http://localhost:3000>.

## Configuration

### Messages per minute

To change the number of messages sent per minute, change the `MESSAGES_PER_MINUTE` variable in
[index.js](./index.js).

### Port

You can set the port that the server will bind to by changing the `PORT` envinronment variable,
e.g.:

```sh
PORT=8000 node index.js
```
