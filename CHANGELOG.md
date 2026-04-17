# Changelog

All notable changes to this project will be documented in this file.

This fork of [prettier-plugin-awk](https://github.com/Beaglefoot/prettier-plugin-awk)
updates the plugin to work with prettier 3.x and Node 24.

## [0.4.0] - Unreleased

### Summary
Replaced native `tree-sitter` Node.js binding (which required per-Node-version
compilation) with `web-tree-sitter` (WASM). This eliminates the NODE_MODULE_VERSION
ABI mismatch that prevented the plugin from running under Node 24, and makes the
plugin version-agnostic for all future Node.js releases.

All 26 existing tests pass unchanged, confirming formatting output is identical
to the original plugin.

### Changed
- `package.json` — bumped `prettier` from 2.5.1 to 3.8.1; replaced `tree-sitter`
  0.21.1 with `web-tree-sitter` 0.26.8; removed `@types/prettier` (types now
  bundled in prettier 3.x); updated TypeScript to 5.6.3 and mocha to 10.7.3
- `tsconfig.json` — bumped `target` from `es6` to `es2020`; added `skipLibCheck`
  to suppress `EmscriptenModule` reference in web-tree-sitter's own type definitions
- `src/parser.ts` — complete rewrite; initialises `web-tree-sitter` using its
  exported WASM path (`web-tree-sitter/web-tree-sitter.wasm`); loads AWK grammar
  from the `.wasm` file bundled with `tree-sitter-awk`; exported as async
  `initParser()` instead of a module-level `parser` instance
- `src/index.ts` — `parse()` is now async (prettier 3.x supports Promise return);
  updated imports from `tree-sitter` → `web-tree-sitter`
- `src/printer/printer.ts` — `path.getValue()` → `path.node as TSNode`;
  `Printer<any>['print']` type retained because this file uses
  `path.call(print, 'children', N)` / `path.call(print, 'namedChildren', N)`
  patterns which fail to type-check under a stricter generic parameter;
  updated import
- `src/printer/wrappers.ts` — `Printer<TSNode | null>['print']` (×3);
  updated import
- `src/printer/binary_exp.ts` — `Printer<TSNode | null>['print']`;
  updated import
- `src/printer/block.ts` — `Printer<any>['print']` retained (uses
  named-child indexing); updated import; explicit `TSNode` types
  on lambda params
- `src/printer/func_def.ts` — `Printer<TSNode | null>['print']`;
  updated import; explicit `TSNode` type on map callback
- `src/printer/if_statement.ts` — `Printer<any>['print']` retained
  (uses numbered-child indexing); updated import
- `src/printer/utils.ts` — updated import from `tree-sitter` → `web-tree-sitter`
- `src/test_run.ts` — `prettier.format()` now awaited (prettier 3.x async)
- `tests_config/run_spec.js` — test callbacks and `prettyprint()` now async/await;
  plugin path changed from directory to explicit `out/index.js` (prettier 3.x
  ESM dynamic import does not support directory imports)

### Dependencies retained
- `tree-sitter-awk` 0.7.2 — kept for its bundled `tree-sitter-awk.wasm` file;
  the native Node.js binding is no longer loaded

### Why WASM instead of rebuilding the native binding
`tree-sitter` 0.21.x uses raw V8 ABI (NODE_MODULE_VERSION) rather than N-API,
meaning its compiled binary is tied to a specific Node.js version. Rebuilding
for Node 24 would work today but would break again on the next major Node release.
`web-tree-sitter` uses WASM which has no ABI dependency and works identically
across all Node.js versions.
