import path from "node:path";
import url from "node:url";
import { readFile as _readFile } from "node:fs/promises";

/**
 *
 * @param {string} filename
 * @param {string | null} relativeUrl Can be used to pass `import.meta.url` of calling file
 * @returns {Promise<string>}
 */
export async function readFile(filename, relativeUrl = null) {
  // Determine the directory of the current module
  const dirname = path.dirname(
    url.fileURLToPath(relativeUrl ?? import.meta.url)
  );

  // Construct the absolute path of the file
  const filepath = path.join(dirname, filename);

  // Read the file
  return await _readFile(filepath, "utf8");
}
