import path from "path";
import { getFileStats } from "./getFileStats.js";
import { streamFile } from "./streamFile.js";

/**
 * @property {string} contentType
 * @property {string} lastModified
 */

/**
 * @param {string} dir
 * @returns {(res: server.HttpResponse, req: server.HttpRequest) => void}
 */
export const serveDir = (dir) => (res, req) => {
  try {
    const url = req.getUrl().slice(1) || "index.html";
    const filePath = path.resolve(dir, url);
    const isFileOutsideDir = filePath.indexOf(path.resolve(dir)) !== 0;

    if (isFileOutsideDir) {
      res.writeStatus("403");
      res.end();
      return;
    }

    const fileStats = getFileStats(filePath);

    if (!fileStats) {
      res.writeStatus("404");
      res.end();
      return;
    }

    const { contentType, lastModified } = fileStats;
    const ifModifiedSince = req.getHeader("if-modified-since");

    if (ifModifiedSince === lastModified) {
      res.writeStatus("304");
      res.end();
      return;
    }

    res.writeHeader("Content-Type", contentType);
    res.writeHeader("Last-Modified", lastModified);

    streamFile(res, fileStats);
  } catch (error) {
    res.writeStatus("500");
    if (error instanceof Error) {
      res.end(error.toString());
    } else {
      res.end("Unknown error");
    }
  }
};
