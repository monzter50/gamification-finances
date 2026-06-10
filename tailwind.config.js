/** @type {import('tailwindcss').Config} */

// Helper: HSL CSS-var color that also accepts /<alpha> modifiers.
//   bg-income/10  →  hsl(var(--income) / 0.1)
const v = (name) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ── Bento layout tokens (Stitch brief) ──
      // Consumed as w-sidebar, gap-gutter, p-card, grid-cols-bento, etc.
      spacing: {
        sidebar: "260px",            // expanded nav rail
        "sidebar-collapsed": "80px", // collapsed nav rail
        gutter: "1.5rem",            // 24px — standard gap between bento cards
        card: "1.5rem",              // 24px — card interior padding
        stack: "1.5rem",             // vertical rhythm between stacked blocks
        inline: "1rem",              // horizontal rhythm between inline items
        "container-pad": "2rem",     // page container side padding
      },
      gridTemplateColumns: {
        bento: "repeat(12, minmax(0, 1fr))",
      },
      colors: {
        // Surfaces (shadcn)
        background: v("background"),
        foreground: v("foreground"),
        card: { DEFAULT: v("card"), foreground: v("card-foreground") },
        popover: { DEFAULT: v("popover"), foreground: v("popover-foreground") },
        primary: { DEFAULT: v("primary"), foreground: v("primary-foreground") },
        secondary: { DEFAULT: v("secondary"), foreground: v("secondary-foreground") },
        muted: { DEFAULT: v("muted"), foreground: v("muted-foreground") },
        accent: { DEFAULT: v("accent"), foreground: v("accent-foreground") },
        destructive: { DEFAULT: v("destructive"), foreground: v("destructive-foreground") },
        border: v("border"),
        input: v("input"),
        ring: v("ring"),

        // Semantic intent
        success: { DEFAULT: v("success"), foreground: v("success-foreground"), subtle: v("success-subtle") },
        warning: { DEFAULT: v("warning"), foreground: v("warning-foreground"), subtle: v("warning-subtle") },
        info: { DEFAULT: v("info"), foreground: v("info-foreground"), subtle: v("info-subtle") },
        danger: { DEFAULT: v("danger"), foreground: v("danger-foreground"), subtle: v("danger-subtle") },

        // Finance domain
        income: { DEFAULT: v("income"), foreground: v("income-foreground"), subtle: v("income-subtle") },
        expense: { DEFAULT: v("expense"), foreground: v("expense-foreground"), subtle: v("expense-subtle") },
        savings: { DEFAULT: v("savings"), foreground: v("savings-foreground"), subtle: v("savings-subtle") },

        // Gamification
        xp: { DEFAULT: v("xp"), foreground: v("xp-foreground") },
        level: { DEFAULT: v("level"), foreground: v("level-foreground") },
        streak: { DEFAULT: v("streak"), foreground: v("streak-foreground") },

        // Charts
        chart: {
          1: v("chart-1"),
          2: v("chart-2"),
          3: v("chart-3"),
          4: v("chart-4"),
          5: v("chart-5"),
          income: v("chart-income"),
          expense: v("chart-expense"),
          savings: v("chart-savings"),
        },
      },

      fontFamily: {
        // Brand typography (loaded via Google Fonts in index.html).
        // `font-sans` is the global default (set on <body> in index.css);
        // `font-mono` is for numeric/technical data — used by <Money>.
        sans: ["Hanken Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      fontSize: {
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-sm": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "money-lg": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "money-md": ["1.5rem", { lineHeight: "1.2" }],
        "money-sm": ["1.125rem", { lineHeight: "1.25" }],
      },

      transitionDuration: {
        instant: "var(--dur-instant)",
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      zIndex: {
        base: "var(--z-base)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
  plugins: [require("tailwindcss-animate")],
};
