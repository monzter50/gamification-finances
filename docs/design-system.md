# Design System

> Read this before generating, modifying, or refactoring any UI. CLAUDE.md
> references it explicitly for every UI task.

## TL;DR rules

1. **Never hardcode colors.** Use semantic Tailwind tokens (`bg-income`,
   `text-expense`, `bg-muted`, `text-foreground`) — never hex codes,
   never raw shadcn primitives like `text-emerald-600`.
2. **Never `Intl.NumberFormat` in feature code.** Use `<Money>`.
3. **Never write a `<div>` styled like a KPI card.** Use `<Stat>`.
4. **Never leave a list/table empty.** Render `<EmptyState>`.
5. **Never style a page title with raw `<h1>`.** Use `<PageHeader>`.
6. **Import from `@/components/ui` only.** Don't deep-import individual files.
7. **Tabular numerals** on every money/percent value. `<Money>` does this for
   you — for custom cells add `className="tabular-nums"`.

## Token layers

```
primitive palette   →   semantic token   →   Tailwind class   →   component
(--p-emerald-600)       (--income)           (bg-income)          <Money tone="auto">
```

- **Primitives** (`--p-*`) live in `src/index.css`. Raw colors. Touched only
  when rebranding.
- **Semantic tokens** (`--income`, `--xp`, `--background`, `--success` …) are
  the contract. Components reference these only.
- **Tailwind classes** are how components consume them: `bg-income`,
  `text-xp`, `border-border`, etc. Alpha modifier works: `bg-income/10`.
- **TS map** (`src/lib/tokens.ts`) exposes the same tokens for non-className
  contexts (Recharts fills, inline SVG).

### Color decision tree

| Situation                       | Use                                    |
| ------------------------------- | -------------------------------------- |
| Page/card background            | `bg-background` / `bg-card`            |
| Subtle background (alerts, tags)| `bg-{intent}-subtle text-{intent}`     |
| Body text                       | `text-foreground`                      |
| Secondary text, captions        | `text-muted-foreground`                |
| Borders, dividers               | `border-border`                        |
| Money — positive flow (income)  | `text-income` (or `<Money tone="income">`) |
| Money — negative flow (expense) | `text-expense`                         |
| Money — zero / unchanged        | `text-muted-foreground`                |
| Money — auto sign coloring      | `<Money tone="auto" />`                |
| Success state (toast, banner)   | `bg-success-subtle text-success`       |
| Warning state                   | `bg-warning-subtle text-warning`       |
| Destructive action / error      | `bg-danger-subtle text-danger`         |
| Gamification — XP/streak/level  | `text-xp`, `text-streak`, `text-level` |

Never use raw Tailwind palettes (`emerald-500`, `red-600`, etc.) in features
— they bypass dark mode + branding.

## Component catalog

All in `src/components/ui/`. Import via the barrel:

```tsx
import { Button, Card, Money, Stat, EmptyState, PageHeader } from "@/components/ui";
```

### Primitives (shadcn-based, don't touch unless extending)
`Button`, `Input`, `Label`, `Select`, `Card`, `Badge`, `Avatar`, `Progress`,
`Skeleton`, `Table`, `Toast`.

### Enforcement
The ESLint config (`.eslintrc.json`) warns on:
- Raw Tailwind palettes in `className` (`text-red-*`, `bg-emerald-*`, …).
- Hex codes in `className`.
- Ad-hoc `new Intl.NumberFormat({ style: "currency" })` — use `<Money>`.

If you genuinely need a new color, add a token first (see "When to add a new token" below) — don't disable the rule.

### Domain primitives (the new layer)

#### `<Money>`
The only way to render currency.
```tsx
<Money value={1234.56} />                           {/* $1,234.56 neutral */}
<Money value={-42} tone="auto" />                   {/* red, formatted */}
<Money value={120} tone="income" size="lg" signed />{/* +$120.00 green */}
```

#### `<Stat>`
KPI card. Use on dashboards. Don't roll your own.
```tsx
<Stat
  label="This month"
  value={2340.55}
  tone="auto"
  delta={{ value: 120, percent: 5.4, goodWhen: "down" }}
/>
```

