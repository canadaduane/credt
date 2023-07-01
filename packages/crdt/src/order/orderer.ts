import { Comparer, Equaler, Merger } from "../functions.ts";

export interface Orderer<T> extends Comparer<T>, Merger<T>, Equaler<T> {
  next(): T;
}
