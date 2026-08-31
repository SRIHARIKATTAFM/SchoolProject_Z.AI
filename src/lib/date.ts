// Timezone-stable date formatting.
// All formatting forces `timeZone: "UTC"` so the server (Node) and client (browser)
// always produce identical strings — preventing React hydration mismatches that
// occur when a UTC instant falls on different local calendar days in each runtime.

export function fmtDate(
  iso: string | Date,
  locale: string = "en-IN",
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  return new Date(iso).toLocaleDateString(locale, { timeZone: "UTC", ...opts });
}

export function fmtDateTime(iso: string | Date, locale: string = "en-IN"): string {
  return new Date(iso).toLocaleString(locale, { timeZone: "UTC", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function fmtMonthShort(iso: string | Date, locale: string = "en-US"): string {
  return new Date(iso).toLocaleDateString(locale, { timeZone: "UTC", month: "short" });
}

// Day-of-month from the UTC instant (not local timezone).
export function utcDay(iso: string | Date): number {
  return new Date(iso).getUTCDate();
}
