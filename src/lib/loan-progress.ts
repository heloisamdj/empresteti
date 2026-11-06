export function loanProgress(borrowedAt: Date, dueDate: Date, now: Date) {
  const remaining = dueDate.getTime() - now.getTime();
  if (remaining <= 0) return 1;

  const duration = dueDate.getTime() - borrowedAt.getTime();
  if (duration <= 0) return 0;

  return Math.max(0, 1 - remaining / duration);
}
