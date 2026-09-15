import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/lib/models/AttendanceRecord";
import { now, todayDate } from "@/lib/dayjsTz";

export async function POST() {
  try {
    await connectDB();

    const date = todayDate();
    const record = await AttendanceRecord.findOne({ date });

    if (!record || !record.checkIn) {
      return NextResponse.json(
        { message: "You must check in before checking out" },
        { status: 400 }
      );
    }
    if (record.checkOut) {
      return NextResponse.json(
        { message: `Already checked out at ${record.checkOut}`, record },
        { status: 409 }
      );
    }

    record.checkOut = now().format("h:mm A");
    await record.save();

    return NextResponse.json(record, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to check out", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
