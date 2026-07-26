export function formatPrice(price: string | number, currency = 'EUR') {
  const value = typeof price === 'string' ? Number(price) : price;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatRelativeDate(date: string | Date) {
  const value = typeof date === 'string' ? new Date(date) : date;
  const diffMs = value.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffDays) >= 1) return formatter.format(diffDays, 'day');

  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) >= 1) return formatter.format(diffHours, 'hour');

  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return formatter.format(diffMinutes, 'minute');
}
