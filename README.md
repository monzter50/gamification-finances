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
- [x] Import from Excel (.xlsx)
- [ ] Register
- [ ] Dashboard
- [x] Profile
- [ ] Budget
- [x] Goals
- [ ] Expenses
- [ ] Income
- [ ] Reports

## Import from Excel

Bulk-import a budget from an `.xlsx` workbook at `/transactions/import-xlsx` (or the **Import Excel** button on the Transactions page). The backend parses three sheets; you then review and confirm:

- **Income items** — editable description/amount, with a **type** and **account** picked per row.
- **Expense items** — editable description/amount; **Fixed/Variable** is pre-filled from the workbook's sections.
- **Transactions** — editable rows; each row's account comes from the **payment-source → account** map.

Pick the target budget, map accounts, then **Import everything** creates it all atomically on the server.

Implementation (under `src/`):

| Piece | File |
|---|---|
| Upload + 3-section review page | `pages/main/transactions/xlsx-import/` |
| State machine | `pages/main/transactions/xlsx-import/useXlsxReducer.ts` |
| API calls (multipart parse + JSON confirm) | `services/xlsxImport.service.ts` |

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
