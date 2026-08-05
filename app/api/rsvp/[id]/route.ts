import { NextRequest, NextResponse } from "next/server";
import { getRsvp, updateRsvp } from "@/lib/storage";

// PATCH { token, status: "cancelled" | "attending" }
// Lets a guest cancel their own RSVP (or undo a cancellation) using the
// private token they were given when they first submitted the form.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token : "";
    const status = body?.status === "attending" ? "attending" : "cancelled";

    const entry = await getRsvp(id);
    if (!entry) {
      return NextResponse.json({ error: "RSVP not found." }, { status: 404 });
    }
    if (entry.token !== token) {
      return NextResponse.json({ error: "Invalid token." }, { status: 403 });
    }

    entry.status = status;
    entry.updatedAt = new Date().toISOString();
    await updateRsvp(entry);

    return NextResponse.json({ ok: true, entry: { ...entry, token: undefined } });
  } catch (err) {
    console.error("PATCH /api/rsvp/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.nextUrl.searchParams.get("token") ?? "";
    const entry = await getRsvp(id);
    if (!entry || entry.token !== token) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const { token: _t, ...safe } = entry;
    return NextResponse.json({ entry: safe });
  } catch (err) {
    console.error("GET /api/rsvp/[id] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error." },
      { status: 500 }
    );
  }
}
