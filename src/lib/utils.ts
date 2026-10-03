type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/** The single place prices are formatted: 4.25 -> "£4.25". */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

/**
 * Whole-pound display for the budget dial, which only moves in £5 steps.
 * Product prices always go through `formatPrice`.
 */
export function formatBudget(value: number): string {
  return `£${Math.round(value)}`;
}

/**
 * Formatted by hand rather than with Intl compact notation: Node and the
 * browser disagree on the suffix casing ("1.8M" vs "1.8m"), which produces a
 * hydration mismatch.
 */
export function formatCompactNumber(value: number): string {
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, "");
  if (value >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trim(value / 1_000)}k`;
  return String(Math.round(value));
}
