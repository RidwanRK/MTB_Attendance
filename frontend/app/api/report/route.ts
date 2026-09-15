import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/lib/models/AttendanceRecord";
import { PROFILE } from "@/lib/profile";
import { launchBrowser } from "@/lib/browser";

export const maxDuration = 60;

type ProfileDoc = typeof PROFILE;

type RecordDoc = {
  date: string;
  day: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  late: string;
  remarks: string;
  notes: string;
};

function escapeHtml(str: unknown) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReportHtml(profile: ProfileDoc, records: RecordDoc[]) {
  const rows = records
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.date)}</td>
        <td>${escapeHtml(r.day)}</td>
        <td>${escapeHtml(r.checkIn || "")}</td>
        <td>${escapeHtml(r.checkOut || "")}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.late)}</td>
        <td>${escapeHtml(r.remarks || "")}</td>
        <td>${escapeHtml(r.notes || "")}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 12px; color: #000; margin: 24px; }
  .header p { margin: 0; line-height: 1.5; }
  .header { margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #000; padding: 4px 8px; text-align: left; white-space: nowrap; }
  th { background-color: #f2f2f2; font-weight: bold; }
</style>
</head>
<body>
  <div class="header">
    <p>Attendance Sheet of ${escapeHtml(profile.name)}</p>
    <p>${escapeHtml(profile.studentId)}, ${escapeHtml(profile.role)}, ${escapeHtml(profile.institution)}</p>
    <p>${escapeHtml(profile.unit)}, ${escapeHtml(profile.division)}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th><th>Day</th><th>Check In</th><th>Check Out</th>
        <th>Status</th><th>Late</th><th>Remarks</th><th>Notes</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  let browser;
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { message: "start and end query params are required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const records = await AttendanceRecord.find({ date: { $gte: start, $lte: end } }).sort({
      date: 1,
    });

    const html = buildReportHtml(PROFILE, records as unknown as RecordDoc[]);

    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdfBytes = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    await browser.close();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="attendance-report-${start}-to-${end}.pdf"`,
      },
    });
  } catch (err) {
    if (browser) await browser.close();
    return NextResponse.json(
      { message: "Failed to generate report", error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
