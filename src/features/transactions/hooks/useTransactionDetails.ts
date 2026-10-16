import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { budgetDetailQuery } from "@/features/budget";
import { useUpdateTransaction } from "@/features/transactions/api/useTransactionMutations";
import type { CreateTransactionDto, Transaction } from "@/types/api";
import type { Budget } from "@/types/budget";

/**
 * State for the "Open details" panel (TransactionFormModal in edit mode), where
 * description and the linked plan are edited. Returns props to spread onto
 * the modal plus `openDetails(tx)`.
 *
 * `budgets` feeds the modal's budget select. The linked-plan select needs the
 * transaction's budget WITH its items, so that one comes from the detail query.
 */
export const useTransactionDetails = (budgets: Budget[]) => {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const update = useUpdateTransaction();

  const budgetId = editing?.budgetId ?? "";
  const { data: editingBudget } = useQuery({
    ...budgetDetailQuery(budgetId),
    enabled: budgetId !== "",
  });

  const handleClose = () => setEditing(null);

  // The MutationCache toasts failures; the panel stays open so nothing is lost.
  const handleSubmit = async (values: CreateTransactionDto) => {
    if (!editing) return;
    try {
      await update.mutateAsync({ id: editing.id, dto: values });
      handleClose();
    } catch {
      // already toasted
    }
  };

  return {
    openDetails: setEditing,
    modalProps: {
      open: editing !== null,
      editingTransaction: editing,
      budgets: budgets.map((b) => (b.id === editingBudget?.id ? editingBudget : b)),
      onClose: handleClose,
      onSubmit: handleSubmit,
      isSubmitting: update.isPending,
    },
  };
};
