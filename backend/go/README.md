# Go WebSocket server example

A WebSocket demo server written in [golang](https://golang.org/) that interacts with
[the webapp](../../frontend)

## Running the server

Run:

```sh
go run main.go
```

and then go to <http://localhost:3000>.

## Configuration

### Messages per minute

To change the number of messages sent per minute, change the `messagesPerMinute` variable in
[main.go](./main.go).
