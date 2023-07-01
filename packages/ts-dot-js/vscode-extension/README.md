# ts-dot-js VSCode Extension

This extension provides syntax highlighting and language server support for plain javascript files, with **comments that include typescript** annotations.

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

The typescript annotations in the javascript file above are ignored completely by the javascript interpreter. But what if they could be used by VSCode to augment a javascript file to be more like a typescript coding experience?

<img src="./docs/language-highlight.png" width="600" alt="javascript with typescript comments">

This is similar to the intent behind jsdoc annotations in Javascript files, but is easier to use and more comprehensive, because it does not require special syntax other than typescript and `/*+ */` or `/*: */`.

Credit to [Lucio M. Tato](https://github.com/luciotato/plus-typescript) for the plus-typescript idea from which this extension derives in spirit.
