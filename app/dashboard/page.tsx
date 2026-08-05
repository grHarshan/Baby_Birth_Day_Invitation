"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";

type Entry = {
  id: string;
  householdName: string;
  guestCount: number;
  message?: string;
  status: "attending" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

const SESSION_KEY = `dash_pw_${siteConfig.eventSlug}`;
const POLL_MS = 6000;

export default function DashboardPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pwRef = useRef("");

  const fetchEntries = useCallback(async (pw: string) => {
    try {
      const res = await fetch("/api/rsvp", { headers: { "x-dashboard-password": pw } });
      if (res.status === 401) {
        setAuthed(false);
        sessionStorage.removeItem(SESSION_KEY);
        setAuthError("Session expired — enter the passcode again.");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't load RSVPs.");
      setEntries(data.entries);
      setLastUpdated(new Date());
      setFetchError(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Couldn't load RSVPs.");
    }
  }, []);

  // Delete a single RSVP entry by id
  const handleDeleteOne = useCallback(async (entry: Entry) => {
    const confirmed = confirm(
      `Delete "${entry.householdName}" (${entry.guestCount} guest${entry.guestCount > 1 ? "s" : ""})?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingId(entry.id);
    try {
      const res = await fetch(`/api/rsvp?id=${entry.id}`, {
        method: "DELETE",
        headers: { "x-dashboard-password": pwRef.current },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete entry.");
        return;
      }
      setEntries((prev) => (prev ? prev.filter((e) => e.id !== entry.id) : prev));
      setLastUpdated(new Date());
    } catch {
      alert("Network error — couldn't delete entry.");
    } finally {
      setDeletingId(null);
    }
  }, []);

  // Clear ALL entries
  const handleClearAll = useCallback(async () => {
    const confirmed = confirm(
      "⚠️ Clear ALL RSVPs?\n\nThis will permanently delete every entry and cannot be undone."
    );
    if (!confirmed) return;
    setClearing(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "DELETE",
        headers: { "x-dashboard-password": pwRef.current },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to clear RSVPs.");
        return;
      }
      setEntries([]);
      setLastUpdated(new Date());
    } catch {
      alert("Network error — couldn't clear RSVPs.");
    } finally {
      setClearing(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      pwRef.current = stored;
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchEntries(pwRef.current);
    const id = setInterval(() => fetchEntries(pwRef.current), POLL_MS);
    return () => clearInterval(id);
  }, [authed, fetchEntries]);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch("/api/dashboard-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || "Wrong passcode.");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, password);
    pwRef.current = password;
    setAuthed(true);
  }

  if (!authed) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center px-6">
        <form onSubmit={handleUnlock} className="card p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-3">🍼</div>
          <h1 className="font-display text-2xl mb-1">Parents&apos; dashboard</h1>
          <p className="text-sm text-[var(--ink-soft)] mb-6">{siteConfig.dashboardHint}</p>
          <input
            type="password"
            placeholder="Passcode"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-3 outline-none focus:border-[var(--sage)] mb-4"
          />
          {authError && <p className="text-[var(--blush-deep)] text-sm mb-4">{authError}</p>}
          <button type="submit" className="btn btn-primary w-full">
            Unlock
          </button>
        </form>
      </main>
    );
  }

  const attending = (entries ?? []).filter((e) => e.status === "attending");
  const cancelled = (entries ?? []).filter((e) => e.status === "cancelled");
  const totalGuests = attending.reduce((sum, e) => sum + e.guestCount, 0);
  const totalHouseholds = attending.length;

  return (
    <main className="min-h-[100dvh] px-6 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Guest list</h1>
          <p className="text-xs font-mono text-[var(--ink-soft)] mt-1">
            {lastUpdated ? `updated ${lastUpdated.toLocaleTimeString()}` : "loading…"}
          </p>
        </div>
        <button
          onClick={handleClearAll}
          disabled={clearing || entries === null || entries.length === 0}
          className="btn btn-outline text-sm border-[var(--blush-deep)] text-[var(--blush-deep)] hover:bg-[var(--blush-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {clearing ? "Clearing…" : "🗑 Clear all RSVPs"}
        </button>
      </div>

      {/* Live totals */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="card p-6 text-center">
          <p className="font-mono text-5xl font-semibold text-[var(--sage-deep)]">{totalGuests}</p>
          <p className="text-sm text-[var(--ink-soft)] mt-1">total guests coming</p>
        </div>
        <div className="card p-6 text-center">
          <p className="font-mono text-5xl font-semibold text-[var(--honey)]">{totalHouseholds}</p>
          <p className="text-sm text-[var(--ink-soft)] mt-1">households attending</p>
        </div>
      </div>

      {fetchError && <p className="text-[var(--blush-deep)] text-sm mb-6">{fetchError}</p>}

      {entries === null ? (
        <p className="text-[var(--ink-soft)]">Loading guest list…</p>
      ) : entries.length === 0 ? (
        <p className="text-[var(--ink-soft)]">No RSVPs yet — check back soon.</p>
      ) : (
        <div className="space-y-6">
          {/* Attending */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sage-deep)] mb-3">
              Attending ({attending.length})
            </h2>
            <div className="card divide-y divide-[var(--line)]">
              {attending.length === 0 && (
                <p className="p-4 text-sm text-[var(--ink-soft)]">Nobody yet — invitations just went out!</p>
              )}
              {attending.map((e) => (
                <div key={e.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{e.householdName}</p>
                    {e.message && (
                      <p className="text-sm text-[var(--ink-soft)] mt-0.5 truncate">&ldquo;{e.message}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm bg-[var(--sage-soft)] text-[var(--sage-deep)] rounded-full px-3 py-1">
                      {e.guestCount} guest{e.guestCount > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => handleDeleteOne(e)}
                      disabled={deletingId === e.id || clearing}
                      title={`Delete ${e.householdName}`}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--blush-soft)] hover:text-[var(--blush-deep)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {deletingId === e.id ? (
                        <span className="text-xs font-mono">…</span>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Can't make it */}
          {cancelled.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-soft)] mb-3">
                Can&apos;t make it ({cancelled.length})
              </h2>
              <div className="card divide-y divide-[var(--line)] opacity-70">
                {cancelled.map((e) => (
                  <div key={e.id} className="p-4 flex items-center justify-between gap-4">
                    <p className="font-medium">{e.householdName}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-[var(--ink-soft)]">cancelled</span>
                      <button
                        onClick={() => handleDeleteOne(e)}
                        disabled={deletingId === e.id || clearing}
                        title={`Delete ${e.householdName}`}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--blush-soft)] hover:text-[var(--blush-deep)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {deletingId === e.id ? (
                          <span className="text-xs font-mono">…</span>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
