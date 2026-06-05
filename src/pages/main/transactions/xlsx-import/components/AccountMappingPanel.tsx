import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import type { Account } from "@/types/api";
import { MONTHS, type Budget } from "@/types/budget";

interface AccountMappingPanelProps {
  budgets: Budget[];
  accounts: Account[];
  paymentSources: string[];
  budgetId: string | null;
  defaultAccountId: string | null;
  accountMapping: Record<string, string>;
  batchError?: string;
  // eslint-disable-next-line no-unused-vars
  onBudgetChange: (budgetId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onDefaultAccountChange: (accountId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onSourceMap: (source: string, accountId: string) => void;
}

// `budget.month` is 0-based (0 = January) across this app — match how every
// other screen labels it (MONTHS[month]) so budgets read identically here.
const monthName = (year: number, month: number) => `${MONTHS[month]} ${year}`;

const AccountSelect = ({
  id,
  value,
  accounts,
  onChange,
}: {
  id: string;
  value: string | null;
  accounts: Account[];
  // eslint-disable-next-line no-unused-vars
  onChange: (v: string) => void;
}) => (
  <Select value={value ?? ""} onValueChange={onChange}>
    <SelectTrigger id={id} className="w-56"><SelectValue placeholder="Select an account" /></SelectTrigger>
    <SelectContent>
      {accounts.map((a) => (
        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const AccountMappingPanel = ({
  budgets,
  accounts,
  paymentSources,
  budgetId,
  defaultAccountId,
  accountMapping,
  batchError,
  onBudgetChange,
  onDefaultAccountChange,
  onSourceMap,
}: AccountMappingPanelProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Budget &amp; accounts</CardTitle>
      <CardDescription>
        Choose the budget, map each payment source to one of your accounts, and pick a default
        account for income and any unmapped rows.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="xlsx-budget">Budget</Label>
          <Select value={budgetId ?? ""} onValueChange={onBudgetChange}>
            <SelectTrigger id="xlsx-budget" className="w-56"><SelectValue placeholder="Select a budget" /></SelectTrigger>
            <SelectContent>
              {budgets.map((b) => (
                <SelectItem key={b.id} value={b.id}>{monthName(b.year, b.month)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="xlsx-default-account">Default account (income &amp; unmapped)</Label>
          <AccountSelect
            id="xlsx-default-account"
            value={defaultAccountId}
            accounts={accounts}
            onChange={onDefaultAccountChange}
          />
        </div>
      </div>

      {paymentSources.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Payment sources</p>
          {paymentSources.map((source) => (
            <div key={source} className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{source}</span>
              <AccountSelect
                id={`xlsx-source-${source}`}
                value={accountMapping[source] ?? null}
                accounts={accounts}
                onChange={(accountId) => onSourceMap(source, accountId)}
              />
            </div>
          ))}
        </div>
      ) : null}

      {batchError ? <p className="text-sm text-danger" role="alert">{batchError}</p> : null}
    </CardContent>
  </Card>
);
