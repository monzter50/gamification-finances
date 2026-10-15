---
name: design-system
description: Use this skill when generating or modifying UI in this repo — building new screens, components, forms, tables, dashboards, or any time you'd reach for a Tailwind color, money formatter, KPI card, empty state, or page header. Enforces the token + primitive contract documented in docs/design-system.md.
---

# Design System Skill

Invoked whenever you write or refactor UI in this project. The full reference
is `docs/design-system.md` — read it first if you haven't this session.

## Before writing any UI, check this

1. **Is there already a primitive for this?** Look in
   `src/components/ui/`. Don't recreate Button/Card/Money/Stat/EmptyState/
   PageHeader from scratch.
2. **Are you about to type a hex code, `text-emerald-*`, `text-red-*`, or
   call `new Intl.NumberFormat`?** Stop. Use a semantic token or `<Money>`.
3. **Are you rendering currency?** Use `<Money>`. Never format inline.
4. **Are you rendering a KPI / metric tile?** Use `<Stat>`.
5. **Are you rendering a list that might be empty?** Render `<EmptyState>`
   in the empty branch — never blank.
6. **Is this a page route?** First child must be `<PageHeader>`.

## Token cheat-sheet

```
Surfaces:    bg-background, bg-card, bg-muted, bg-popover
Text:        text-foreground, text-muted-foreground
Borders:     border-border
Intent:      bg-{success|warning|info|danger}-subtle text-{success|warning|info|danger}
Finance:     text-income, text-expense, text-savings  (+ -subtle backgrounds)
Game:        text-xp, text-level, text-streak
Alpha:       bg-income/10, ring-ring/40   (Tailwind /alpha modifier)
```

NEVER use: raw palettes (`emerald-500`, `red-600`), hex codes, inline
`style={{ color: ... }}`.

## Component import contract

Always import from the barrel:

```tsx
import { Button, Card, Money, Stat, EmptyState, PageHeader } from "@/components/ui";
```

Deep imports like `@/components/ui/money` are reserved for the barrel itself.

## When extending vs. composing

- **Compose** (in feature folder) when used 1–2 places.
- **Extend the system** (new file in `src/components/ui/` + barrel export +
  doc entry in `docs/design-system.md`) when:
  - Used in 3+ places, **or**
  - Encapsulates a11y/formatting/branding concerns.

When extending, follow the existing pattern: `forwardRef`, `cn(...)` utility,
CVA for variants if there's more than one shape, semantic tokens only.

## A11y must-haves

- Interactive = `<button>` / `<a>` / Radix primitive. Never `<div onClick>`.
- Money is read aloud naturally because `<Money>` sets `aria-label`. Don't
  strip it.
- Color is never the only signal. Pair with `+`/`−` (use `signed` prop on
  `<Money>`) or icons.
- Don't remove `focus-visible:ring-*` styles.

## Output expectations when I ask you for UI

When you generate UI in response to a user request:

1. Reference exactly which primitives you used and why.
2. Call out anything you had to invent and justify it (3+ uses rule).
3. If you added a new token, show the diff to `index.css` + `tailwind.config.js`
   + the doc.
4. No new dependencies without surfacing the tradeoff.
