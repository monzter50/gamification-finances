## Stack
- Framework: React 19 + TypeScript
- Styling: Tailwind CSS (no inline styles, no CSS modules)
- State: Zustand for global, React Query for server state
- Router: React Router v7
- Build: Vite

## Components
- Use functional components only — no class components
- One component per file; file name matches component name (PascalCase)
- Co-locate: MyComponent.tsx, MyComponent.test.tsx, MyComponent.stories.tsx
- Prefer composition over inheritance
- Max component size: 200 lines — split if larger
- Barrel exports via index.ts per feature folder


## Folder Structure
src/
  features/          # Feature-sliced design
    auth/
      components/
      hooks/
      store/
      api/
  shared/
    components/      # Reusable UI primitives
    hooks/
    utils/
  pages/             # Route-level components only

## Naming
- Components: PascalCase
- Hooks: camelCase prefixed with "use" (useUserData, not getUserData)
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase, prefix interfaces with "I" only for DI
- Event handlers: prefix with "handle" (handleSubmit, handleClick)

## Code Style
- No default exports except for pages and lazy-loaded components
- Always type component props explicitly — no implicit `any`
- Prefer `const` arrow functions for components
- Use absolute imports via @/ alias, not relative ../../

## Performance
- Wrap expensive components in React.memo only when profiling shows benefit
- Use useMemo/useCallback only with a clear justification comment
- Images: always use lazy loading and specify width/height
- No large libraries without checking bundle impact (use bundlephobia)
- Split routes with React.lazy + Suspense

## Testing
- Unit tests: Vitest + React Testing Library
- Test behavior, not implementation — no snapshot tests
- Mock API calls at the network layer (MSW), not at the module level
- Coverage threshold: 80% for shared/components, 60% for features
- Run: `npm test` — must pass before any commit

## Never Do
- No prop drilling beyond 2 levels — use context or state manager
- No direct DOM manipulation (no document.getElementById)
- No `any` type without a TODO comment explaining why
- No useEffect for derived state — compute it inline
- No console.log in committed code
- No hardcoded strings for UI copy — use i18n keys

## Design System
When working on UI components, first read @docs/design-system.md — it is the
implementation contract (tokens, components, ESLint rules).
For the brand/visual intent behind those tokens (palette, typography, mood),
see @docs/brand-brief.md. If the two conflict, design-system.md wins.

## API Contracts
When writing API hooks, refer to @docs/api-schema.md

## Git
- Branch naming: feat/, fix/, chore/, refactor/
- Commit style: Conventional Commits (feat: add login page)
- Never push directly to main or develop
- Always run lint + tests before committing
- PRs require a description of what changed and why