import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges conditional classes AND resolves Tailwind conflicts (last wins).
// Without twMerge, `cn('p-2', 'p-4')` keeps both; with it, p-4 wins. Essential for variant components.
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
