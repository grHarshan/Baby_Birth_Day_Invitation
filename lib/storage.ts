import { Redis } from "@upstash/redis";
import { siteConfig } from "./config";

export type RsvpStatus = "attending" | "cancelled";

export interface RsvpEntry {
  id: string;
  token: string; // secret used by the guest to cancel their own RSVP
  householdName: string;
  guestCount: number;
  message?: string;
  status: RsvpStatus;
  createdAt: string;
  updatedAt: string;
}

const LIST_KEY = `rsvp:${siteConfig.eventSlug}:ids`;
const ENTRY_KEY = (id: string) => `rsvp:${siteConfig.eventSlug}:entry:${id}`;

// ── Redis client (used automatically when Upstash env vars are present) ──
const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// ── In-memory fallback (local dev only — resets on every server restart,
//    and does NOT work across serverless invocations on Vercel) ──
const globalAny = globalThis as unknown as { __rsvpMemStore?: Map<string, RsvpEntry> };
if (!globalAny.__rsvpMemStore) globalAny.__rsvpMemStore = new Map();
const memStore = globalAny.__rsvpMemStore;

export function isUsingPersistentStorage() {
  return hasUpstash;
}

export async function addRsvp(entry: RsvpEntry): Promise<void> {
  if (redis) {
    await redis.set(ENTRY_KEY(entry.id), entry);
    await redis.sadd(LIST_KEY, entry.id);
  } else {
    memStore.set(entry.id, entry);
  }
}

export async function updateRsvp(entry: RsvpEntry): Promise<void> {
  if (redis) {
    await redis.set(ENTRY_KEY(entry.id), entry);
  } else {
    memStore.set(entry.id, entry);
  }
}

export async function getRsvp(id: string): Promise<RsvpEntry | null> {
  if (redis) {
    const val = await redis.get<RsvpEntry>(ENTRY_KEY(id));
    return val ?? null;
  }
  return memStore.get(id) ?? null;
}

export async function listRsvps(): Promise<RsvpEntry[]> {
  if (redis) {
    const ids = await redis.smembers(LIST_KEY);
    if (!ids.length) return [];
    const entries = await Promise.all(ids.map((id) => redis.get<RsvpEntry>(ENTRY_KEY(id))));
    return entries
      .filter((e): e is RsvpEntry => !!e)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  return Array.from(memStore.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function deleteRsvp(id: string): Promise<void> {
  if (redis) {
    await redis.del(ENTRY_KEY(id));
    await redis.srem(LIST_KEY, id);
  } else {
    memStore.delete(id);
  }
}

export async function clearAllRsvps(): Promise<void> {
  if (redis) {
    const ids = await redis.smembers(LIST_KEY);
    if (ids.length) {
      await Promise.all(ids.map((id) => redis.del(ENTRY_KEY(id))));
    }
    await redis.del(LIST_KEY);
  } else {
    memStore.clear();
  }
}
