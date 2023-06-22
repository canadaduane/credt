import { html } from "./credit.js";

/**
 * @param {{items: import('sinuous/observable').Observable<public.Item[]>}} param0
 */
export const TodoList = ({ items }) => {
  return html`
    <ul>
      ${() => items().map((item) => html`<li id=${item.id}>${item.text}</li>`)}
    </ul>
  `;
};
