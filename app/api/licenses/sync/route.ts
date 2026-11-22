import { NextResponse } from "next/server";
import { syncLicensesFromClient, getLicenses } from "@/app/lib/db";

export async function GET() {
  const licenses = await getLicenses();
  return NextResponse.json(licenses);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const incoming = Array.isArray(body) ? body : body.licenses;
    if (Array.isArray(incoming)) {
      const merged = await syncLicensesFromClient(incoming);
      return NextResponse.json(merged);
    }
    return NextResponse.json(await getLicenses());
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Failed to sync licenses" }, { status: 500 });
  }
}
