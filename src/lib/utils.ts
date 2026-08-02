import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Add the current value to the front of the list if it's not already present. */
export function withCurrent(list: string[], current?: string): string[] {
  if (current && !list.includes(current)) return [current, ...list];
  return list;
}

/** Convert a Gregorian year number (e.g. 2026) to a Persian year string (e.g. "۱۴۰۵"). */
export function toPersianYear(gregorian: number): string {
  const persianNum = gregorian - 621;
  return String(persianNum).replace(/[0-9]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 1728),
  );
}
