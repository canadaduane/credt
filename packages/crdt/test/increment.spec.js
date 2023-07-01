"use strict";

import assert from "assert";
import { increment, functions } from "../dist/index.js";

const { Increment } = increment;
const { axioms } = functions;

describe("Increment", () => {
  let a, b, c;

  beforeEach(() => {
    a = new Increment(1);
    b = new Increment(3);
    c = new Increment(7);
  });

  it("should obey CRDT axioms", function () {
    axioms(assert, a, b, c);
  });
});
