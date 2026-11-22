import { NextResponse } from "next/server";
import { getAdminUser, updateAdminUser } from "@/app/lib/db";

export async function GET() {
  const admin = await getAdminUser();
  return NextResponse.json({
    username: admin.username,
    email: admin.email,
    name: admin.name,
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateAdminUser({
      name: body.name,
      username: body.username,
      email: body.email,
    });
    return NextResponse.json({
      username: updated.username,
      email: updated.email,
      name: updated.name,
      access_token: "tamm_session_token_" + Buffer.from(updated.username).toString("base64") + "_" + Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Failed to update profile" }, { status: 500 });
  }
}
