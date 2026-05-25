import type { Locale } from "@/lib/types";

export type RSVPInput = {
  name?: unknown;
  attendance?: unknown;
  guestCount?: unknown;
  phone?: unknown;
  message?: unknown;
  locale?: unknown;
};

export type ValidRSVP = {
  name: string;
  attendance: "yes" | "no";
  guestCount: number;
  phone: string;
  message: string;
  locale: Locale;
};

const clean = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export function validateRSVP(input: RSVPInput): { data?: ValidRSVP; error?: string } {
  const name = clean(input.name, 120);
  const attendance = input.attendance === "yes" || input.attendance === "no" ? input.attendance : "";
  const phone = clean(input.phone, 60);
  const message = clean(input.message, 600);
  const guestCountNumber = Number(input.guestCount);
  const locale = input.locale === "en" ? "en" : "th";

  if (!name) {
    return { error: "Name is required." };
  }

  if (!attendance) {
    return { error: "Attendance is required." };
  }

  if (!Number.isInteger(guestCountNumber) || guestCountNumber < 0 || guestCountNumber > 10) {
    return { error: "Guest count must be between 0 and 10." };
  }

  if (attendance === "yes" && guestCountNumber < 1) {
    return { error: "Guest count must be at least 1 when attending." };
  }

  if (!phone) {
    return { error: "Phone number is required." };
  }

  return {
    data: {
      name,
      attendance,
      guestCount: attendance === "no" ? 0 : guestCountNumber,
      phone,
      message,
      locale
    }
  };
}
