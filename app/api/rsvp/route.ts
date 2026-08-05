import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addRsvp, listRsvps, deleteRsvp, clearAllRsvps, RsvpEntry } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const householdName = typeof body?.householdName === "string" ? body.householdName.trim() : "";
  const guestCount = Number(body?.guestCount);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 300) : "";

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
    status: "attending",
    createdAt: now,
    updatedAt: now,
  };

  await addRsvp(entry);

  return NextResponse.json({ id: entry.id, token: entry.token });
}

// Guarded list endpoint for the parents' dashboard.
// Requires header "x-dashboard-password" matching DASHBOARD_PASSWORD.
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-dashboard-password") ?? "";
  const expected = process.env.DASHBOARD_PASSWORD ?? "";

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await listRsvps();
  const safe = entries.map(({ token: _token, ...rest }) => rest);
  return NextResponse.json({ entries: safe });
}

// Guarded delete endpoint.
// DELETE /api/rsvp?id=<id>  → delete a single entry
// DELETE /api/rsvp           → clear ALL entries
export async function DELETE(req: NextRequest) {
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
}
