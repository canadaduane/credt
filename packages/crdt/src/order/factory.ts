import { NaiveArrayList } from "../structures/naive-array-list.ts";
import { SortedSetArray } from "../structures/sorted-set-array.ts";
import {
  Id,
  Node,
  VectorClock,
  VectorSortedSet,
  Version,
} from "./vector-clock.ts";

const emptyVector = new SortedSetArray(new NaiveArrayList([]));

export function createVectorClock(
  id: Node,
  version?: Version,
  vector?: VectorSortedSet<Id>
): VectorClock {
  return new VectorClock(
    new Id(id, version ? version : 0),
    vector ? vector : emptyVector
  );
}
