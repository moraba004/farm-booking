"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  DateStatus,
  dayRangeLabels,
  formatDateKey,
  getActiveBookings,
  getAvailableDayRanges,
  getDateStatus,
  getMonthDays,
  hasSharingOk,
  statusText,
} from "./calendar-utils";
import {
  BlockedDateRow,
  BookingRow,
  DayRange,
  getSupabaseClient,
} from "./supabase-client";

const bookerNames = [
  "Ayman",
  "Haitham",
  "Ammar",
  "MoRa",
  "Samer",
  "Ahmad",
  "Abdullah",
  "Other",
];

const statusStyles: Record<DateStatus, string> = {
  available: "border-[#b8d6aa] bg-[#f3fbef] text-[#2f5d42]",
  partially_booked: "border-[#c5d4b6] bg-[#f7f2df] text-[#5e5b25]",
  pending: "border-[#f2d38c] bg-[#fff4d8] text-[#775018]",
  fully_booked: "border-[#efb4b4] bg-[#fff0f0] text-[#8f2424]",
  blocked: "border-[#d6d6d6] bg-[#eeeeee] text-[#505050]",
  sharing_ok: "border-[#9cc6ef] bg-[#eef7ff] text-[#195d91]",
};

const statusDotStyles: Record<DateStatus, string> = {
  available: "bg-[#2f5d42]",
  partially_booked: "bg-[#8a7a2e]",
  pending: "bg-[#d69b2d]",
  fully_booked: "bg-[#b93333]",
  blocked: "bg-[#777]",
  sharing_ok: "bg-[#1d75b9]",
};

