import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidateFor } from "@/api/invalidation";
import { toast } from "@/hooks/use-toast";
import { accountService } from "@/services/account.service";
import { AppError, normalizeError } from "@/shared/errors";
import type { Account, CreateAccountDto, UpdateAccountDto } from "@/types/api";

// TODO(i18n): success copy
const notifySuccess = (title: string, description: string) => toast({ title, description });

/*
 * Errors: the global MutationCache toasts failures with `meta.errorTitle`.
 * TODO(openapi): /accounts endpoints are missing from the spec, so these use
 * the legacy service (status only, no backend errorCode) until documented.
 */

export const useCreateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAccountDto): Promise<Account | undefined> =>
      (await accountService.create(dto)).data,
    meta: { errorTitle: "Couldn't create account" },
    onSuccess: (_account, dto) => {
      notifySuccess("Account created", `"${dto.name}" has been created.`);
      return invalidateFor(qc, "account");
    },
  });
};

export const useUpdateAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateAccountDto }) =>
      (await accountService.update(id, dto)).data,
    meta: { errorTitle: "Couldn't update account" },
    onSuccess: () => {
      notifySuccess("Account updated", "Your account has been updated.");
      return invalidateFor(qc, "account");
    },
  });
};

export const useDeleteAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await accountService.remove(id);
      } catch (err) {
        // The legacy client drops the body, so recover the backend's meaning
        // from the status: 409 on delete = the account still has transactions.
        const e = normalizeError(err);
        if (e.status === 409) {
          throw new AppError({
            message: e.message,
            status: 409,
            code: "ACCOUNT_HAS_TRANSACTIONS",
            cause: err,
          });
        }
        throw e;
      }
    },
    meta: { errorTitle: "Couldn't delete account" },
    onSuccess: () => {
      notifySuccess("Account deleted", "The account has been removed.");
      return invalidateFor(qc, "account");
    },
  });
};
