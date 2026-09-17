"use client";

import { useEffect, useState } from "react";
import { api, AttendanceRecord } from "../lib/api";
import { getDhakaToday } from "../lib/date";

function firstOfMonth(dateStr: string) {
  return `${dateStr.slice(0, 7)}-01`;
}

export default function HistoryPage() {
  const today = getDhakaToday();
  const [start, setStart] = useState(firstOfMonth(today));
  const [end, setEnd] = useState(today);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getRecords(start, end);
      setRecords([...data].sort((a, b) => (a.date < b.date ? 1 : -1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">History</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Start</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">End</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 text-white px-4 py-1.5 text-sm font-medium"
        >
          Filter
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-500">
              <th className="px-3 py-2 whitespace-nowrap">Date</th>
              <th className="px-3 py-2 whitespace-nowrap">Day</th>
              <th className="px-3 py-2 whitespace-nowrap">Check In</th>
              <th className="px-3 py-2 whitespace-nowrap">Check Out</th>
              <th className="px-3 py-2 whitespace-nowrap">Status</th>
              <th className="px-3 py-2 whitespace-nowrap">Late</th>
              <th className="px-3 py-2 whitespace-nowrap">Remarks</th>
              <th className="px-3 py-2 whitespace-nowrap">Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-slate-400">
                  No records in this range.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.day}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.checkIn || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.checkOut || "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.status}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.late}</td>
                  <td className="px-3 py-2 min-w-32">{r.remarks || ""}</td>
                  <td className="px-3 py-2 min-w-32">{r.notes || ""}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
