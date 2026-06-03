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
- [x] Import from a statement image
- [ ] Register
- [ ] Dashboard
- [x] Profile
- [ ] Budget
- [x] Goals
- [ ] Expenses
- [ ] Income
- [ ] Reports

## Import from a statement image

Upload a photo/screenshot of a bank or credit-card statement at `/transactions/import` (or the **Import statement** button on the Transactions page). The backend extracts the transactions; you then review/edit them, pick a budget + account, and save.

- The extracted rows land in an **editable review table** (date, vendor, amount, type, description). Low-confidence rows are flagged.
- Pick a batch **budget** and **account** (with optional per-row account override), then confirm — the rows are bulk-created atomically.

Extraction is a swappable backend provider (a mock by default, Claude vision when configured), so the UI is identical regardless.

Implementation (under `src/`):

| Piece | File |
|---|---|
| Upload + review page | `pages/main/transactions/import/` |
| State machine | `pages/main/transactions/import/useImportReducer.ts` |
| API calls (multipart extract + JSON confirm) | `services/import.service.ts` |

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
