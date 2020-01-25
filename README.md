# wasm-rocks

[![Build Status](https://travis-ci.com/boyanio/wasm-rocks.svg?branch=master)](https://travis-ci.com/boyanio/wasm-rocks)

[Rockstar](https://codewithrockstar.com) is a computer programming language designed for creating programs that are also hair metal power ballads.

This is a work-in-progress transpilation for the Rockstar language to WebAssembly. You can compile to WebAssembly's [text format](https://webassembly.org/docs/text-format/) and then compile to the [binary encoding](https://webassembly.org/docs/binary-encoding/), which is also executed in the browser.

## Get started

```
yarn install
yarn build
```

This will create a `build` folder, where you can open `index.html` in your favorite browser.

## How does it work?

The idea is to do a [AST-to-AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) transformation. The sequence is:

1. Parse Rockstar source, which procudes a Rockstar AST
2. Transform Rockstar AST to WebAssembly AST
3. Emit WebAssembly AST in WebAssembly Text Format (wat)

For now, I use [WebAssembly Binary Kit](https://github.com/WebAssembly/wabt) to compile the WebAssembly Text Format to the binary encoded version. In the future, I will add direct compilation to wasm.

## References

- [typed-parser](https://github.com/jinjor/typed-parser) A parser library for TypeScript, inspired by elm/parser and Parsec(Haskell)
- [Rockstar](https://codewithrockstar.com/docs) The Rockstar Language Specification
- [
  Build your own WebAssembly Compiler
  ](https://blog.scottlogic.com/2019/05/17/webassembly-compiler.html) by Colin Eberhardt
