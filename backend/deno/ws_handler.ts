import {
  isWebSocketCloseEvent,
  WebSocket,
} from "https://deno.land/std@0.83.0/ws/mod.ts";

const MESSAGES_PER_MINUTE = 20000;
const MESSAGE_DELAY = 60000 / MESSAGES_PER_MINUTE;
const MAX_TABLE_VALUE = 100;

export async function handleWebSocketConnection(ws: WebSocket) {
  console.log("new connection");
  const clientState: ClientState = {
    ready: false,
    intervalId: null,
  };

  try {
    for await (const message of ws) {
      if (typeof message === "string") {
        let parsedMessage: unknown;
        try {
          parsedMessage = JSON.parse(message);
        } catch (error) {
          console.log("Error when parsing a JSON message", message, error);
          continue;
        }

        if (isReadyMessage(parsedMessage)) {
          if (clientState.ready) {
            console.log("Duplicate ready message received. Ignoring");
            continue;
          }

          const { tableSize } = parsedMessage;
          clientState.ready = true;

          clientState.intervalId = setInterval(() => {
            if (ws.isClosed) {
              clearInterval(clientState.intervalId!);
              return;
            }

            ws.send(
              JSON.stringify(
                generateTableUpdateMessage(tableSize),
              ),
            );
          }, MESSAGE_DELAY);
          continue;
        }

        console.log("Unknown message received:", parsedMessage);
      } else if (isWebSocketCloseEvent(message)) {
        console.log("Connection closed", message);
        return;
      } else {
        console.log("Unknown websocket message received", message);
      }
    }
  } catch (error) {
    console.log("Failed to receive frame:", error);
    if (clientState.intervalId) {
      clearInterval(clientState.intervalId);
    }

    if (!ws.isClosed) {
      return ws.close(1000, "failed to receive frame").catch((closeError) =>
        console.error("Could not close the WebSocket connection:", closeError)
      );
    }
  }
}

interface ClientState {
  ready: boolean;
  intervalId: number | null;
}

interface TableSize {
  width: number;
  height: number;
}

interface ReadyMessage {
  type: "ready";
  tableSize: TableSize;
}

function isReadyMessage(message: unknown): message is ReadyMessage {
  return typeof message === "object" &&
    (message as ReadyMessage | null)?.type === "ready";
}

interface TableUpdateMessage {
  type: "table update";
  updateData: {
    row: number;
    column: number;
    value: number;
  };
}

function generateTableUpdateMessage(tableSize: TableSize): TableUpdateMessage {
  return {
    type: "table update",
    updateData: {
      row: Math.floor(Math.random() * tableSize.height),
      column: Math.floor(Math.random() * tableSize.width),
      value: Math.round(Math.random() * MAX_TABLE_VALUE),
    },
  };
}
