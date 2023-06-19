import uws, { DEDICATED_COMPRESSOR_3KB } from "uWebSockets.js";

uws
  .App()
  .ws("/*", {
    compression: DEDICATED_COMPRESSOR_3KB,

    message: (ws, message, isBinary) => {
      let ok = ws.send(message, isBinary, true);
    },
  })
  .get("/*", (res, req) => {
    res
      .writeStatus("200 OK")
      .writeHeader("IsExample", "Yes")
      .end("Hello there!");
  })
  .listen(9001, (listenSocket) => {
    if (listenSocket) {
      console.log("Listening to port 9001");
    }
  });
