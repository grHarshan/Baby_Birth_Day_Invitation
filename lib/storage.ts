import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "./config";

export type RsvpStatus = "attending" | "cancelled";

export interface RsvpEntry {
  id: string;
  token: string; // secret used by the guest to cancel their own RSVP
  householdName: string;
  guestCount: number;
  message?: string;
  whatsapp?: string; // guest WhatsApp number (digits only, with country code)
  status: RsvpStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Supabase client (server-side, uses service role key to bypass RLS) ────────
function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Go to your Supabase project → Settings → API and copy both values " +
        "into Vercel Environment Variables and your local .env.local file."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

// ── Table name — one table per event ─────────────────────────────────────────
const TABLE = "rsvp_entries";
const EVENT_SLUG = siteConfig.eventSlug;

// ── Row → RsvpEntry mapper ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToEntry(row: any): RsvpEntry {
  return {
    id: row.id,
    token: row.token,
    householdName: row.household_name,
    guestCount: Number(row.guest_count),
    message: row.message ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    status: row.status as RsvpStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function isUsingPersistentStorage() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// ── CRUD operations ───────────────────────────────────────────────────────────

export async function addRsvp(entry: RsvpEntry): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from(TABLE).insert({
    id: entry.id,
    token: entry.token,
    event_slug: EVENT_SLUG,
    household_name: entry.householdName,
    guest_count: entry.guestCount,
    message: entry.message ?? null,
    whatsapp: entry.whatsapp ?? null,
    status: entry.status,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
  });
  if (error) throw new Error(`Supabase addRsvp error: ${error.message}`);
}

export async function updateRsvp(entry: RsvpEntry): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from(TABLE)
    .update({
      household_name: entry.householdName,
      guest_count: entry.guestCount,
      message: entry.message ?? null,
      whatsapp: entry.whatsapp ?? null,
      status: entry.status,
      updated_at: entry.updatedAt,
    })
    .eq("id", entry.id);
  if (error) throw new Error(`Supabase updateRsvp error: ${error.message}`);
}

export async function getRsvp(id: string): Promise<RsvpEntry | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("event_slug", EVENT_SLUG)
    .single();
  if (error) return null;
  return data ? rowToEntry(data) : null;
}

export async function listRsvps(): Promise<RsvpEntry[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("event_slug", EVENT_SLUG)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Supabase listRsvps error: ${error.message}`);
  return (data ?? []).map(rowToEntry);
}

export async function deleteRsvp(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("event_slug", EVENT_SLUG);
  if (error) throw new Error(`Supabase deleteRsvp error: ${error.message}`);
}

export async function clearAllRsvps(): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("event_slug", EVENT_SLUG);
  if (error) throw new Error(`Supabase clearAllRsvps error: ${error.message}`);
}
