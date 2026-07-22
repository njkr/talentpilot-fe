import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

// Same label/error/helper pattern as Input — every form field looks and behaves consistently.
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, helper, className, id, ...props }, ref) => {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-err` : undefined}
        className={cn(
          "w-full min-h-24 rounded-lg border bg-card px-3 py-2 text-sm text-ink placeholder:text-ink-muted",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          "focus-visible:ring-offset-1 disabled:opacity-50",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      />
      {error && (
        <p id={`${inputId}-err`} className="text-xs text-danger">
          {error}
        </p>
      )}
      {helper && !error && <p className="text-xs text-ink-muted">{helper}</p>}
    </div>
  );
});
Textarea.displayName = "Textarea";
