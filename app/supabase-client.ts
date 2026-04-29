"use client";

import { createClient } from "@supabase/supabase-js";

export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";
export type DayRange = "first_half" | "second_half" | "full_day";

export type BookingRow = {
  id: string;
  booker_name: string;
  booking_date: string;
  day_range: DayRange;
  sharing_ok: boolean;
  status: BookingStatus;
  created_at: string;
};

export type BlockedDateRow = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
};

export type BookingInsert = {
  booker_name: string;
  booking_date: string;
  day_range: DayRange;
  sharing_ok: boolean;
  status: "approved";
};

type BookingUpdate = {
  booker_name?: string;
  booking_date?: string;
  day_range?: DayRange;
  sharing_ok?: boolean;
  status?: BookingStatus;
};

type BlockedDateInsert = {
  start_date: string;
  end_date: string;
  reason: string | null;
};

type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      bookings: {
        Row: BookingRow;
        Insert: BookingInsert;
        Update: BookingUpdate;
        Relationships: [];
      };
      blocked_dates: {
        Row: BlockedDateRow;
        Insert: BlockedDateInsert;
        Update: Partial<BlockedDateRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseClient ??= createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}
