# ts-dot-js VSCode Extension

This extension provides syntax highlighting and language support for plain javascript files with **comments that include typescript** annotations. Features are enabled with the extension ".ts.js", or via `tsconfig.json` (see below).


## What is a .ts.js file?

The purpose of this extension is to reap the benefits of type checking your project, but without a typescript compile or build step. How? By embedding type annotations only in javascript comments.

For example, the following is a valid Javascript file that can run in node or the browser, without a compile step:

```js
/*+
 type Greeting = "hi" | "hello"
 type A = X
*/

let firstname /*: string*/ = "Alan";
let lastname /*: string*/ = "Turing";

function greet(name /*: string */, hello /*: Greeting */) {
  console.log(helo, name);
}

greet(firstname, "yo")
```

The typescript annotations in the javascript file above are ignored completely by the javascript interpreter. But with ts-dot-js, VSCode can "see" the type annotations and give you type hints and error markings.

<img src="https://github.com/canadaduane/credt/tree/main/packages/ts-dot-js/vscode-extension/docs/language-highlight.png" width="600" alt="javascript with typescript comments">

This is similar to the intent behind JSDoc annotations in Javascript files, but it is easier to use and more comprehensive, because ts-dot-js syntax does not require special syntax other than typescript and `/*+ */` or `/*: */`.

## Using tsconfig.json

If you'd like to use this on plain `.js` files, you can add the following configuration to a `tsconfig.json` file in the root of your project:

```json
{
  "compilerOptions": {
    "customConditions": ["ts-dot-js"]
  }
}
```

Credit to [Lucio M. Tato](https://github.com/luciotato/plus-typescript) for the plus-typescript idea from which this extension derives in spirit.
