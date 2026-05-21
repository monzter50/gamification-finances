import { useEffect } from "react";
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
import { useSnackbar } from "@/hooks";
import { budgetService } from "@/services/budget.service";
import { MONTHS } from "@/types/budget";
import type { Budget } from "@/types/budget";
import { ApplicationError } from "@/utils/errors";

interface DuplicateBudgetModalProps {
  open:         boolean;
  sourceBudget: Pick<Budget, "id" | "year" | "month">;
  onClose:      () => void;
  // eslint-disable-next-line no-unused-vars
  onDuplicated: (created: Budget) => void;
}

interface DuplicateFormValues {
  year:  number;
  month: number;
}

/**
 * Default target = source month + 1, rolling over December → next January.
 * Matches the 99% use case ("clone April's plan into May").
 */
const nextPeriod = (source: Pick<Budget, "year" | "month">): DuplicateFormValues => ({
  month: (source.month + 1) % 12,
  year:  source.month === 11 ? source.year + 1 : source.year,
});

export function DuplicateBudgetModal({
  open,
  sourceBudget,
  onClose,
  onDuplicated,
}: DuplicateBudgetModalProps) {
  const snackbar = useSnackbar();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DuplicateFormValues>({
    defaultValues: nextPeriod(sourceBudget),
    mode:          "onTouched",
  });

  // Re-seed defaults whenever the modal opens against a different source.
  useEffect(() => {
    if (open) { reset(nextPeriod(sourceBudget)); }
  }, [ open, sourceBudget, reset ]);

  const selectedMonth = watch("month");

  const onSubmit = handleSubmit(async ({ year, month }) => {
    try {
      const created = await budgetService.duplicateBudget(sourceBudget.id, { year, month });
      snackbar.success({
        title:       "Budget duplicated",
        description: `Cloned into ${MONTHS[month]} ${year}.`,
      });
      onDuplicated(created);
      onClose();
    } catch (err) {
      handleDuplicateError(err);
    }
  });

  /**
   * Surface per-status messaging per duplicate-budget-frontend.md §6.
   * The service layer pre-mapped each branch to a stable `code`, so we
   * branch on that rather than re-parsing strings.
   */
  const handleDuplicateError = (err: unknown) => {
    if (!(err instanceof ApplicationError)) {
      snackbar.error({
        title:       "Unexpected error",
        description: err instanceof Error ? err.message : "Please try again.",
      });
      return;
    }

    switch (err.code) {
      case "BUDGET_CONFLICT":
        snackbar.error({
          title:       `${MONTHS[selectedMonth]} is already taken`,
          description: "You already have a budget for that period. Open or delete it first.",
        });
        break;
      case "STALE_ACCOUNT":
        // Server message includes the offending account ids — surface verbatim.
        snackbar.error({
          title:       "Source has stale account references",
          description: err.message,
        });
        break;
      case "FORBIDDEN":
        snackbar.error({ title: "Not yours", description: err.message });
        break;
      case "NOT_FOUND":
        snackbar.error({ title: "Source budget missing", description: err.message });
        break;
      case "VALIDATION":
        snackbar.error({ title: "Invalid year or month", description: err.message });
        break;
      default:
        snackbar.error({
          title:       "Duplicate failed",
          description: err.message,
        });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Duplicate budget">
      <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4" noValidate>
        <p className="text-sm text-muted-foreground">
          Clones income and expense items from{" "}
          <span className="font-medium text-foreground">
            {MONTHS[sourceBudget.month]} {sourceBudget.year}
          </span>{" "}
          into a new month. <span className="font-medium text-foreground">Transactions are not copied.</span>
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
              min:      { value: 0,  message: "Month must be between January and December" },
              max:      { value: 11, message: "Month must be between January and December" },
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
              required:    "Year is required",
              valueAsNumber: true,
              min:         { value: 2000, message: "Year must be 2000 or later" },
              max:         { value: 2100, message: "Year must be 2100 or earlier" },
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
}
