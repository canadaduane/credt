// How might we create a style builder?
// TODO(canadaduane): This works with static values, but not observables
//
// const style = s({
//   position: "relative",
//   height: "100dvh",
//   "background-image": `linear-gradient(${c1}, ${c2})`,
//   overflow: "hidden",
// });

export function style(...parts /*: Record<string, string>[]*/) {
  return () =>
    parts
      .flatMap((part) => Object.entries(part).map(([k, v]) => `${k}:${v}`))
      .join(";");
}
