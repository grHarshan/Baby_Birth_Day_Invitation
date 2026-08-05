import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addRsvp, listRsvps, deleteRsvp, clearAllRsvps, RsvpEntry } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const householdName = typeof body?.householdName === "string" ? body.householdName.trim() : "";
    const guestCount = Number(body?.guestCount);
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 300) : "";
    const whatsapp = typeof body?.whatsapp === "string"
      ? body.whatsapp.replace(/\D/g, "").slice(0, 15)
      : undefined;

    if (!householdName || householdName.length > 80) {
      return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      return NextResponse.json({ error: "Guest count must be between 1 and 20." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const entry: RsvpEntry = {
      id: randomUUID(),
      token: randomUUID(),
      householdName,
      guestCount,
      message: message || undefined,
      whatsapp: whatsapp || undefined,
      status: "attending",
      createdAt: now,
      updatedAt: now,
    };

    await addRsvp(entry);
    return NextResponse.json({ id: entry.id, token: entry.token });
  } catch (err) {
    console.error("POST /api/rsvp error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error. Please try again." },
      { status: 500 }
    );
  }
}

// Guarded list endpoint for the parents' dashboard.
export async function GET(req: NextRequest) {
  try {
    const password = req.headers.get("x-dashboard-password") ?? "";
    const expected = process.env.DASHBOARD_PASSWORD ?? "";

    if (!expected || password !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await listRsvps();
    const safe = entries.map(({ token: _token, ...rest }) => rest);
    return NextResponse.json({ entries: safe });
  } catch (err) {
    console.error("GET /api/rsvp error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}

// Guarded delete endpoint.
// DELETE /api/rsvp?id=<id>  → delete a single entry
// DELETE /api/rsvp           → clear ALL entries
export async function DELETE(req: NextRequest) {
  try {
    const password = req.headers.get("x-dashboard-password") ?? "";
    const expected = process.env.DASHBOARD_PASSWORD ?? "";

    if (!expected || password !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      await deleteRsvp(id);
      return NextResponse.json({ ok: true, deleted: id });
    }

    await clearAllRsvps();
    return NextResponse.json({ ok: true, deleted: "all" });
  } catch (err) {
    console.error("DELETE /api/rsvp error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
