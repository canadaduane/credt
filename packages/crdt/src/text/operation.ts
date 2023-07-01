import { Delete } from "./delete.ts";
import { Insert } from "./insert.ts";
import { Selection } from "./selection.ts";

export type Operation = Insert | Delete | Selection;
