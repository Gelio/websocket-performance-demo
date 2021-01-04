# Deno WebSocket server example

A WebSocket demo server written in [deno](https://deno.land/) that interacts with
[the webapp](../../frontend)

## Running the server

Run:

```sh
deno run --allow-read --allow-env --allow-net  main.ts
```

and then go to <http://localhost:3000>.

## Configuration

### Messages per minute

To change the number of messages sent per minute, change the `MESSAGES_PER_MINUTE` variable in
[ws_handler.ts](./ws_handler.ts).

Due to `setInterval` limitations, going above 50000 messages per minute yields no results.

### Port

You can set the port that the server will bind to by changing the `PORT` envinronment variable,
e.g.:

```sh
PORT=8000 deno run --allow-read --allow-env --allow-net  main.ts
```
