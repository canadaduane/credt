import { Server } from "@hocuspocus/server";
import { SQLite as HocuspocusSqlite } from "@hocuspocus/extension-sqlite";

const server = Server.configure({
  port: 3000,

  async onConnect() {
    console.log("Server started 🔮 ...");
  },

  async onRequest({ request, response, instance }) {
    console.log(request.url);
    response.writeHead(200, { "Content-Type": "text/html" });

    const html = await import("./app/index.js");
    response.end(html);
  },

  extensions: [new HocuspocusSqlite({ database: "db.sqlite" })],
});

server.listen();
