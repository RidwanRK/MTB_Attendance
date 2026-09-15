import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/lib/models/AttendanceRecord";
import { dayjs, TZ, now, todayDate, dayName } from "@/lib/dayjsTz";

const LATE_CUTOFF_HOUR = 10; // 10:00 AM

export async function POST() {
  try {
    await connectDB();

    const date = todayDate();
    const day = dayName(date);
    const current = now();

    let record = await AttendanceRecord.findOne({ date });
    if (record && record.checkIn) {
      return NextResponse.json(
        { message: `Already checked in at ${record.checkIn}`, record },
        { status: 409 }
      );
    }

    const lateCutoff = dayjs.tz(`${date} ${LATE_CUTOFF_HOUR}:00`, "YYYY-MM-DD H:mm", TZ);
    const late = current.isAfter(lateCutoff) ? "Yes" : "No";
    const status = late === "Yes" ? "Late" : "Present";

    record = await AttendanceRecord.findOneAndUpdate(
      { date },
      { $set: { date, day, checkIn: current.format("h:mm A"), late, status } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(record, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to check in", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
