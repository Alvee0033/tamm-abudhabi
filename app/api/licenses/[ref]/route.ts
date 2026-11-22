import { NextResponse } from "next/server";
import { getLicenseByRef, upsertLicense, deleteLicense } from "@/app/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const license = await getLicenseByRef(ref);
  if (!license) {
    return NextResponse.json({ message: "License not found" }, { status: 404 });
  }
  return NextResponse.json(license);
}

export async function PUT(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  try {
    const body = await req.json();
    const updated = await upsertLicense({ ...body, tradeLicenseNumber: body.tradeLicenseNumber || ref });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Failed to update license" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const success = await deleteLicense(ref);
  if (!success) {
    return NextResponse.json({ message: "License not found or already deleted" }, { status: 404 });
  }
  return NextResponse.json({ message: "License deleted successfully" });
}
