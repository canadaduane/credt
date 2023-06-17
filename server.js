import { fileURLToPath } from "url";
import { dirname, join } from "path";
import startServer from "chef-uws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appPath = join(__dirname, "build");

/**
 * @type {Global.WSPlugin}
 */
const shelfMergePlugin = function (ws, { id, event, data }) {
  // broadcast to all sockets inside this topic
  console.log({ this: this });
  this.to("shelf").emit(event, id, data);
};

const server = await startServer({
  debug: process.argv.includes("--debug"),
  port: Number(process.env.PORT || 4200),
  plugins: {
    shelf: shelfMergePlugin,
  },
  join: "/join",
  leave: "/leave",
  folder: appPath, //static files
  maxCacheSize: 0,
});

server.any(
  "/*",

  /**
   *
   * @param {Global.HttpResponse} res
   * @param {Global.HttpRequest} req
   */
  (res, req) => {
    res.end("200 OK");
  }
);
