import { credit } from "./credit.js";

const { isServer, html, o, attach, subscribe } = await credit(import.meta.url, {
  ssr: ({ document, html }) => {
    const css = "sakura-dark.css";
    document.head.append(html`<link rel="stylesheet" href="/${css}" />`);
    document.body.append(html`<div id="todos"></div>`);
  },
});

/** @typedef {{id: number, text: string}} Item */

const TodoApp = () => {
  /** @type {Item[]} */
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

attach("#todos", app);
