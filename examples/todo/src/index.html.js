import { mount, html, observable as o } from "credit";
import { TodoList } from "./TodoList.js";

await mount({
  rootImports: [import.meta.url],
  head: ({ builtins }) => {
    return html`
      ${builtins}
      <link rel="stylesheet" href="/sakura-dark.css" />
    `;
  },
  body: () => {
    /** @type {public.Item[]} */
    const emptyList = [];
    const items = o(emptyList);
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

    /**
     *
     * @param {SubmitEvent} e
     */
    function handleSubmit(e) {
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

    /**
     *
     * @param {InputEvent} e
     */
    function handleChange(e) {
      if (e.target instanceof HTMLInputElement) {
        text(e.target?.value);
      }
    }

    return view;
  },
});
