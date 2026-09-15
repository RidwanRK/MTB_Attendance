const puppeteer = require('puppeteer');
const AttendanceRecord = require('../models/AttendanceRecord');
const Profile = require('../models/Profile');

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReportHtml(profile, records) {
  const rows = records
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.date)}</td>
        <td>${escapeHtml(r.day)}</td>
        <td>${escapeHtml(r.checkIn || '')}</td>
        <td>${escapeHtml(r.checkOut || '')}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.late)}</td>
        <td>${escapeHtml(r.remarks || '')}</td>
        <td>${escapeHtml(r.notes || '')}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Calibri, Arial, sans-serif;
    font-size: 12px;
    color: #000;
    margin: 24px;
  }
  .header p {
    margin: 0;
    line-height: 1.5;
  }
  .header {
    margin-bottom: 16px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #000;
    padding: 4px 8px;
    text-align: left;
    white-space: nowrap;
  }
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
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
        <th>Date</th>
        <th>Day</th>
        <th>Check In</th>
        <th>Check Out</th>
        <th>Status</th>
        <th>Late</th>
        <th>Remarks</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}

async function generateReport(req, res) {
  let browser;
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: 'start and end query params are required (YYYY-MM-DD)' });
    }

    const profile = (await Profile.findOne()) || {};
    const records = await AttendanceRecord.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    const html = buildReportHtml(profile, records);

    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBytes = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="attendance-report-${start}-to-${end}.pdf"`,
    });
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
}

module.exports = { generateReport };
