import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { PostApiTransactionsImportXlsxConfirmBody } from "@/api/generated/models";
import {
  postApiTransactionsImportXlsxConfirm,
  postApiTransactionsImportXlsxParse,
} from "@/api/generated/transactions/transactions";
import { invalidateFor } from "@/api/invalidation";
import { unwrap } from "@/api/unwrap";
import {
  toConfirmSummary,
  toParseResult,
} from "@/features/transactions/xlsx-import/model/payloads";
import type {
  ConfirmXlsxDto,
  ParseResponseData,
} from "@/features/transactions/xlsx-import/model/types";

/** Upload the .xlsx; the server parses it without writing anything. */
export const useParseWorkbook = () =>
  useMutation({
    mutationFn: async (file: File) => {
      const body = await unwrap(postApiTransactionsImportXlsxParse({ file }));
      // TODO(spec): parse rows lack `category`; the review types keep it optional.
      return toParseResult(body.data as Partial<ParseResponseData> | undefined);
    },
    meta: { errorTitle: "Could not read workbook" },
  });

/**
 * Bulk-create the reviewed batch (atomic). It creates transactions AND budget
 * items, so balances, budgets and summaries are all stale afterwards.
 */
export const useConfirmImport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ConfirmXlsxDto) => {
      // TODO(spec): the spec has no `category` on transaction rows; the backend reads it.
      const body = await unwrap(
        postApiTransactionsImportXlsxConfirm(payload as PostApiTransactionsImportXlsxConfirmBody),
      );
      return toConfirmSummary(body.data);
    },
    meta: { errorTitle: "Import failed" },
    onSuccess: () => invalidateFor(qc, "transaction"),
  });
};
