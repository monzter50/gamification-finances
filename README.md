# Finances Gamification

- These projects is for practice solid, pattern and other things

## How test dashboard

### Credentials

- Any username and password combination will work for testing
- Example:
  - Username: `test@example.com`
  - Password: `password123`

### Test Data

All data in the dashboard is dummy/mock data for demonstration purposes:

- Financial transactions
- Goals and progress
- User profile information
- Expense categories and amounts

## Features

- [x] Login
- [x] Single active session (blocking screen)
- [ ] Register
- [ ] Dashboard
- [x] Profile
- [ ] Budget
- [x] Goals
- [ ] Expenses
- [ ] Income
- [ ] Reports

## Single active session

Only one device can be signed in per account at a time (enforced by the API). The app reacts to the backend's session signals and shows a **blocking full-screen overlay** when needed:

- **Login while a session is already active** (`409`) → blocking screen: _"Ya tienes una sesión activa…"_. The login form stays silent (no inline error / toast) — the overlay owns the message.
- **Session revoked mid-use** (`440`, a newer login elsewhere superseded this one) → blocking screen: _"Tu sesión finalizó…"_. Local auth is cleared and the user is sent back to login.

How it's wired (all under `src/`):

| Piece | File |
|---|---|
| Contract — status-based detection (`api-core` only exposes HTTP status, not the body) | `config/session.ts` |
| Framework-free revocation event bus (mutator → context) | `config/session-revocation.ts` |
| Global detection point for the `440` signal | `api/orval-mutator.ts` |
| Session state + handlers (`sessionBlock`, `dismissSessionBlock`) | `context/AuthContext.tsx` |
| Blocking overlay + gate (mounted above the router) | `components/session/` |

## Technologies

- [x] React
- [x] Typescript
- [x] Shade UI
- [x] Tailwind CSS

## How to run

- Clone this repository
- Run `yarn` to install dependencies
- Run `yarn start` to start the project
- Access `http://localhost:3000`
- Enjoy!

## How to contribute

- Fork this repository
- Create a branch with your feature: `git checkout -b my-feature`
- Commit your changes: `git commit -m 'feat: My new feature'`
- Push your branch: `git push origin my-feature`
- Open a pull request
- After the merge of your pull request is done, you can delete your branch
- After your pull request is merged, you can delete your branch

## License

This project is under the MIT license. See the [LICENSE](LICENSE.md) file for more details.
