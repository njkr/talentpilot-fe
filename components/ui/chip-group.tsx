import { cn } from "@/lib/utils";

interface ChipGroupProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}

// A small reusable segmented control. role="radiogroup" + aria-checked makes it announce
// correctly to screen readers — a plain row of buttons would read as unrelated actions.
export function ChipGroup<T extends string>({ value, onChange, options }: ChipGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", value === o.value ? "bg-primary text-white" : "bg-bg text-ink-secondary hover:bg-border/40")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
