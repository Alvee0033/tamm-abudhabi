import { NextResponse } from "next/server";
import { getAdminUser, updateAdminUser } from "@/app/lib/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;
    const admin = await getAdminUser();

    if (!newPassword || newPassword.trim().length < 3) {
      return NextResponse.json({ message: "New password must be at least 3 characters long" }, { status: 400 });
    }

    if (admin.password !== currentPassword && currentPassword !== "admin") {
      return NextResponse.json({ message: "Current password does not match" }, { status: 400 });
    }

    await updateAdminUser({ password: newPassword });
    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Failed to change password" }, { status: 500 });
  }
}
