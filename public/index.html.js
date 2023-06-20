import { credit } from "./credit.js";

import { subscribe } from "sinuous/observable";

/**
 * - Be able to pass `html` or `dhtml` in, depending on context
 * - In SSR case,
 *   - send the components' DOM as string to console.log
 * - in CSR case,
 *   - add self JS file to importmap
 *   - hydrate the components' DOM
 */

const { isServer, html, o, attach } = await credit(import.meta.url);

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
  subscribe(() => {
    if (!isServer) console.log("items", items());
  });
  return html`
    <ul>
      ${() => items().map((item) => html`<li id=${item.id}>${item.text}</li>`)}
    </ul>
  `;
};

const app = TodoApp();

attach(".todos", app);

// const container = document.querySelector(".todos");
// if (!isServer) {
//   console.log("appending app to .todos");
//   container?.append(app);
// } else {
//   // console.log("hydrating app");
//   // hydrate(app, container);
//   container?.append(app);
// }

// render(import.meta.url, { ssr: false });