#### `<EmptyState>`
Every list/table renders this when there's nothing. Title + action required.
```tsx
<EmptyState
  icon={<Receipt />}
  title="No transactions yet"
  description="Add your first one to start tracking."
  action={<Button onClick={open}>New transaction</Button>}
/>
```

#### `<PageHeader>`
First child of every page route.
```tsx
<PageHeader
  title="Transactions"
  description="Income and expenses across all accounts"
  actions={<Button>New</Button>}
  toolbar={<Filters />}
/>
```

#### `<TxTypePill>`
Tiny intent-colored label for transaction type. Replaces hand-rolled
green/red bubbles.
```tsx
<TxTypePill type="income" />
<TxTypePill type="expense" label="Outflow" />
```

#### `<TransactionRow>`
Composed row for transaction lists. Use this in any feed — dashboard,
transactions page, search results. Sign handling is built-in: pass the raw
positive amount and the `type`, it formats as `+`/`−` and colors via `<Money tone="auto">`.
```tsx
<TransactionRow
  vendor="Spotify"
  date={tx.date}
  amount={tx.amount}
  type={tx.type}
  accountName={accountName}
  currency="MXN"
  onClick={() => navigate(`/transactions/${tx.id}`)}
/>
```

#### `<MoneyInput>`
Controlled currency-aware input. Works with react-hook-form via `Controller`.
Holds the value as a number (major units) and the symbol as a visual prefix.
```tsx
<Controller
  control={control}
  name="amount"
  render={({ field }) => (
    <MoneyInput value={field.value ?? null} onChange={field.onChange} currency="MXN" />
  )}
/>
```

#### `<LevelBadge>` & `<XPProgressBar>`
Gamification primitives. Use the `level`/`xp`/`streak` tokens — never hand-pick
amber/violet shades.
```tsx
<LevelBadge level={7} />
<LevelBadge level={42} tone="xp" size="lg" />

<XPProgressBar current={420} max={1000} level={5} />
```

## Patterns

### Dashboard page

```tsx
<PageHeader title="Dashboard" />
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Stat label="Balance" value={balance} />
  <Stat label="Income"  value={income}  tone="income"  delta={incomeDelta} />
  <Stat label="Expense" value={expense} tone="expense" delta={expenseDelta} goodWhen="down" />
  <Stat label="Savings" value={savings} delta={savingsDelta} />
</div>
```

### Money in tables
```tsx
<TableCell className="text-right">
  <Money value={row.amount} tone="auto" signed size="sm" />
</TableCell>
```

### Loading
Use `<Skeleton>` with the same shape and size as the final content. Don't
spinners. Don't blank flashes.

### Forms
- Always pair `<Input>` with `<Label htmlFor>`.
- Inline error: `text-danger text-sm mt-1`.
- Disabled submit while pending; never hide the button.

## Accessibility (non-negotiable)

- All interactive elements reachable by keyboard. Use `<Button>` / `<a>` —
  never `<div onClick>`.
- Focus rings come from `focus-visible:ring-ring`. Don't strip them.
- Color is never the sole signal. Pair colored money with `+`/`−` signs
  (set `signed` on `<Money>`) and use icons in deltas.
- Respect `prefers-reduced-motion` — already enforced globally in `index.css`.
- Charts: pass `aria-label` describing the data.

## Motion

| Use                       | Class                             |
| ------------------------- | --------------------------------- |
| Hover, focus, tone change | `duration-fast ease-standard`     |
| Enter/exit (default)      | `duration-base ease-standard`     |
| Emphasized (modal open)   | `duration-slow ease-emphasized`   |

## Elevation

`shadow-xs` cards (resting), `shadow-sm` (hover), `shadow-md` (popover),
`shadow-lg` (modal). Don't invent new shadows.

## When to add a new primitive

Add to `src/components/ui/` only if:
1. The same pattern is repeated in **3+ places** in features.
2. The variation can be expressed as props/variants (CVA), not branching.
3. It encapsulates an a11y or formatting concern (`Money`, `EmptyState`).

Otherwise compose existing primitives in the feature folder.

## When to add a new token

Add a semantic token (not a primitive) when:
- A new **intent** appears that isn't covered (e.g. `pending`, `archived`).
- A new **domain concept** needs a color (e.g. `transfer`, `refund`).

Process: add primitive (if needed) → add semantic token in `:root` and
`.dark` → expose in `tailwind.config.js` → document here.
