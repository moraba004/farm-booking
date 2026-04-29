"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { dayRangeLabels } from "../calendar-utils";
import {
  BlockedDateRow,
  BookingRow,
  BookingStatus,
  getSupabaseClient,
} from "../supabase-client";

const statusLabels: Record<BookingStatus, string> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
};

const statusClasses: Record<BookingStatus, string> = {
  pending: "bg-[#fff4d8] text-[#775018]",
  approved: "bg-[#e7f6df] text-[#2f5d42]",
  rejected: "bg-[#fde7e7] text-[#8f2424]",
  cancelled: "bg-[#ececec] text-[#505050]",
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<BlockedDateRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlockingRange, setIsBlockingRange] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    async function loadAdminData() {
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
        supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("blocked_dates")
          .select("*")
          .order("start_date", { ascending: true }),
      ]);

      if (bookingsError || blockedError) {
        console.error("Admin fetch failed:", bookingsError ?? blockedError);
        setErrorMessage("Could not load admin data.");
      } else {
        setBookings(bookingData ?? []);
        setBlockedRanges(blockedData ?? []);
      }

      setIsLoading(false);
    }

    loadAdminData();
  }, []);

  async function updateStatus(id: string, status: BookingStatus) {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setErrorMessage("Please configure Supabase in .env.local.");
      return;
    }

    setUpdatingId(id);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    setUpdatingId("");

    if (error) {
      console.error("Booking status update failed:", error);
      setErrorMessage("Could not update booking status.");
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.map((booking) => (booking.id === id ? data : booking)),
    );
  }

  async function addBlockedRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = getSupabaseClient();

    if (!supabase) {
      setErrorMessage("Please configure Supabase in .env.local.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const startDate = String(formData.get("startDate") ?? "");
    const endDate = String(formData.get("endDate") ?? "");
    const reason = String(formData.get("reason") ?? "") || null;

    if (startDate > endDate) {
      setErrorMessage("Start date must be before end date.");
      return;
    }

    setIsBlockingRange(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("blocked_dates")
      .insert({ start_date: startDate, end_date: endDate, reason })
      .select()
      .single();

    setIsBlockingRange(false);

    if (error) {
      console.error("Block range failed:", error);
      setErrorMessage("Could not add blocked range.");
      return;
    }

    setBlockedRanges((currentRanges) =>
      [...currentRanges, data].sort((firstRange, secondRange) =>
        firstRange.start_date.localeCompare(secondRange.start_date),
      ),
    );
    setSuccessMessage("Blocked range added.");
    form.reset();
  }

  async function removeBlockedRange(id: string) {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setErrorMessage("Please configure Supabase in .env.local.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);

    if (error) {
      console.error("Remove blocked range failed:", error);
      setErrorMessage("Could not remove blocked range.");
      return;
    }

    setBlockedRanges((currentRanges) =>
      currentRanges.filter((range) => range.id !== id),
    );
    setSuccessMessage("Blocked range removed.");
  }

  return (
    <main className="min-h-screen bg-[#f6f3ea] px-4 py-8 text-[#1f2a21] sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#8a5b2d]">Admin</p>
            <h1 className="mt-2 text-3xl font-black text-[#18351f] sm:text-4xl">
              Booking Management
            </h1>
          </div>
          <Link
            href="/"
            className="w-full rounded-md bg-[#2f5d42] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#274c37] sm:w-auto"
          >
            Back to calendar
          </Link>
        </header>

        {errorMessage && (
          <p className="mb-4 rounded-md border border-[#efb4b4] bg-[#fff0f0] px-4 py-3 text-sm font-bold text-[#8f2424]">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mb-4 rounded-md border border-[#b8d6aa] bg-[#eef8e9] px-4 py-3 text-sm font-bold text-[#2f5d42]">
            {successMessage}
          </p>
        )}

        <section className="mb-8 rounded-lg bg-white p-5 shadow-xl shadow-[#49643a]/10">
          <h2 className="text-2xl font-black text-[#18351f]">
            Block date range
          </h2>
          <form onSubmit={addBlockedRange} className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="block">
              <span className="text-sm font-bold text-[#274c37]">Start date</span>
              <input
                type="date"
                name="startDate"
                required
                className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#274c37]">End date</span>
              <input
                type="date"
                name="endDate"
                required
                className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#274c37]">Reason</span>
              <input
                type="text"
                name="reason"
                className="mt-2 w-full rounded-md border border-[#d4decd] bg-[#fbfaf4] px-4 py-3 text-base outline-none transition focus:border-[#2f5d42] focus:ring-4 focus:ring-[#2f5d42]/10"
                placeholder="Optional"
              />
            </label>
            <button
              type="submit"
              disabled={isBlockingRange}
              className="self-end rounded-md bg-[#2f5d42] px-5 py-3 text-sm font-black text-white transition hover:bg-[#274c37] disabled:cursor-not-allowed disabled:bg-[#8aa18f]"
            >
              {isBlockingRange ? "Blocking..." : "Block range"}
            </button>
          </form>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {blockedRanges.length === 0 ? (
              <p className="rounded-md bg-[#fbfaf4] p-4 text-sm font-bold text-[#4c5d4d]">
                No blocked ranges.
              </p>
            ) : (
              blockedRanges.map((range) => (
                <div
                  key={range.id}
                  className="rounded-md border border-[#d6d6d6] bg-[#f5f5f5] p-4"
                >
                  <p className="font-black text-[#1f2a21]">
                    {range.start_date} to {range.end_date}
                  </p>
                  <p className="mt-1 text-sm text-[#505050]">
                    {range.reason || "No reason"}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeBlockedRange(range.id)}
                    className="mt-3 rounded-md bg-[#6b6b6b] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#555]"
                  >
                    Remove range
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg bg-white shadow-xl shadow-[#49643a]/10">
          {isLoading ? (
            <p className="p-6 text-center text-lg font-bold text-[#4c5d4d]">
              Loading bookings...
            </p>
          ) : bookings.length === 0 ? (
            <p className="p-6 text-center text-lg font-bold text-[#4c5d4d]">
              No bookings yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left" dir="ltr">
                <thead className="bg-[#dbe8cd] text-sm uppercase text-[#18351f]">
                  <tr>
                    <th className="px-4 py-4 font-black">Booker</th>
                    <th className="px-4 py-4 font-black">Date</th>
                    <th className="px-4 py-4 font-black">Day range</th>
                    <th className="px-4 py-4 font-black">Sharing</th>
                    <th className="px-4 py-4 font-black">Status</th>
                    <th className="px-4 py-4 font-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t border-[#e5eadf] align-top text-sm text-[#2b352d]"
                    >
                      <td className="px-4 py-4 font-bold">{booking.booker_name}</td>
                      <td className="px-4 py-4">{booking.booking_date}</td>
                      <td className="px-4 py-4">{dayRangeLabels[booking.day_range]}</td>
                      <td className="px-4 py-4">{booking.sharing_ok ? "Yes" : "No"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-md px-3 py-1 text-xs font-black ${statusClasses[booking.status]}`}
                        >
                          {statusLabels[booking.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "approved")}
                            className="rounded-md bg-[#2f5d42] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#274c37] disabled:cursor-not-allowed disabled:bg-[#8aa18f]"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "rejected")}
                            className="rounded-md bg-[#9b2f2f] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#7d2626] disabled:cursor-not-allowed disabled:bg-[#b88989]"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="rounded-md bg-[#6b6b6b] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#555] disabled:cursor-not-allowed disabled:bg-[#aaa]"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
