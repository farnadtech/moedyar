// Persian/Solar calendar utility functions
import jalaali from "jalaali-js";

const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const persianWeekdays = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
  "شنبه",
];

// Convert Gregorian date to Persian using jalaali-js
export function gregorianToPersian(date: Date | string): {
  year: number;
  month: number;
  day: number;
} {
  const d = typeof date === "string" ? new Date(date) : date;

  try {
    const persianDate = jalaali.toJalaali(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
    );
    return {
      year: persianDate.jy,
      month: persianDate.jm,
      day: persianDate.jd,
    };
  } catch (error) {
    // Fallback to simple approximation
    const gregorianYear = d.getFullYear();
    const persianYear = gregorianYear - 621;

    return {
      year: persianYear,
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
  }
}

// Format Persian date for display
export function formatPersianDate(
  date: Date | string,
  options: {
    includeWeekday?: boolean;
    includeTime?: boolean;
    format?: "short" | "long";
  } = {},
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // For now, we'll use the browser's built-in Persian locale support
  // which provides solar calendar dates
  const formatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: options.format === "short" ? "numeric" : "long",
    day: "numeric",
    ...(options.includeWeekday && { weekday: "long" }),
    ...(options.includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  });

  return formatter.format(d);
}

// Format relative time in Persian
export function formatPersianRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    const absDays = Math.abs(diffInDays);
    if (absDays === 1) return "دیروز";
    if (absDays < 7) return `${absDays} روز پیش`;
    if (absDays < 30) return `${Math.floor(absDays / 7)} هفته پیش`;
    if (absDays < 365) return `${Math.floor(absDays / 30)} ماه پیش`;
    return `${Math.floor(absDays / 365)} سال پیش`;
  } else if (diffInDays === 0) {
    return "امروز";
  } else if (diffInDays === 1) {
    return "فردا";
  } else if (diffInDays < 7) {
    return `${diffInDays} روز دیگر`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)} هفته دیگر`;
  } else if (diffInDays < 365) {
    return `${Math.floor(diffInDays / 30)} ماه دیگر`;
  } else {
    return `${Math.floor(diffInDays / 365)} سال دیگر`;
  }
}

// Get Persian weekday name
export function getPersianWeekday(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return persianWeekdays[d.getDay()];
}

// Format time in Persian
export function formatPersianTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
