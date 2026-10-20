# graphql-fns

TypeScript library of helpers for building GraphQL schemas/resolvers on top of Mongoose.

## Commands

- Install: `yarn install` (Yarn 4 via corepack, `nodeLinker: node-modules`)
- Unit tests: `yarn test:once` (`src/**/*.test.ts`)
- MongoDB tests: `yarn test:mongodb` (`src/**/*.mtest.ts`, in-memory MongoDB via `@shelf/jest-mongodb`)
- Type check: `yarn typecheck`
- Lint: `yarn lint` (typed linting, uses `tsconfig.json`)
- Build: `yarn build` (tsup)

## Conventions

- Commits follow Conventional Commits (`feat:`, `fix:`, `build:` …); releases are made by semantic-release.
- Import alias `@/…` maps to `src/…`.

## Codex integration

OpenAI Codex CLI is available via the `codex` command.

When the user asks to use Codex:

- Invoke Codex through Bash using `codex exec`.
- Use `--sandbox read-only` for code reviews.
- Provide Codex with a clear, independent task.
- Wait for the Codex response.
- Analyze its findings critically.
- Report confirmed issues and suggested fixes.
- Do not let Codex modify files during reviews.
