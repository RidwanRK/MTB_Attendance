import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/lib/models/AttendanceRecord";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const filter: Record<string, unknown> = {};
    if (start || end) {
      const dateFilter: Record<string, string> = {};
      if (start) dateFilter.$gte = start;
      if (end) dateFilter.$lte = end;
      filter.date = dateFilter;
    }

    const records = await AttendanceRecord.find(filter).sort({ date: 1 });
    return NextResponse.json(records, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to fetch records", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
