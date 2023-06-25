/*+ import type { Item } from "./types.ts"; */
/*+ import type { Observable } from "sinuous/observable"; */
import { html } from "@credit/core";

export const TodoList = ({ items }/*: { items: Observable<Item[]> }*/) => {
  return html`
    <ul>
      ${() => items().map((item) => html`<li id=${item.id}>${item.text}</li>`)}
    </ul>
  `;
};
