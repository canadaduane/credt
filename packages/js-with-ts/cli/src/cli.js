import { replaceMultilineComments } from "./comments.js";

function printHelp() {
  console.log(`
This program replaces multiline typescript comments with just the typescript.

Usage: jswithts [--spaces] [-h | --help]

Options:
  --spaces    Add spaces in place of block comment markers /* and */
  -h, --help  Show help
`);
}

let useSpacesFlag = false;

for (let i = 2; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case "-h":
    case "--help":
      printHelp();
      process.exit(0);
    case "--spaces":
      useSpacesFlag = true;
      break;
    default:
      console.log(`Unrecognized option: ${process.argv[i]}`);
      printHelp();
      process.exit(1);
  }
}

let inputData = "";

process.stdin.on("readable", () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    inputData += chunk;
  }
});

process.stdin.on("end", () => {
  let outputData = replaceMultilineComments(inputData, (s) => {
    if (s.startsWith("/*:")) {
      return (
        (useSpacesFlag ? "  " : "") +
        s.slice(2, s.length - 2) +
        (useSpacesFlag ? "  " : "")
      );
    } else if (s.startsWith("/*+")) {
      return (
        (useSpacesFlag ? "   " : "") +
        s.slice(3, s.length - 2) +
        (useSpacesFlag ? "  " : "")
      );
    } else {
      return s;
    }
  });
  process.stdout.write(outputData);
});
