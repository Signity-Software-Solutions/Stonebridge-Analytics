/** Display formatting for money. Pure UI: the amounts come from the backend. */

export function money(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${Math.round(n / 1000).toLocaleString()}K`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export function moneyExact(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
