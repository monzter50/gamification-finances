import { Plus, Wallet } from "lucide-react";

import { Button, EmptyState, Skeleton } from "@/components/ui";
import { useAccountsList } from "@/features/accounts/api/accountsQueries";
import { AccountCard, type AccountCardProps } from "@/features/accounts/components/AccountCard";
import { ErrorPanel } from "@/shared/errors";

export interface AccountsGridProps extends Pick<AccountCardProps, "onEdit" | "onDelete"> {
  onCreate: () => void;
}

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter";
const SKELETON_COUNT = 3;

/** Loads the account list and renders loading / error / empty / cards. */
export const AccountsGrid = ({ onCreate, onEdit, onDelete }: AccountsGridProps) => {
  const { data: accounts, isPending, isError, error, refetch } = useAccountsList();

  if (isPending) {
    return (
      <div className={GRID} aria-busy="true">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Skeleton key={i} className="w-full max-w-sm h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorPanel error={error} title="Couldn't load accounts" onRetry={() => void refetch()} />
    );
  }

  if (accounts.length === 0) {
    return (
      <EmptyState
        icon={<Wallet size={20} />}
        title="No accounts yet"
        description="Create your first account to start tracking your finances."
        action={
          <Button variant="outline" onClick={onCreate}>
            <Plus aria-hidden="true" />
            New Account
          </Button>
        }
      />
    );
  }

  return (
    <div className={GRID}>
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};
