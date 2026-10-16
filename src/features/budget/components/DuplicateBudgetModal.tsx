import { useForm } from "react-hook-form";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { useDuplicateBudget } from "@/features/budget/api/useBudgetMutations";
import { nextPeriod } from "@/features/budget/model/budget-totals";
import { duplicateBudgetErrorCopy } from "@/features/budget/model/duplicate-budget-errors";
import { periodLabel } from "@/features/budget/model/period";
import { useSnackbar } from "@/hooks";
import { notifyError } from "@/shared/errors";
import { MONTHS, type Budget } from "@/types/budget";

/** Mount only while open: every opening starts from the source's next month. */
export interface DuplicateBudgetModalProps {
  sourceBudget: Pick<Budget, "id" | "year" | "month">;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onDuplicated: (created: Budget) => void;
}

interface DuplicateFormValues {
  year: number;
  month: number;
}

export const DuplicateBudgetModal = ({
  sourceBudget,
  onClose,
  onDuplicated,
}: DuplicateBudgetModalProps) => {
  const snackbar = useSnackbar();
  const duplicate = useDuplicateBudget();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DuplicateFormValues>({
    defaultValues: nextPeriod(sourceBudget),
    mode: "onTouched",
  });

  const selectedMonth = watch("month");

  // Default target = the month after the source ("clone April's plan into May").
  const onSubmit = handleSubmit(async ({ year, month }) => {
    const target = periodLabel({ year, month });
    try {
      const created = await duplicate.mutateAsync({ sourceId: sourceBudget.id, year, month });
      snackbar.success({ title: "Budget duplicated", description: `Cloned into ${target}.` });
      onDuplicated(created);
      onClose();
    } catch (err) {
      // `meta.silent`: this modal owns the copy (errorCode → title/description).
      notifyError(err, {
        ...duplicateBudgetErrorCopy(err, target),
        context: { source: "budget.duplicate" },
      });
    }
  });

  return (
    <Modal open onClose={onClose} title="Duplicate budget">
      <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4" noValidate>
        <p className="text-sm text-muted-foreground">
          Clones income and expense items from{" "}
          <span className="font-medium text-foreground">
            {MONTHS[sourceBudget.month]} {sourceBudget.year}
          </span>{" "}
          into a new month.{" "}
          <span className="font-medium text-foreground">Transactions are not copied.</span>
        </p>

        {/* Target month */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="month">Target month</Label>
          <Select
            value={String(selectedMonth)}
            onValueChange={(v) => setValue("month", Number(v), { shouldValidate: true })}
          >
            <SelectTrigger id="month">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={i} value={String(i)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("month", {
              required: "Month is required",
              min: { value: 0, message: "Month must be between January and December" },
              max: { value: 11, message: "Month must be between January and December" },
            })}
          />
          {errors.month && (
            <p className="mt-1 text-sm text-danger" role="alert">
              {errors.month.message}
            </p>
          )}
        </div>

        {/* Target year */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="year">Target year</Label>
          <Input
            id="year"
            type="number"
            min={2000}
            max={2100}
            aria-invalid={errors.year ? "true" : "false"}
            disabled={isSubmitting}
            {...register("year", {
              required: "Year is required",
              valueAsNumber: true,
              min: { value: 2000, message: "Year must be 2000 or later" },
              max: { value: 2100, message: "Year must be 2100 or earlier" },
            })}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-danger" role="alert">
              {errors.year.message}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Duplicating…" : "Duplicate"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
