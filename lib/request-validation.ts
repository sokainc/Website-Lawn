const MARKET_TIME_ZONE = "America/Indiana/Indianapolis";

export function todayInMarket(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function isValidPhone(value: string): boolean {
  if (!/^[+()\-\s.\d]{7,24}$/.test(value)) return false;
  const digitCount = value.replace(/\D/g, "").length;
  return digitCount >= 10 && digitCount <= 15;
}

export function isValidPreferredDate(value: string, today = todayInMarket()): boolean {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value && value >= today;
}
