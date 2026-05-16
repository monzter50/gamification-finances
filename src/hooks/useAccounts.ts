import { ApiError } from "@aglaya/api-core";
import { logger } from "@aglaya/logger";
import { useCallback, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { accountService } from "@/services/account.service";
import type { Account, CreateAccountDto, UpdateAccountDto } from "@/types/api";

import { useSnackbar } from "./useSnackbar";

interface UseAccountsReturn {
  accounts: Account[];
  isLoading: boolean;
  isMutating: boolean;
  refresh: () => Promise<void>;
  createAccount: (data: CreateAccountDto) => Promise<Account | null>;
  // eslint-disable-next-line no-unused-vars
  updateAccount: (id: string, data: UpdateAccountDto) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
}

/**
 * Accounts CRUD hook.
 *
 * Reads from AuthContext (which already holds the canonical list) and writes
 * via `accountService`, then refreshes the context so every consumer — the
 * transactions modal, the budget tracking page, the accounts page — sees the
 * new balance immediately.
 *
 * ⚠️ This hook is not a React Query cache. Deletes/edits trigger a full
 * `GET /accounts` afterwards. For an app this size that's fine; the ETag
 * layer makes the round-trip cheap on 304s.
 */
export function useAccounts(): UseAccountsReturn {
  const { accounts, refreshAccounts } = useAuth();
  const snackbar = useSnackbar();

  const [ isLoading, setIsLoading ] = useState(false);
  const [ isMutating, setIsMutating ] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await refreshAccounts();
    } finally {
      setIsLoading(false);
    }
  }, [ refreshAccounts ]);

  const createAccount = useCallback(
    async (data: CreateAccountDto): Promise<Account | null> => {
      setIsMutating(true);
      try {
        logger.debug("Creating account", data);
        const res = await accountService.create(data);
        await refreshAccounts();
        snackbar.success({
          title: "Account created",
          description: `"${data.name}" has been created successfully.`,
        });
        return res.data ?? null;
      } catch (error) {
        snackbar.error({
          title: "Failed to create account",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [ refreshAccounts, snackbar ]
  );

  const updateAccount = useCallback(
    async (id: string, data: UpdateAccountDto): Promise<Account | null> => {
      setIsMutating(true);
      try {
        logger.debug("Updating account", { id,
          data });
        const res = await accountService.update(id, data);
        await refreshAccounts();
        snackbar.success({
          title: "Account updated",
          description: "Your account has been updated.",
        });
        return res.data ?? null;
      } catch (error) {
        snackbar.error({
          title: "Failed to update account",
          description: error instanceof Error ? error.message : "An error occurred",
        });
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [ refreshAccounts, snackbar ]
  );

  const deleteAccount = useCallback(
    async (id: string): Promise<boolean> => {
      setIsMutating(true);
      try {
        logger.debug("Deleting account", { id });
        await accountService.remove(id);
        await refreshAccounts();
        snackbar.success({
          title: "Account deleted",
          description: "The account has been removed.",
        });
        return true;
      } catch (error) {
        // Per guide §5 / §11 the server returns 409 when the account has
        // transactions. Surface a user-friendly reason in that case.
        const isConflict = error instanceof ApiError && error.status === 409;

        snackbar.error({
          title: isConflict ? "Cannot delete account" : "Failed to delete account",
          description: isConflict
            ? "This account has transactions. Delete or reassign them first."
            : error instanceof Error ? error.message : "An error occurred",
        });
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [ refreshAccounts, snackbar ]
  );

  return {
    accounts,
    isLoading,
    isMutating,
    refresh,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
