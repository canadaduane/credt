import { lstatSync } from "fs";
import path from "path";
import mime from "mrmime";

/**
 * @property {Function} isDirectory
 * @property {Date} mtime
 * @property {number} size
 */

/**
 * @param {string} filePath
 * @returns {{filePath: string, lastModified: string, size: number, contentType: string} | undefined}
 */
export const getFileStats = (filePath) => {
  const stats = lstatSync(filePath, { throwIfNoEntry: false });

  if (!stats || stats.isDirectory()) {
    return;
  }
  const fileExtension = path.extname(filePath);
  const contentType = mime.lookup(fileExtension) || "application/octet-stream";
  const { mtime, size } = stats;
  const lastModified = mtime.toUTCString();

  return { filePath, lastModified, size, contentType };
};
