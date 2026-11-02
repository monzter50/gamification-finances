import { CreditCard, Pencil, Trash2 } from "lucide-react";

import { Money } from "@/components/ui";
import { ACCOUNT_CARD_STYLES, ACCOUNT_TYPE_LABELS } from "@/lib/account-styles";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/api";

export interface AccountCardProps {
  account: Account;
  // eslint-disable-next-line no-unused-vars
  onEdit: (account: Account) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (account: Account) => void;
}

/** Credit-card style tile. Raw palette is the documented escape hatch — see lib/account-styles.ts. */
export const AccountCard = ({ account, onEdit, onDelete }: AccountCardProps) => {
  const style = ACCOUNT_CARD_STYLES[account.type] ?? ACCOUNT_CARD_STYLES.checking;

  return (
    <div
      className={cn(
        "group relative w-full max-w-sm h-48 rounded-2xl bg-gradient-to-br p-5 shadow-lg overflow-hidden select-none",
        style.gradient,
      )}
    >
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-14 -left-8 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />

      <div className="absolute top-3 right-3 z-20 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(account)}
          className={cn(
            "p-1.5 rounded-full bg-white/10 hover:bg-white/25 transition-colors",
            style.textColor,
          )}
          aria-label={`Edit ${account.name}`}
          type="button"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(account)}
          className={cn(
            "p-1.5 rounded-full bg-white/10 hover:bg-danger/60 transition-colors",
            style.textColor,
          )}
          aria-label={`Delete ${account.name}`}
          type="button"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="relative z-10 flex items-start justify-between pr-16">
        {/* EMV Chip — decorative; see lib/account-styles.ts for the chip palette */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <div
          className={cn(
            "w-10 h-7 rounded-md bg-gradient-to-br shadow-md flex items-center justify-center",
            style.chipColor,
          )}
        >
          {/* eslint-disable-next-line no-restricted-syntax */}
          <div className="w-7 h-5 rounded-[3px] border border-yellow-600/40 grid grid-cols-3 grid-rows-3 gap-[2px] p-[2px]">
            {/* eslint-disable-next-line no-restricted-syntax */}
            {Array.from({ length: 9 }).map((_, i) => (
              // eslint-disable-next-line no-restricted-syntax
              <div key={i} className="bg-yellow-600/40 rounded-[1px]" />
            ))}
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em] opacity-70",
            style.textColor,
          )}
        >
          {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
        </span>
      </div>

      <div className="relative z-10 mt-4">
        <p className={cn("text-[10px] uppercase tracking-widest opacity-50", style.textColor)}>
          Balance
        </p>
        <div className={cn("font-bold leading-tight", style.textColor)}>
          <Money
            value={account.balance}
            currency={account.currency}
            size="md"
            className={cn("font-bold", style.textColor)}
          />
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between">
        <p className={cn("text-sm font-semibold tracking-wide truncate pr-4", style.textColor)}>
          {account.name}
        </p>
        <CreditCard size={22} className={cn("opacity-40 shrink-0", style.textColor)} />
      </div>
    </div>
  );
};