export default function Home() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<BlockedDateRow[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedName, setSelectedName] = useState(bookerNames[0]);
  const [selectedDayRange, setSelectedDayRange] = useState<DayRange>("first_half");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const calendar = useMemo(() => getMonthDays(calendarMonth), [calendarMonth]);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const availableRanges = useMemo(
    () =>
      selectedDate
        ? getAvailableDayRanges(selectedDate, bookings, blockedRanges)
        : [],
    [blockedRanges, bookings, selectedDate],
  );

  useEffect(() => {
    async function loadAvailability() {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setErrorMessage("Please configure Supabase in .env.local.");
        setIsLoading(false);
        return;
      }

      const [
        { data: bookingData, error: bookingsError },
        { data: blockedData, error: blockedError },
      ] = await Promise.all([
        supabase.from("bookings").select("*"),
        supabase.from("blocked_dates").select("*"),
      ]);

      if (bookingsError || blockedError) {
        console.error("Calendar fetch failed:", bookingsError ?? blockedError);
        setErrorMessage("Could not load the calendar.");
      } else {
        setBookings(bookingData ?? []);
        setBlockedRanges(blockedData ?? []);
      }

      setIsLoading(false);
    }

    loadAvailability();
  }, []);

  function moveCalendarMonth(direction: -1 | 1) {
    setCalendarMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + direction,
          1,
        ),
    );
  }

  function openBookingModal(dateKey: string) {
    const ranges = getAvailableDayRanges(dateKey, bookings, blockedRanges);
    setSuccessMessage("");
    setErrorMessage("");
    setSelectedDate(dateKey);

    if (ranges.length === 0) {
      setErrorMessage("This date is not available.");
      return;
    }

    setSelectedName(bookerNames[0]);
    setSelectedDayRange(ranges[0]);
    setIsModalOpen(true);
  }

  function closeBookingModal() {
    setIsModalOpen(false);
    setSelectedName(bookerNames[0]);
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const supabase = getSupabaseClient();

    if (!supabase) {
      setErrorMessage("Please configure Supabase in .env.local.");
      return;
    }

    const ranges = getAvailableDayRanges(selectedDate, bookings, blockedRanges);

    if (!ranges.includes(selectedDayRange)) {
      setErrorMessage("This slot is no longer available.");
      setIsModalOpen(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const selectedBooker = String(formData.get("bookerName") ?? "");
    const otherName = String(formData.get("otherName") ?? "").trim();
    const bookerName = selectedBooker === "Other" ? otherName : selectedBooker;
    const sharingOk = String(formData.get("sharingOk") ?? "false") === "true";

    if (!bookerName) {
      setErrorMessage("Please enter the booker name.");
      return;
    }

    const booking = {
      booker_name: bookerName,
      booking_date: selectedDate,
      day_range: selectedDayRange,
      sharing_ok: sharingOk,
      status: "approved" as const,
    };

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("bookings")
      .insert(booking)
      .select()
      .single();
    setIsSubmitting(false);

    if (error) {
      console.error("Booking insert failed:", error);
      setErrorMessage("Could not submit the booking.");
      return;
    }

    setBookings((currentBookings) => [data, ...currentBookings]);
    setSuccessMessage("Booking confirmed.");
    setIsModalOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f3ea] px-4 py-6 text-[#1f2a21] sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          dir="ltr"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#18351f] shadow-lg shadow-[#49643a]/20 ring-4 ring-white sm:h-20 sm:w-20">
              <div className="relative h-11 w-11 sm:h-14 sm:w-14">
                <span className="absolute left-1/2 top-2 h-8 w-8 -translate-x-1/2 rounded-full bg-[#d7b46a] sm:h-10 sm:w-10" />
                <span className="absolute left-3 top-5 h-5 w-5 rounded-full bg-[#6f8f4f] sm:left-4 sm:top-6 sm:h-6 sm:w-6" />
                <span className="absolute right-3 top-5 h-5 w-5 rounded-full bg-[#8fb36a] sm:right-4 sm:top-6 sm:h-6 sm:w-6" />
                <span className="absolute bottom-1 left-1/2 h-7 w-2 -translate-x-1/2 rounded-full bg-[#8a5b2d] sm:h-8" />
                <span className="absolute bottom-1 left-1/2 h-5 w-7 -translate-x-1/2 rounded-full border-b-4 border-[#cfe0c5]" />
              </div>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#8a5b2d]">
                Private Booking
              </p>
              <h1 className="mt-1 text-4xl font-black leading-none text-[#18351f] sm:text-6xl">
                Oak Tree Farm
              </h1>
              <p className="ml-44 mt-1 text-[10px] italic text-[#5d6f55] sm:ml-96 sm:text-xs">
                Raba Family Farm
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="rounded-md bg-[#2f5d42] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#274c37]"
          >
            Admin
          </a>
        </header>

        {successMessage && (
          <p className="mb-4 rounded-md border border-[#b8d6aa] bg-[#eef8e9] px-4 py-3 text-sm font-bold text-[#2f5d42]">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mb-4 rounded-md border border-[#efb4b4] bg-[#fff0f0] px-4 py-3 text-sm font-bold text-[#8f2424]">
            {errorMessage}
          </p>
        )}

        <section className="w-full overflow-hidden rounded-lg bg-white p-3 shadow-xl shadow-[#49643a]/10 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => moveCalendarMonth(-1)}
              className="rounded-md border border-[#d4decd] px-4 py-2 text-sm font-bold text-[#2f5d42] transition hover:bg-[#f5fbf0]"
            >
              Previous month
            </button>
            <h2 className="text-center text-2xl font-black text-[#18351f]">
              {calendar.label}
            </h2>
            <button
              type="button"
              onClick={() => moveCalendarMonth(1)}
              className="rounded-md border border-[#d4decd] px-4 py-2 text-sm font-bold text-[#2f5d42] transition hover:bg-[#f5fbf0]"
            >
              Next month
            </button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-bold sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                "available",
                "partially_booked",
                "pending",
                "fully_booked",
                "blocked",
                "sharing_ok",
              ] as DateStatus[]
            ).map((status) => (
              <span
                key={status}
                className={`rounded-md border px-3 py-2 text-center ${statusStyles[status]}`}
              >
                {statusText[status]}
              </span>
            ))}
          </div>

          {isLoading ? (
            <p className="rounded-md bg-[#fbfaf4] p-5 text-center font-bold text-[#4c5d4d]">
              Loading calendar...
            </p>
          ) : (
            <div className="grid w-full grid-cols-[repeat(7,minmax(0,1fr))] gap-1 text-center sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span
                  key={day}
                  className="min-w-0 truncate text-[10px] font-black text-[#6f4f2d] sm:text-sm"
                >
                  {day}
                </span>
              ))}

              {Array.from({ length: calendar.leadingEmptyDays }).map((_, index) => (
                <span key={`empty-${index}`} />
              ))}

              {calendar.days.map((day) => {
                const status = getDateStatus(
                  day.dateKey,
                  bookings,
                  blockedRanges,
                );
                const activeBookings = getActiveBookings(day.dateKey, bookings);
                const blockedRange = blockedRanges.find(
                  (range) =>
                    day.dateKey >= range.start_date &&
                    day.dateKey <= range.end_date,
                );
                const sharingOk = hasSharingOk(day.dateKey, bookings);
                const isSelected = selectedDate === day.dateKey;
                const isToday = todayKey === day.dateKey;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => openBookingModal(day.dateKey)}
                    className={`group relative min-h-12 min-w-0 rounded-md border p-1 text-center font-black transition hover:-translate-y-0.5 hover:shadow-md sm:min-h-28 sm:p-2 sm:text-left ${statusStyles[status]} ${
                      isSelected ? "ring-4 ring-[#2f5d42]/20" : ""
                    } ${isToday ? "outline outline-2 outline-offset-2 outline-[#2f5d42]" : ""}`}
                  >
                    <span className="block text-sm sm:text-2xl">{day.dayNumber}</span>
                    <span
                      className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full sm:hidden ${statusDotStyles[status]}`}
                    />
                    <span className="mt-1 hidden text-[10px] leading-4 sm:block sm:text-xs">
                      {statusText[status]}
                    </span>
                    {sharingOk && (
                      <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#1d75b9] sm:mx-0 sm:mt-2 sm:inline-flex sm:h-auto sm:w-auto sm:px-2 sm:py-1 sm:text-[10px] sm:font-black sm:text-white">
                        <span className="hidden sm:inline">Sharing OK</span>
                      </span>
                    )}

                    {activeBookings.length > 0 && (
                      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-56 rounded-md bg-[#1f2a21] p-3 text-left text-xs font-bold text-white shadow-xl group-hover:block">
                        {activeBookings.map((booking) => (
                          <span key={booking.id} className="mb-2 block last:mb-0">
                            <span className="block">
                              Booked by: {booking.booker_name}
                            </span>
                            <span className="block">Status: {booking.status}</span>
                            <span className="block">
                              Slot: {dayRangeLabels[booking.day_range]}
                            </span>
                            <span className="block">
                              Sharing: {booking.sharing_ok ? "Yes" : "No"}
                            </span>
                          </span>
                        ))}
                      </span>
                    )}

                    {blockedRange && (
                      <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-56 rounded-md bg-[#1f2a21] p-3 text-left text-xs font-bold text-white shadow-xl group-hover:block">
                        <span className="block">Blocked</span>
                        {blockedRange.reason && (
                          <span className="block">
                            Reason: {blockedRange.reason}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45 p-4 sm:items-center sm:justify-center">
          <form
            onSubmit={handleBookingSubmit}
            className="w-full rounded-lg bg-white p-5 shadow-2xl sm:max-w-lg sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#8a5b2d]">Booking request</p>
                <h2 className="mt-1 text-2xl font-black text-[#18351f]">
                  {selectedDate}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBookingModal}
                className="rounded-md border border-[#d4decd] px-3 py-2 text-sm font-bold text-[#2f5d42]"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">Booker name</span>
                <select
                  name="bookerName"
                  value={selectedName}
                  onChange={(event) => setSelectedName(event.target.value)}
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                >
                  {bookerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedName === "Other" && (
                <label className="block">
                  <span className="text-sm font-bold text-[#274c37]">Other name</span>
                  <input
                    type="text"
                    name="otherName"
                    required
                    className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                    placeholder="Write the name"
                  />
                </label>
              )}

              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">Day range</span>
                <select
                  name="dayRange"
                  value={selectedDayRange}
                  onChange={(event) =>
                    setSelectedDayRange(event.target.value as DayRange)
                  }
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                >
                  {availableRanges.map((range) => (
                    <option key={range} value={range}>
                      {dayRangeLabels[range]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#274c37]">
                  OK to share
                </span>
                <select
                  name="sharingOk"
                  defaultValue="false"
                  className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-md bg-[#2f5d42] px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#274c37] disabled:cursor-not-allowed disabled:bg-[#8aa18f]"
            >
              {isSubmitting ? "Submitting..." : "Submit booking request"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
