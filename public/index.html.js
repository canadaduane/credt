import { ssrRender } from "./ssr.js";

import { o, html } from "sinuous";
import { hydrate } from "sinuous/hydrate";

// const html =
//   typeof global === "object"
//     ? (await import("sinuous/hydrate")).dhtml
//     : (await import("sinuous")).html;

/** @typedef {{id: number, text: string}} Item */

const TodoApp = () => {
  let items = o([]);
  let text = o("");

  const view = html`
    <div id="todo-div">
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
    /** @type {Item} */
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
};

/**
 *
 * @param {{items: import('sinuous/observable').Observable<Item[]>}} param0
 * @returns
 */
const TodoList = ({ items }) => {
  return html`
    <ul>
      ${items().map((item) => html`<li id=${item.id}>${item.text}</li>`)}
    </ul>
  `;
};

const app = TodoApp();

if (app instanceof Node) document.querySelector(".todos")?.append(app);
else hydrate(app);

ssrRender(import.meta.url);
