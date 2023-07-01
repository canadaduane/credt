# Credt - A web framework experiment

An unconventional, small+fast web framework that uses a CRDT to sync server and client.

Thank you to each innovator who has gone before. You are a credit to us all.

## Goals:

- minimal compilation steps
  - use plain es2022 javascript on both client & server
  - type safety via ~~jsdoc comments~~ js-with-ts (javascript with typescript in comments)
- no API--state sync takes care of variables
- extremely fast load time and render time (SSR, small deps)
- server is just another peer
- peers can selectively trust signature-validated messages
- stretch goal: multiplayer

### Non-goals:

- backwards compat with non-modern browsers
- similarity to React development

## Questions

1. Can we get good type checking without a compile step? [It's looking promising](https://elk.vmst.io/vmst.io/@canadaduane/110601683275741791).
2. Can we have fast web development without vite, and even faster SSR without bundling?
3. Can we sync state between server and client without spending so much time on API plumbing?

## Building Blocks

### Client

CRDT Library (see below for ongoing research)

[Sinuous](https://sinuous.netlify.app/)

- fast, efficient, tiny reactive UI library
- supports es modules, hydration
- size: 5kb / 2.9kb brotli

### Server

[uWebSockets.js](https://github.com/uNetworking/uWebSockets.js/)

- ~150k req/s nodejs server
- supports both HTTP and WS
- easily serves static files
  via [uwebsocket-serve](https://github.com/kolodziejczak-sz/uwebsocket-serve)

[jspm-cli](https://github.com/jspm/jspm-cli)

- installs packages for importmap

[Chomp](https://github.com/guybedford/chomp)

- fast, rust-based "make" system for javascript

[Linkedom](https://github.com/WebReflection/linkedom)

- A fast, reasonable server-side DOM

## Research

- jsdelivr seems to offer best CDN for js--fast, and brotli compressed
- animejs 6.5kb

### CRDTs

| Name         | Size  | Reliability | Work | Description                                          |
| ------------ | ----- | ----------- | ---- | ---------------------------------------------------- |
| Yjs          | 37kb  | 10          | 3    | An excellent, reliable CRDT in javascript, but large |
| Automerge 2  |       |             |      | Requires wasm, which adds latency at load time       |
| mute-structs | 14kb  |             |      | Probably too large                                   |
| Antimatter   | 7kb   | 2           | 7    | Experimental but very promising CRDT with deletions. |
| causal-trees | 122kb |             |      | Too big                                              |
| js-crdt      | 3kb   | 4           | 5    | Old, but worth investigating due to tiny size        |
