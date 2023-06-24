/**
 * @param {credit.MountPayload} options
 */
export function mount({ rootImports, head, body }: credit.MountPayload): Promise<void>;
export const isServer: boolean;
/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any[]} values
 * @returns {credit.NodeType}
 */
export const html: ((strings: TemplateStringsArray, ...values: unknown[]) => HTMLElement | DocumentFragment) | ((strings: TemplateStringsArray, ...values: any[]) => import("sinuous/hydrate").VNode<{}> | import("sinuous/hydrate").VNode<{}>[]);
export { observable, subscribe } from "sinuous/observable";
