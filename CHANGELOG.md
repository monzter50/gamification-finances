# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-15

### Added
- **Single active session**: enforce a single active auth session per user, with supporting docs.
- **XLSX import**: move the Excel import flow into the budget context, scoped to a specific budget.
- **Budget items**: filtering and pagination for income/expense items via dedicated hooks.
- **Transactions**: transaction form modal and filters; server-computed totals exposed through transaction hooks and components.

### Changed
- **Budget service**: split by responsibility (SRP) for clearer boundaries and testability.
- **Design system**: reconcile the Stitch brand into the design system tokens.
- **UI migration**: dashboard and profile migrated to `BentoGrid`; income/expense/transactions pages aligned to the design system.
- **Tooling**: align Prettier with ESLint via `eslint-config-prettier`.

### Fixed
- **Profile**: remove duplicate `useForm` block left by a `main` merge.

[0.2.0]: https://github.com/monzter50/gamification-finances/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/monzter50/gamification-finances/releases/tag/v0.1.1
