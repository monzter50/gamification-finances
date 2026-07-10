# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/monzter50/gamification-finances/compare/finances-gamification-v0.1.0...finances-gamification-v0.2.0) (2026-07-10)


### Features

* add authentication and achievement services - Implement user authentication, registration, and profile management - Create achievement service for handling user achievements and progress - Introduce transaction service for managing financial transactions - Update API types for better type safety - Enhance user context with loading state and user profile management ([a153bbe](https://github.com/monzter50/gamification-finances/commit/a153bbec670fef8e65fe156dd0bd1fd56a634657))
* add IncomeModal component for managing income items ([a5d450c](https://github.com/monzter50/gamification-finances/commit/a5d450caa3a51a810881aeee4af55aa1064709a4))
* add snackbar notifications for user actions and integrate toast functionality ([9293299](https://github.com/monzter50/gamification-finances/commit/92932999b90558accab292e2ae60d1d4aab44a62))
* centralize gamification progress in navbar with modal improvements ([6f93f02](https://github.com/monzter50/gamification-finances/commit/6f93f02b6b19282245b6bc477ead202ac482da27))
* Create budget management interface ([67c5b36](https://github.com/monzter50/gamification-finances/commit/67c5b36866ab8752d7f08676d6f2079716d38f6d))
* Implement budget income management feature ([67c5b36](https://github.com/monzter50/gamification-finances/commit/67c5b36866ab8752d7f08676d6f2079716d38f6d))
* implement complete dark/light theme system - Theme context provider with localStorage persistence - Automatic system theme detection - Multiple theme toggle components - Smooth transitions - Enhanced progress bars - Fixed hardcoded colors - Full documentation ([11b7945](https://github.com/monzter50/gamification-finances/commit/11b7945303def500c5d5b142ddfa3ac4b3e5dade))
* implement usePageXP hook for awarding XP on page visits across multiple components ([8ae6dc1](https://github.com/monzter50/gamification-finances/commit/8ae6dc190632907b067ac325cacc02998fbbf01f))
* populate profile with authenticated user data and disable email editing. ([1746e63](https://github.com/monzter50/gamification-finances/commit/1746e63f588adcfe411f743a316fa9e12a80b2c9))
* Refactor authentication flow to manage tokens and expiry, remove `ApiResponse` type, and prevent duplicate XP awards ([44c0dee](https://github.com/monzter50/gamification-finances/commit/44c0deed9b9f34ffecf103789559a2a4e46df634))
* remove Goals and Expenses pages from the application ([b92e69c](https://github.com/monzter50/gamification-finances/commit/b92e69cc674a4fbe2e8649eaa13278538925f9b6))
* remove unused gamification service and related components ([2ef7d7b](https://github.com/monzter50/gamification-finances/commit/2ef7d7b84391ebf2a0b83e0eb7879848c2a53f94))
* update authentication flow to improve user profile fetching and token validation ([f353ab7](https://github.com/monzter50/gamification-finances/commit/f353ab700c7721992bc288e2eca262178264a179))


### Bug Fixes

* Enhance error handling in authentication service ([67c5b36](https://github.com/monzter50/gamification-finances/commit/67c5b36866ab8752d7f08676d6f2079716d38f6d))
* resolve eslint warnings and format code with prettier ([ccd4202](https://github.com/monzter50/gamification-finances/commit/ccd42024e68c368e6c30c7f4cdf21174b4f40716))
* Update Layout component to properly handle children props ([e7c56b8](https://github.com/monzter50/gamification-finances/commit/e7c56b85cfd5d0b7d079e6b1689a5fd4d5eb67ac))


### Refactors

* Remove gamification context and related features ([67c5b36](https://github.com/monzter50/gamification-finances/commit/67c5b36866ab8752d7f08676d6f2079716d38f6d))
* Simplify main entry point by removing router and auth providers ([1f74d7e](https://github.com/monzter50/gamification-finances/commit/1f74d7ebfb60fdec1a89cb3f55376ba61422e6db))

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
