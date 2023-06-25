import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

export function changeExtension(filePath, newExt) {
  let baseName = path.basename(filePath, path.extname(filePath));
  return path.join(path.dirname(filePath), baseName + newExt);
}

export function write(
  outPath /*:string*/,
  content /*:string*/,
  overwrite = false
) {
  if (outPath === "-") {
    process.stdout.write(content);
  } else {
    writeToFile(outPath, content, overwrite);
  }
}

export function writeToFile(
  filename /*: string*/,
  content /*: string*/,
  overwrite = false
) {
  try {
    // Check if file exists
    if (existsSync(filename)) {
      if (!overwrite) {
        console.log(
          `${filename} already exists, and overwrite flag is not set (use '-f' to force).`
        );
        return;
      }
    }

    // Write to file
    writeFileSync(filename, content, {
      encoding: "utf-8",
      flag: overwrite ? "w" : "wx",
    });
  } catch (err) {
    if (err.code === "EACCES") {
      throw new Error("Permission denied, cannot write to file.");
    } else {
      throw new Error(
        "An error occurred during file write operation: " + err.message
      );
    }
  }
}
