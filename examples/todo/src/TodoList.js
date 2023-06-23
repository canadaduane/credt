import { html } from "credit";

/**
 * @param {{items: public.Observable<public.Item[]>}} param0
 */
export const TodoList = ({ items }) => {
  return html`
    <ul>
      ${() => items().map((item) => html`<li id=${item.id}>${item.text}</li>`)}
    </ul>
  `;
};
