# VisionJS

Modern TypeScript-first framework package scaffold.

## Install

```bash
npm install vsn
```

## Usage

```ts
import { hello } from "vsn";

console.log(hello("Vision"));
```

## Scripts

- `npm run build` - build ESM/CJS + types to `dist/`
- `npm run dev` - watch mode build
- `npm run test` - run tests once
- `npm run test:watch` - watch tests
- `npm run typecheck` - typecheck without emitting

## Publishing

Builds run via `prepublishOnly`. Output is published from `dist/`.
