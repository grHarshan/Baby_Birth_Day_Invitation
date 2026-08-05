"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/config";

const STORAGE_KEY = `rsvp_${siteConfig.eventSlug}`;

type SavedRsvp = {
  id: string;
  token: string;
  householdName: string;
  guestCount: number;
  status: "attending" | "cancelled";
};

export default function RsvpForm() {
  const [saved, setSaved] = useState<SavedRsvp | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [message, setMessage] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSaved(JSON.parse(raw));
      } catch {
        /* ignore corrupt local data */
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ householdName, guestCount, message, whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const record: SavedRsvp = {
        id: data.id,
        token: data.token,
        householdName,
        guestCount,
        status: "attending",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setSaved(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(status: "attending" | "cancelled") {
    if (!saved) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rsvp/${saved.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: saved.token, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't update your RSVP.");
      const updated = { ...saved, status };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSaved(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    localStorage.removeItem(STORAGE_KEY);
    setSaved(null);
    setHouseholdName("");
    setGuestCount(2);
    setMessage("");
    setWhatsapp("");
  }

  // ── Already responded: show status card instead of the form ──
  if (saved) {
    const attending = saved.status === "attending";
    return (
      <div className="card p-8 md:p-10 text-center">
        <div className="text-5xl mb-4">{attending ? "🎉" : "💌"}</div>
        <h3 className="font-display text-2xl md:text-3xl mb-2">
          {attending ? "You're on the list!" : "No worries — you're marked as not attending"}
        </h3>
        <p className="text-[var(--ink-soft)] mb-1">
          {saved.householdName} · {saved.guestCount} guest{saved.guestCount > 1 ? "s" : ""}
        </p>
        {error && <p className="text-[var(--blush-deep)] text-sm mt-3">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {attending ? (
            <button
              onClick={() => setStatus("cancelled")}
              disabled={loading}
              className="btn btn-outline"
            >
              Can&apos;t make it anymore? Cancel RSVP
            </button>
          ) : (
            <button
              onClick={() => setStatus("attending")}
              disabled={loading}
              className="btn btn-primary"
            >
              Actually, we can come! Undo cancellation
            </button>
          )}
          <button onClick={startOver} disabled={loading} className="btn btn-outline">
            This isn&apos;t me — start over
          </button>
        </div>
      </div>
    );
  }

  // ── Fresh RSVP form ──
  return (
    <form onSubmit={handleSubmit} className="card p-8 md:p-10 space-y-5">
      <div>
        <label htmlFor="householdName" className="block text-sm font-semibold mb-1.5">
          Your name (or family name)
        </label>
        <input
          id="householdName"
          type="text"
          required
          maxLength={80}
          placeholder="e.g. The Fernando Family"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--sage)]"
        />
      </div>

      <div>
        <label htmlFor="guestCount" className="block text-sm font-semibold mb-1.5">
          How many from your house are coming?
        </label>
        <input
          id="guestCount"
          type="number"
          min={1}
          max={20}
          required
          placeholder="e.g. 3"
          value={guestCount}
          onChange={(e) => setGuestCount(Number(e.target.value))}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--sage)]"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold mb-1.5">
          A note for the parents <span className="text-[var(--ink-soft)] font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={3}
          maxLength={300}
          placeholder="e.g. So excited, we'll bring the balloons!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none focus:border-[var(--sage)] resize-none"
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="block text-sm font-semibold mb-1.5">
          Your WhatsApp number{" "}
          <span className="text-[var(--ink-soft)] font-normal">(optional — for reminders)</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] text-sm select-none">+</span>
          <input
            id="whatsapp"
            type="tel"
            maxLength={16}
            placeholder="94712345678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d+\s\-()]/g, ""))}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] pl-8 pr-4 py-3 outline-none focus:border-[var(--sage)]"
          />
        </div>
        <p className="text-xs text-[var(--ink-soft)] mt-1.5">
          Include country code, no spaces (e.g. 94712345678 for Sri Lanka 🇱🇰)
        </p>
      </div>

      {error && <p className="text-[var(--blush-deep)] text-sm">{error}</p>}


      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Sending…" : "Send our RSVP"}
      </button>
      <p className="text-xs text-[var(--ink-soft)] text-center">
        Change of plans later? You&apos;ll get an easy way to update this right here.
      </p>
    </form>
  );
}
