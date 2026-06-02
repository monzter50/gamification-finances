/**
 * Types for the statement-import flow.
 * Shapes mirror the backend contract (api-gamification-finances):
 *   POST /transactions/import/extract  -> ExtractResponseData
 *   POST /transactions/import/confirm  -> ConfirmImportResult
 */
import type { Transaction } from "@/types/api";

export type TransactionType = "income" | "expense";
export type ExtractionConfidence = "high" | "medium" | "low";
export type ExtractionSource = "mock" | "claude";

/** One row as extracted from the image (no budget/account — the user picks those). */
export interface ExtractedTransaction {
  date: string;            // ISO YYYY-MM-DD, "" if unreadable
  amount: number;          // > 0
  vendor: string;
  type: TransactionType;
  description?: string;
  confidence: ExtractionConfidence;
  sourceText: string;
}

/** /extract response payload. */
export interface ExtractResponseData {
  transactions: ExtractedTransaction[];
  count: number;
  source: ExtractionSource;
  currencyHint?: string;
}

/** An extracted row enriched with client-side review state. */
export interface ReviewRow extends ExtractedTransaction {
  /** Stable client key for React + edit/delete targeting (extracted rows have no id). */
  _id: string;
  /** Optional per-row account override (falls back to the batch account). */
  overrideAccountId?: string;
}

/** Per-row validation errors, keyed by field. */
export interface RowErrors {
  date?: string;
  amount?: string;
  vendor?: string;
}

/** One row as sent to /confirm. */
export interface ConfirmImportRow {
  date: string;            // ISO
  amount: number;
  vendor: string;
  type: TransactionType;
  description?: string;
  accountId?: string;      // per-row override
}

export interface ConfirmImportDto {
  budgetId: string;
  accountId: string;
  transactions: ConfirmImportRow[];
}

export interface ConfirmImportResult {
  createdCount: number;
  transactionIds: string[];
  transactions: Transaction[];
}
