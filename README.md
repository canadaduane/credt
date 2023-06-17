# Credit - A web framework experiment

A small, fast web framework that uses a CRDT to sync server and client.

Goals:

- minimal compilation steps
  - use plain es2022 javascript on both client & server
  - type safety via jsdoc comments
- no API--state sync takes care of variables
- extremely fast load time and render time
- server is just another peer
- peers can selectively trust signature-validated messages
- stretch goal: multiplayer

Non-goals:

- backwards compat with non-modern browsers
- look similar to React development

## Building Blocks

### Client

[Antimatter](https://braid.org/antimatter)
- JSON CRDT with non-tombstone deletion
- size: 17.5kb / 6.6kb brotli

[Sinuous](https://sinuous.netlify.app/)
- fast, efficient, tiny reactive UI library
- supports es modules, hydration
- size: 5kb / 2.9kb brotli

[Zod](https://github.com/colinhacks/zod)
- best-in-class runtime schema validator
- size: 14kb brotli

### Server

[chef-uws](https://github.com/chef-js/uws)
- ~150k req/s nodejs server based on uWebsockets
- easily serves static files

[jspm-cli](https://github.com/jspm/jspm-cli)
- installs packages for importmap

[Chomp](https://github.com/guybedford/chomp)
- fast, rust-based "make" system for javascript

## Research

- jsdelivr seems to offer best CDN for js--fast, and brotli compressed