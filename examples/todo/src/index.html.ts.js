/*+ import { Item } from "./types.ts" */
import { mount, html, observable as o } from "@credt/core";
import { TodoList } from "./TodoList.ts.js";

await mount({
  rootImports: [import.meta.url],
  head: () => {
    return html`<link rel="stylesheet" href="/sakura-dark.css" />`;
  },
  body: () => {
    const items = o/*+<Item[]>*/([]);
    const text = o("");

    const view = html`
      <div>
        <h3>TODO</h3>
        <${TodoList} items=${items} />
        <form onsubmit=${handleSubmit}>
          <label htmlFor="new-todo"> What needs to be done? </label>
          <input id="new-todo" onchange=${handleChange} value=${text} />
          <button>Add #${() => items().length + 1}</button>
        </form>
      </div>
    `;

    function handleSubmit(e/*: SubmitEvent*/) {
      e.preventDefault();
      if (!text().length) {
        return;
      }
      /** @type {public.Item} */
      const newItem = {
        text: text(),
        id: Date.now(),
      };
      items(items().concat(newItem));
      text("");
    }

    function handleChange(e/*: InputEvent*/) {
      if (e.target instanceof HTMLInputElement) {
        text(e.target?.value);
      }
    }

    return view;
  },
});
