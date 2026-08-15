export function daysWaiting(applicationFiledDate: Date | string | null): number | null {
  if (!applicationFiledDate) return null;
  const filed = new Date(applicationFiledDate);
  if (Number.isNaN(filed.getTime())) return null;
  const ms = Date.now() - filed.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function yearsWaiting(applicationFiledDate: Date | string | null): number | null {
  const days = daysWaiting(applicationFiledDate);
  return days == null ? null : days / 365.25;
}
