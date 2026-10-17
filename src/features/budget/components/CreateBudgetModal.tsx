import { useState } from "react";

import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useCreateBudget } from "@/features/budget/api/useBudgetMutations";
import { periodLabel } from "@/features/budget/model/period";
import { useSnackbar } from "@/shared/hooks";
import { MONTHS } from "@/types/budget";

const YEARS_AROUND_NOW = 2;

export interface CreateBudgetModalProps {
  onClose: () => void;
}

// TODO(i18n)
/**
 * Create an empty budget for a month. Mount it only while open, so every
 * opening starts at the current month. A period that's already taken is
 * rejected by the backend (409 BUDGET_ALREADY_EXISTS) and toasted globally.
 */
export const CreateBudgetModal = ({ onClose }: CreateBudgetModalProps) => {
  const snackbar = useSnackbar();
  const create = useCreateBudget();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const years = Array.from(
    { length: YEARS_AROUND_NOW * 2 + 1 },
    (_, i) => now.getFullYear() - YEARS_AROUND_NOW + i,
  );

  const handleCreate = () =>
    create.mutate(
      { year, month },
      {
        onSuccess: () => {
          snackbar.success({
            title: "Budget created!",
            description: `Budget for ${periodLabel({ year, month })} has been created.`,
          });
          onClose();
        },
      },
    );

  return (
    <Modal open onClose={onClose} title="Create New Budget">
      <div className="px-6 pb-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a budget for a specific month and year. You can add income and expense items after
          creation.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="budget-year">Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger id="budget-year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="budget-month">Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger id="budget-month">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((name, index) => (
                  <SelectItem key={name} value={String(index)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} className="flex-1" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create Budget"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
