import { NaiveArrayList } from "../structures/naive-array-list.ts";
import { NaiveImmutableMap } from "../structures/naive-immutable-map.ts";
import { OrderedMap } from "../structures/ordered-map.ts";
import { SortedSetArray } from "../structures/sorted-set-array.ts";
import { Orderer } from "./orderer.ts";
import { Text } from "./text.ts";

export function createFromOrderer(order: Orderer<any>): Text {
  return new Text(
    order,
    new OrderedMap(
      new SortedSetArray(new NaiveArrayList([])),
      new NaiveImmutableMap()
    )
  );
}
