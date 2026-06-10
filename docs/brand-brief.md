# Brand Brief — Finanzas Pro (Gamified)

> **What this is:** the *visual intent* of the product — mood, palette,
> typography, shape language. Source: Stitch design tool.
>
> **What this is NOT:** the implementation contract. When you generate or
> modify UI, the rules you must follow live in **`@docs/design-system.md`**
> (semantic tokens, components, ESLint enforcement). This brief explains the
> *why* behind those tokens; `design-system.md` is the *how*.
>
> If something here conflicts with `design-system.md`, **`design-system.md`
> wins** — and flag the gap so we reconcile it (add a token, don't hardcode).

## Brand & Style

Finanzas Pro is a high-energy fintech platform that blends traditional
financial management with modern gaming mechanics. The brand personality is
**motivational, precise, and tech-forward**. It turns the tedious task of
budgeting into an engaging "level-up" experience for young professionals and
digital natives.

The design style is **Futuristic Glassmorphism** mixed with **Modern
Corporate**: deep obsidian backgrounds, vibrant neon accents, and subtle
atmospheric glows for depth and excitement. It should feel like a high-end
gaming dashboard while keeping the legibility and reliability a financial tool
requires. Key visual drivers:

- **Atmospheric Depth** — blurred radial gradients as "light leaks" behind containers.
- **Dynamic Feedback** — progress bars, XP counters, achievement badges that reward interaction.
- **Precision Typography** — crisp, high-contrast text and monospaced numbers for data clarity.

## Colors (intent)

Rooted in a "Deep Space" dark mode so neon primaries pop with maximum vibrance.

- **Primary — Neon Mint (`#4edea3`)** — growth, income, success. Primary signal for positive financial health. → maps to the `income` / `primary` semantic tokens.
- **Secondary — Soft Rose (`#ffb2b7`)** — expenses and alerts; sophisticated alternative to traditional red. → maps to `expense`.
- **Tertiary — Deep Cobalt (`#1e3a8a`)** — premium features (credit-card visuals, deep background layers). → decorative; see "Escape hatch" in `design-system.md`.
- **Neutral — Obsidian (`#0b1326`)** — rich base that prevents a flat screen. → `background`.

Semantic coloring is strictly enforced: **Mint = inflows/gains, Rose =
outflows/spending.** Gradients are reserved for gamification (progress bars)
and decorative card backgrounds.

> Raw hex values above are reference for *branding intent only*. In code, never
> hardcode hex — use semantic tokens (`bg-income`, `text-expense`, `text-xp`…).

> **Status (reconciled):** this palette is **live in the dark theme**. The hexes
> below are now real tokens in `src/index.css` — added as `--p-mint-*` primitives
> and mapped onto the `.dark` semantic tokens (`--background`, `--card`,
> `--primary`→mint, `--income`→mint, `--expense`→soft rose, `--ring`→mint). The
> light theme is unchanged. **Fonts are wired** too: Hanken Grotesk as the
> default `font-sans`, JetBrains Mono as `font-mono` (used by `<Money>`,
> `<MoneyInput>`, XP indicators). Dark is now the default theme.
> Pending follow-up: the bento-grid layout primitives (sidebar 260px, gutter 24px).

### Reference palette (Stitch tokens)

| Token | Value |
|---|---|
| background / surface | `#0b1326` |
| surface-main (cards) | `#0F172A` |
| surface-border | `#1E293B` |
| primary (Neon Mint) | `#4edea3` |
| primary bright | `#6ffbbe` |
| income | `#4edea3` |
| expense / secondary | `#ffb2b7` |
| on-surface (text) | `#dbe2fd` |
| xp-bar gradient end | `#10b981` |
| card visa gradient | `linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)` |

## Typography (intent)

- **Hanken Grotesk** — all primary communication. Clean, contemporary; balances "gaming" and "finance".
- **JetBrains Mono** — exclusively for technical data: currency amounts in lists, progress indicators, metadata tags. Emphasizes precision / "dev-tool" aesthetic.

Guidelines:
- **Numerical display** — large currency values use tightened letter-spacing and heavier weights to command attention.
- **Labels** — uppercase monospaced labels for tags/metadata (e.g. `DÉBITO`, `TRANSFERENCIA`).
- **Hierarchy** — high contrast between `title-sm` and `body-base` to define sections within cards.

### Type scale (Stitch)

| Style | Font | Size / Weight / Line |
|---|---|---|
| display-lg | Hanken Grotesk | 32 / 700 / 40 |
| headline-xl-numeric | Hanken Grotesk | 40 / 700 / 1, -0.02em |
| headline-md | Hanken Grotesk | 24 / 600 / 32 |
| title-sm | Hanken Grotesk | 18 / 600 / 24 |
| body-base | Hanken Grotesk | 16 / 400 / 24 |
| body-sm | Hanken Grotesk | 14 / 400 / 20 |
| label-numeric | JetBrains Mono | 14 / 500 / 16, -0.02em |
| label-caps | JetBrains Mono | 10 / 700 / 12, 0.05em |

## Layout & Spacing

**12-column Bento Grid** for flexible arrangements of cards with varying importance.

- **Structure** — fixed sidebar (260px) for primary nav; top AppBar for global actions/search.
- **Bento logic** — elements span 4 / 7 / 8 / 12 columns by information density.
- **Rhythm** — 8px base system; **24px (1.5rem)** standard gap between cards and interior padding.
- **Responsive** — on mobile the grid collapses to a single-column stack; sidebar becomes bottom nav or hamburger.

Spacing reference: `sidebar-width 260px`, `container-padding 2rem`,
`card-padding 1.5rem`, `gutter 24px`, `stack-gap 1.5rem`, `inline-gap 1rem`.

## Elevation & Depth

Tonal layering + subtle blurs, **not** traditional drop shadows.

- **Base** — `background` (#0b1326) is the canvas.
- **Surface** — cards use a lighter `surface-main` (#0F172A) with a 1px border (#1E293B).
- **Hover** — border shifts to primary (`#4edea3`); element moves `-2px` on Y.
- **Glow** — critical elements (active XP bar, active nav) get a soft outer glow: `0 0 15px rgba(78,222,163,0.1)`.

> Note: `design-system.md` standardizes shadows as `shadow-xs/sm/md/lg`. Treat
> the glow above as a gamification accent, not a general elevation rule.

## Shapes

**Rounded** language to soften the tech aesthetic and feel approachable.

- **Primary containers** — large cards / hero use `rounded-2xl` (1rem).
- **Secondary** — buttons, search bars, achievement icons use `rounded-xl` (0.75rem) or `rounded-lg` (0.5rem).
- **Circular** — avatars, progress rings, FAB use `rounded-full`.

Radii: `sm 0.25rem`, `DEFAULT 0.5rem`, `md 0.75rem`, `lg 1rem`, `xl 1.5rem`, `full 9999px`.

## Components (visual intent)

> Implementation lives in `src/components/ui/` and is documented in
> `design-system.md`. This section is the *look*, not the API.

### Buttons
- **Primary** — solid `primary` bg, `on-primary` text, `rounded-lg`, bold. Active state scales down to 95%.
- **Outline** — transparent bg, `primary` border + text. Secondary actions ("Ver todo").

### Cards (Bento items)
- **Standard** — dark surface, 1px border, 24px padding.
- **Premium/Credit** — gradient backgrounds with glassmorphism overlay (`backdrop-blur`).

### Gamification
- **Progress bars** — dual-tone gradient (Mint → Emerald), rounded track. → `<XPProgressBar>`.
- **Achievement chips** — grayscale when locked; full color + primary border when unlocked.
- **Level rings** — circular progress (`border-t-transparent` + CSS animation) for "loading"/"earning" states. → `<LevelBadge>`.

### Lists & Transactions
- Row hover highlights the whole row (`surface-container-high`).
- Left: icon in a circular container. Right: currency in monospaced font. → `<TransactionRow>` + `<Money>`.

### Floating Action Button (FAB)
- High elevation, `primary`, 56×56px, bold `add` icon, anchored bottom-right.
