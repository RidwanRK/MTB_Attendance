import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/lib/models/AttendanceRecord";
import { todayDate, dayName } from "@/lib/dayjsTz";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const date = body.date || todayDate();
    const note = body.note || "";
    const day = dayName(date);

    const record = await AttendanceRecord.findOneAndUpdate(
      { date },
      {
        $set: {
          date,
          day,
          status: "Absent",
          late: "No",
          checkIn: null,
          checkOut: null,
          notes: note,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(record, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to mark absent", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
