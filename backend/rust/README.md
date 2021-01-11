# Rust WebSocket server example

A WebSocket demo server written in [Rust](https://www.rust-lang.org/) that interacts with
[the webapp](../../frontend)

## Running the server

Run:

```sh
cargo run
```

and then go to <http://localhost:3000>.

## Configuration

### Messages per minute

To change the number of messages sent per minute, change the `MESSAGES_PER_MINUTE` variable in
[src/deno_ws.rs](./src/deno_ws.rs).

### Port

You can set the port that the server will bind to by changing the `PORT` envinronment variable,
e.g.:

```sh
PORT=8000 cargo run
```
