// @ts-check

// Credit goes to https://github.com/DrewML/es-comments

/*+
type Comment = {
  value: string
  start: number
  end: number
}
*/

export class ESCommentsParser {
  /*+
  input: string
  position: number 
  comments: Comment[]
  */

  constructor(input /*: string*/) {
    this.input = input;
    this.position = 0;
    this.comments = [];
  }

  isDone() {
    return this.position > this.input.length;
  }

  currentChar() {
    return this.input[this.position];
  }

  prior() {
    return this.input[this.position - 1];
  }

  next(moveForwardBy = 1) {
    this.position = this.position + moveForwardBy;
  }

  moveToEndOfString() {
    const quoteChar = this.currentChar();
    this.next();

    while (true) {
      if (this.isDone()) break;
      if (this.currentChar() === quoteChar && this.prior() !== "\\") {
        this.next();
        break;
      }
      this.next();
    }
  }

  parse() /*: ESCommentsParser */ {
    while (true) {
      if (this.isDone()) break;

      const currentChar = this.currentChar();
      if (currentChar === '"' || currentChar === "'") {
        this.moveToEndOfString();
        continue;
      }

      if (currentChar !== "/") {
        this.next();
        continue;
      }

      const next = this.input[this.position + 1];
      if (next === "*") {
        this.parseMultilineComment();
      } else {
        this.next();
      }
    }

    return this.isDone() ? this : this.parse();
  }

  parseMultilineComment() {
    const buf = ["/*"];
    const { position: start } = this;
    // Skip first two characters already in buf
    this.next(2);

    while (true) {
      if (this.isDone()) break;

      const currentChar = this.currentChar();
      const atCommentEnd = currentChar === "/" && this.prior() === "*";

      buf.push(currentChar);
      this.next();

      if (atCommentEnd) break;
    }

    this.comments.push({
      value: buf.join(""),
      start,
      end: this.position,
    });
  }
}

export function replaceMultilineComments(
  input /*: string */,
  fn /*: (comment: string) => string */
) {
  const parser = new ESCommentsParser(input);
  let start = 0;
  let output = "";
  for (let comment of parser.parse().comments) {
    if (comment.start > start) {
      output += input.slice(start, comment.start);
    }
    output += fn(comment.value);
    start = comment.end;
  }
  output += input.slice(start);
  return output;
}
