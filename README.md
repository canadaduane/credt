# Credit - A web framework experiment

A small, fast web framework that uses a CRDT to sync server and client.

Goals:
- minimal compilation steps
  - use plain es2022 js on both client & server
  - type safety via jsdoc comments
- zero API using full state sync
- extremely fast load time and render time
- server is just another peer
- peers can selectively trust signature-validated messages
- stretch goal: multiplayer

## Building Blocks

tinyhttp
- https://github.com/tinyhttp/tinyhttp
- fast, modern express replacement with middleware compat
- [tinyws](https://github.com/tinyhttp/tinyws) provides sensible websockets

Shelf
- https://github.com/dglittle/shelf
- efficient and flexible CRDT for nested object tree
- size: 6.8kb / 1.5kb brotli

Mikado
- https://github.com/nextapps-de/mikado/
- fastest render time in the world (https://krausest.github.io/js-framework-benchmark/2023/table_chrome_114.0.5735.90.html)
- size:
  - "full" 23kb / 7.9kb brotli
  - "light" 7.6kb / 3.0kb brotli

jspm-cli
- https://github.com/jspm/jspm-cli
- installs packages for importmap

Chomp
- https://github.com/guybedford/chomp
- fast, rust-based "make" system for javascript

Zod
- https://github.com/colinhacks/zod
- best-in-class runtime schema validator

## Research

- valtio?
