import type { BlockedDateRow, BookingRow, DayRange } from "./supabase-client";

export type DateStatus =
  | "available"
  | "partially_booked"
  | "pending"
  | "fully_booked"
  | "blocked"
  | "sharing_ok";

export const statusText: Record<DateStatus, string> = {
  available: "Available",
  partially_booked: "Partially booked",
  pending: "Pending",
  fully_booked: "Fully booked",
  blocked: "Blocked",
  sharing_ok: "Sharing OK",
};

export const dayRangeLabels: Record<DayRange, string> = {
  first_half: "First half",
  second_half: "Second half",
  full_day: "Full Day",
};

const reservingStatuses = ["pending", "approved"];

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = firstDay.getDay();

  return {
    label: monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    leadingEmptyDays,
    days: Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1);
      return {
        dayNumber: index + 1,
        dateKey: formatDateKey(date),
      };
    }),
  };
}

export function isDateBlocked(dateKey: string, blockedRanges: BlockedDateRow[]) {
  return blockedRanges.some(
    (range) => dateKey >= range.start_date && dateKey <= range.end_date,
  );
}

export function getActiveBookings(dateKey: string, bookings: BookingRow[]) {
  return bookings.filter(
    (booking) =>
      booking.booking_date === dateKey &&
      reservingStatuses.includes(booking.status),
  );
}

export function getAvailableDayRanges(
  dateKey: string,
  bookings: BookingRow[],
  blockedRanges: BlockedDateRow[],
): DayRange[] {
  if (isDateBlocked(dateKey, blockedRanges)) {
    return [];
  }

  const activeBookings = getActiveBookings(dateKey, bookings);
  const hasFullDay = activeBookings.some(
    (booking) => booking.day_range === "full_day",
  );

  if (hasFullDay) {
    return [];
  }

  const firstHalfReserved = activeBookings.some(
    (booking) => booking.day_range === "first_half",
  );
  const secondHalfReserved = activeBookings.some(
    (booking) => booking.day_range === "second_half",
  );

  if (firstHalfReserved && secondHalfReserved) {
    return [];
  }

  if (firstHalfReserved) {
    return ["second_half"];
  }

  if (secondHalfReserved) {
    return ["first_half"];
  }

  return ["first_half", "second_half", "full_day"];
}

export function hasSharingOk(dateKey: string, bookings: BookingRow[]) {
  return getActiveBookings(dateKey, bookings).some(
    (booking) => booking.sharing_ok,
  );
}

export function getDateStatus(
  dateKey: string,
  bookings: BookingRow[],
  blockedRanges: BlockedDateRow[],
): DateStatus {
  if (isDateBlocked(dateKey, blockedRanges)) {
    return "blocked";
  }

  const activeBookings = getActiveBookings(dateKey, bookings);

  if (activeBookings.length === 0) {
    return "available";
  }

  if (activeBookings.some((booking) => booking.status === "pending")) {
    return "pending";
  }

  if (getAvailableDayRanges(dateKey, bookings, blockedRanges).length === 0) {
    return "fully_booked";
  }

  return "partially_booked";
}
