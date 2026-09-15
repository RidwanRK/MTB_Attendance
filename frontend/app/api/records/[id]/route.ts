import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/lib/models/AttendanceRecord";
import { dayName } from "@/lib/dayjsTz";

const ALLOWED_FIELDS = ["remarks", "notes", "status", "late", "checkIn", "checkOut", "date"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const update: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (typeof update.date === "string") {
      update.day = dayName(update.date);
    }

    const record = await AttendanceRecord.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!record) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json(record, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update record", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const record = await AttendanceRecord.findByIdAndDelete(id);
    if (!record) {
      return NextResponse.json({ message: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Record deleted", record }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to delete record", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
