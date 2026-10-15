import { toUserMessage } from "@/shared/errors/messages";
import { normalizeError } from "@/shared/errors/normalize";

/** Minimal shape of react-hook-form's `setError` — avoids coupling to its generics. */
// eslint-disable-next-line no-unused-vars -- param names in a function type
type SetFieldError = (name: string, error: { type: string; message: string }) => void;

export interface ApplyFieldErrorsResult {
  /** Field errors that matched a form field and were shown inline. */
  applied: number;
  /** Message for anything that couldn't be shown on a field (render above the submit button). */
  formMessage?: string;
}

/**
 * Put backend validation errors onto react-hook-form fields.
 *
 *   onError: (err) => {
 *     const { formMessage } = applyFieldErrors(err, setError, ["amount", "date"]);
 *     setFormError(formMessage);
 *   }
 *
 * `fields` lists the form's field names; errors for other fields (or with no
 * field) are collected into `formMessage` so nothing is silently dropped.
 */
export const applyFieldErrors = (
  error: unknown,
  setError: SetFieldError,
  fields: readonly string[],
): ApplyFieldErrorsResult => {
  const e = normalizeError(error);
  const known = new Set(fields);
  let applied = 0;
  const leftovers: string[] = [];

  for (const fe of e.fieldErrors) {
    if (fe.field && known.has(fe.field)) {
      setError(fe.field, { type: "server", message: fe.message });
      applied++;
    } else {
      leftovers.push(fe.message);
    }
  }

  if (e.fieldErrors.length === 0) return { applied, formMessage: toUserMessage(e) };
  return {
    applied,
    formMessage: leftovers.length ? [...new Set(leftovers)].join(". ") : undefined,
  };
};
