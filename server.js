import { App } from "@tinyhttp/app";
import { tinyws } from "tinyws";

/**
 * @type {App<any, import('@tinyhttp/app').Request & import('tinyws').TinyWSRequest>}
 */
const app = new App();

app.use(tinyws());

app.use("/ws", async (req, res) => {
  if (req.ws) {
    const ws = await req.ws();

    return ws.send("hello there");
  } else {
    res.send("Hello from HTTP!");
  }
});

app.use("/", async (req, res) => {
  res.appendHeader("Content-Type", "text/html");
  res.end("Home");
});

app.listen(3000);
