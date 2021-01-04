import { serve } from "https://deno.land/std@0.83.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.83.0/ws/mod.ts";
import { Status as HttpStatus } from "https://deno.land/std@0.58.0/http/http_status.ts";

import { doesFileExist, serveFile } from "./static_files_server.ts";
import { handleWebSocketConnection } from "./ws_handler.ts";

const frontendDirectory = Deno.realPathSync("../../frontend");

const port = getPort();
const s = serve({ port });
console.log(`Serving at http://localhost:${port}/`);

for await (const req of s) {
  if (req.headers.get("Upgrade") === "websocket") {
    acceptWebSocket({
      bufReader: req.r,
      bufWriter: req.w,
      conn: req.conn,
      headers: req.headers,
    })
      .then(handleWebSocketConnection).catch((error) => {
        console.log("Failed to accept a WebSocket connection", error);

        return req.respond(
          {
            status: HttpStatus.BadRequest,
            body: "Could not accept a WebSocket connection",
          },
        );
      });
    continue;
  }

  const possibleFilePath = `${frontendDirectory}/${
    req.url === "/" ? "index.html" : req.url.slice(1)
  }`;

  if (await doesFileExist(possibleFilePath)) {
    const content = await serveFile(req, possibleFilePath);
    await req.respond(content);
    continue;
  }

  await req.respond({
    status: HttpStatus.BadGateway,
    body: "File not found, and the connection is not a WebSocket connection.",
  });
}

function getPort() {
  const DEFAULT_PORT = 3000;
  const port = Deno.env.get("PORT");

  if (port === undefined) {
    return DEFAULT_PORT;
  }

  return parseInt(port, 10);
}
