import { useState } from "react";

import type { CreateTransactionDto, Transaction, UpdateTransactionDto } from "@/types/api";
import type { Budget } from "@/types/budget";

interface UseTransactionDetailsOptions {
  transactions: Transaction[];
  /** Budget summaries for the modal's budget select. */
  budgets: Budget[];
  // eslint-disable-next-line no-unused-vars
  fetchBudgetById: (id: string) => Promise<Budget>;
  // eslint-disable-next-line no-unused-vars
  updateTransaction: (id: string, data: UpdateTransactionDto) => Promise<void>;
  onSaved: () => void;
}

/**
 * State for the "Open details" panel (TransactionFormModal in edit mode), where
 * description and the linked plan are edited. Returns props to spread onto
 * the modal plus `openDetails(id)`.
 */
export function useTransactionDetails({
  transactions,
  budgets,
  fetchBudgetById,
  updateTransaction,
  onSaved,
}: UseTransactionDetailsOptions) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  // Budget summaries carry no items; the panel needs them to offer the linked plan.
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDetails = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) {
      return;
    }
    setEditingTransaction(tx);
    setEditingBudget(null);
    if (tx.budgetId) {
      fetchBudgetById(tx.budgetId)
        .then(setEditingBudget)
        .catch(() => setEditingBudget(null));
    }
  };

  const handleClose = () => {
    setEditingTransaction(null);
    setEditingBudget(null);
  };

  const handleSubmit = async (values: CreateTransactionDto) => {
    if (!editingTransaction) {
      return;
    }
    setIsSubmitting(true);
    try {
      await updateTransaction(editingTransaction.id, values);
      onSaved();
      handleClose();
    } catch {
      // error toast already surfaced by useTransactions
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    openDetails,
    modalProps: {
      open: editingTransaction !== null,
      editingTransaction,
      budgets: budgets.map((b) => (b.id === editingBudget?.id ? editingBudget : b)),
      onClose: handleClose,
      onSubmit: handleSubmit,
      isSubmitting,
    },
  };
}
