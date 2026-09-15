import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Profile from "@/lib/models/Profile";

const ALLOWED_FIELDS = ["name", "studentId", "role", "institution", "unit", "division"];

export async function GET() {
  try {
    await connectDB();
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch profile", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));

    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(update);
    } else {
      Object.assign(profile, update);
      await profile.save();
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update profile", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
