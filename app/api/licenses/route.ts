import { NextResponse } from "next/server";
import { getLicenses, upsertLicense } from "@/app/lib/db";

export async function GET() {
  const licenses = await getLicenses();
  return NextResponse.json(licenses);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.tradeLicenseNumber) {
      return NextResponse.json({ message: "tradeLicenseNumber is required" }, { status: 400 });
    }
    const created = await upsertLicense(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Failed to create license" }, { status: 500 });
  }
}
