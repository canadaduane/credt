import path from "node:path";
import url from "node:url";
import { App, DEDICATED_COMPRESSOR_3KB } from "uWebSockets.js";
import { serveDir } from "./server/serveDir.js";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const publicPath = path.resolve(dirname, "public");

const serveStatic = serveDir(publicPath);

App()
  .ws("/*", {
    compression: DEDICATED_COMPRESSOR_3KB,

    message: (ws, message, isBinary) => {
      let ok = ws.send(message, isBinary, true);
    },
  })
  .get("/*", serveStatic)
  .listen(9001, (listenSocket) => {
    if (listenSocket) {
      console.log("Listening to port 9001");
    }
  });
