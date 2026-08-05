"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config";

type Entry = {
  id: string;
  householdName: string;
  guestCount: number;
  message?: string;
  whatsapp?: string;
  status: "attending" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

function waReminderUrl(entry: Entry) {
  const number = entry.whatsapp;
  if (!number) return null;
  const date = new Date("2026-08-29T18:00:00+05:30").toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const text = `Hi ${entry.householdName}! 🎂 Just a friendly reminder about Sihagi Ayenya's 1st birthday party — ${date} at 6:00 PM, Crown Regency, Badulla. We'd love to see you there! 🎈`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

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

  // Export to CSV File
  const handleExportCSV = useCallback(() => {
    if (!entries || entries.length === 0) return;

    const headers = ["Household / Guest Name", "Status", "Guest Count", "WhatsApp", "Message", "RSVP Date"];
    const rows = entries.map((e) => [
      `"${e.householdName.replace(/"/g, '""')}"`,
      `"${e.status.toUpperCase()}"`,
      e.status === "attending" ? e.guestCount : 0,
      `"${e.whatsapp || ""}"`,
      `"${(e.message || "").replace(/"/g, '""')}"`,
      `"${new Date(e.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sihagi_Birthday_RSVP_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [entries]);

  // Export & Download PDF Report
  const handleDownloadPDF = useCallback(() => {
    if (!entries || entries.length === 0) return;

    const attendingList = entries.filter((e) => e.status === "attending");
    const cancelledList = entries.filter((e) => e.status === "cancelled");
    const totalCount = attendingList.reduce((sum, e) => sum + e.guestCount, 0);

    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow popups to generate the PDF report.");
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sihagi Ayenya 1st Birthday - Guest List</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1f2937; }
            h1 { font-size: 24px; margin-bottom: 4px; color: #111827; }
            .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
            .stats { display: flex; gap: 16px; margin-bottom: 24px; }
            .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 20px; text-align: center; flex: 1; }
            .stat-num { font-size: 28px; font-weight: 700; color: #059669; }
            .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            h2 { font-size: 16px; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
            th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: 600; color: #374151; }
            .msg { font-style: italic; color: #4b5563; font-size: 12px; }
            .badge { background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1>👶 Sihagi Ayenya's 1st Birthday — Guest List</h1>
              <p class="subtitle">Event Date: August 29, 2026 | Crown Regency, Badulla | Generated: ${new Date().toLocaleString()}</p>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🖨️ Print / Save as PDF</button>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-num">${totalCount}</div>
              <div class="stat-label">Total Guests Coming</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="color: #d97706;">${attendingList.length}</div>
              <div class="stat-label">Attending Households</div>
            </div>
            <div class="stat-card">
              <div class="stat-num" style="color: #dc2626;">${cancelledList.length}</div>
              <div class="stat-label">Declined</div>
            </div>
          </div>

          <h2>✅ Attending (${attendingList.length} Households)</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 30%;">Household / Guest</th>
                <th style="width: 15%;">Guests</th>
                <th style="width: 20%;">WhatsApp</th>
                <th style="width: 30%;">Message</th>
              </tr>
            </thead>
            <tbody>
              ${attendingList.length === 0
        ? '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">No RSVPs yet</td></tr>'
        : attendingList
          .map(
            (e, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${e.householdName}</strong></td>
                  <td><span class="badge">${e.guestCount} Guest${e.guestCount > 1 ? "s" : ""}</span></td>
                  <td>${e.whatsapp || "—"}</td>
                  <td class="msg">${e.message ? `"${e.message}"` : "—"}</td>
                </tr>
              `
          )
          .join("")
      }
            </tbody>
          </table>

          ${cancelledList.length > 0
        ? `
            <h2>❌ Declined (${cancelledList.length})</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 45%;">Household / Guest</th>
                  <th style="width: 50%;">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                ${cancelledList
          .map(
            (e, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${e.householdName}</td>
                    <td>${e.whatsapp || "—"}</td>
                  </tr>
                `
          )
          .join("")}
              </tbody>
            </table>
          `
        : ""
      }

          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  }, [entries]);

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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            disabled={entries === null || entries.length === 0}
            className="btn btn-outline text-xs px-3 py-2 border-[var(--sage-deep)] text-[var(--sage-deep)] hover:bg-[var(--sage-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📄 PDF Report
          </button>
          <button
            onClick={handleExportCSV}
            disabled={entries === null || entries.length === 0}
            className="btn btn-outline text-xs px-3 py-2 border-[var(--honey)] text-[var(--honey)] hover:bg-[rgba(226,161,63,0.1)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📊 Excel (CSV)
          </button>
          <button
            onClick={handleClearAll}
            disabled={clearing || entries === null || entries.length === 0}
            className="btn btn-outline text-xs px-3 py-2 border-[var(--blush-deep)] text-[var(--blush-deep)] hover:bg-[var(--blush-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {clearing ? "Clearing…" : "🗑 Clear All"}
          </button>
        </div>
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
                    {/* WhatsApp reminder */}
                    {waReminderUrl(e) && (
                      <a
                        href={waReminderUrl(e)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Send reminder to ${e.householdName} on WhatsApp`}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[#25D366] hover:bg-[#25D36618] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.119 1.526 5.848L0 24l6.337-1.494A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.727.878.936-3.632-.235-.374A9.818 9.818 0 1112 21.818z" />
                        </svg>
                      </a>
                    )}
                    {/* Delete */}
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
                      {/* WhatsApp reminder */}
                      {waReminderUrl(e) && (
                        <a
                          href={waReminderUrl(e)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Send reminder to ${e.householdName} on WhatsApp`}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-[#25D366] hover:bg-[#25D36618] transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.119 1.526 5.848L0 24l6.337-1.494A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.727.878.936-3.632-.235-.374A9.818 9.818 0 1112 21.818z" />
                          </svg>
                        </a>
                      )}
                      {/* Delete */}
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