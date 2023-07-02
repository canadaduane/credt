import { readFileSync } from "fs";
import { replaceMultilineComments } from "./comments.ts.js";
import { changeExtension, removeExtension, write } from "./utils.ts.js";
import assert from "assert";

function printHelp() {
  console.log(`
This program replaces multiline typescript comments with just the typescript.

Usage: ts-dot-js [--spaces] [-h | --help] INPUT

Options:
  INPUT                The name of the file to process, or "-" for stdin (default: "-")
  -o, --output OUTPUT  Send output to OUTPUT file, or "-" for stdout (default: INPUT%.ts)
  --force (-f)         If OUTPUT file exists, overwrite it
  --spaces             Add spaces in place of block comment markers /* and */
  -h, --help           Show help
`);
}

let useSpacesFlag = false;
let overwriteFlag = false;
let inPath = "-";
let outPath /*: string | null*/ = null;

let i = 2;
while (i < process.argv.length) {
  const arg = process.argv[i];
  switch (arg) {
    case "-h":
    case "--help":
      printHelp();
      process.exit(0);
    case "--spaces":
      useSpacesFlag = true;
      break;
    case "-f":
    case "--force":
      overwriteFlag = true;
      break;
    case "-o":
    case "--output":
      i++;
      if (i < process.argv.length) {
        outPath = process.argv[i];
      } else {
        console.log(`Output file expected`);
      }
    default:
      if (arg.startsWith("-")) {
        console.log(`Unrecognized option: ${process.argv[i]}`);
        printHelp();
        process.exit(1);
      } else {
        inPath = arg;
      }
  }
  i++;
}

if (outPath == null) {
  if (inPath === "-") {
    outPath = "-";
  } else {
    if (inPath.endsWith(".ts.js")) outPath = removeExtension(inPath, ".js");
    else if (inPath.endsWith(".js")) outPath = changeExtension(inPath, ".ts");
    else throw Error(`Unknown extension: ${inPath}`);
  }
}

function transform(input /*:string*/, ws = true) {
  return replaceMultilineComments(input, (s /*: string*/) => {
    if (s.startsWith("/*:")) {
      return (ws ? "  " : "") + s.slice(2, s.length - 2) + (ws ? "  " : "");
    } else if (s.startsWith("/*+")) {
      return (ws ? "   " : "") + s.slice(3, s.length - 2) + (ws ? "  " : "");
    } else {
      return s;
    }
  });
}

let inputData /*: string*/ = "";

if (inPath === "-") {
  process.stdin.on("readable", () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      inputData += chunk;
    }
  });

  process.stdin.on("end", () => {
    const content = transform(inputData, useSpacesFlag);

    assert(outPath);
    write(outPath, content, overwriteFlag);
  });
} else {
  inputData = readFileSync(inPath, "utf-8");
  const content = transform(inputData, useSpacesFlag);

  assert(outPath);
  write(outPath, content, overwriteFlag);
}
