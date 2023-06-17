export { HttpRequest, HttpResponse } from "uWebSockets.js";

type WSProp = ((...args: any[]) => any) | any | any[];

export type WSSocket = {
  [prop: string]: WSProp;
};

export type WSEvent = {
  id: string;
  event: string;
  data?: any;
};
export type WSPlugin = (this: any, ws: WSSocket, event: WSEvent) => void;

export as namespace Global;
