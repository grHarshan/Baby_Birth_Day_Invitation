import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const expected = process.env.DASHBOARD_PASSWORD ?? "";

  if (!expected) {
    return NextResponse.json(
      { error: "DASHBOARD_PASSWORD is not set on the server yet." },
      { status: 500 }
    );
  }
  if (password !== expected) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
