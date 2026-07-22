import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { ApiError } from "@/lib/api/error";

// VALIDATION_FAILED returns fields: { email: ["must be an email"], ... }.
// Map them onto the form so errors appear inline under the right input.
export function applyFieldErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>) {
  if (err instanceof ApiError && err.code === "VALIDATION_FAILED" && err.fields) {
    for (const [field, messages] of Object.entries(err.fields)) {
      setError(field as Path<T>, { message: messages[0] });
    }
    return true; // handled inline
  }
  return false; // caller should show a top-level error
}
