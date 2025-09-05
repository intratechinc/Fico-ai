export function formatNumber(value: number): string {
  if (Number.isNaN(value) || value === null || value === undefined) return '';
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2);
}

export function formatUSD(value: number): string {
  if (Number.isNaN(value) || value === null || value === undefined) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
  } catch {
    // Fallback
    const fixed = Math.round(value * 100) / 100;
    return `$${fixed.toFixed(2)}`;
  }
}


