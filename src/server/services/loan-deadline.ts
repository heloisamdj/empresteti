import { LOAN_DAYS } from "@/lib/contracts";

const timeZone = "America/Sao_Paulo";
const civilDate = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const zoneOffset = new Intl.DateTimeFormat("en-US", {
  timeZone,
  timeZoneName: "longOffset",
});

function offsetAt(instant: number) {
  const zone = zoneOffset
    .formatToParts(instant)
    .find((part) => part.type === "timeZoneName")?.value;
  const match = zone?.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  return (
    (sign === "+" ? 1 : -1) * (Number(hours) * 60 + Number(minutes)) * 60_000
  );
}

export function loanDeadline(borrowedAt: Date) {
  const parts = civilDate.formatToParts(borrowedAt);
  const part = (name: "year" | "month" | "day") =>
    Number(parts.find((entry) => entry.type === name)?.value);
  // A data UTC intermediária representa só o calendário civil de São Paulo.
  const date = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  for (let remaining = LOAN_DAYS; remaining > 0;) {
    date.setUTCDate(date.getUTCDate() + 1);
    const weekday = date.getUTCDay();
    if (weekday >= 1 && weekday <= 5) remaining--;
  }
  date.setUTCDate(date.getUTCDate() + 1);
  const midnight = date.getTime();
  const initialOffset = offsetAt(midnight);
  const localOffset = offsetAt(midnight - initialOffset);
  return new Date(midnight - localOffset - 1);
}
