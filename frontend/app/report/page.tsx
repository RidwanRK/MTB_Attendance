"use client";

import { useState } from "react";
import { api } from "../lib/api";
import { getDhakaToday } from "../lib/date";

function firstOfMonth(dateStr: string) {
  return `${dateStr.slice(0, 7)}-01`;
}

export default function ReportPage() {
  const today = getDhakaToday();
  const [start, setStart] = useState(firstOfMonth(today));
  const [end, setEnd] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(api.reportUrl(start, end));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to generate report");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-report-${start}-to-${end}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Report</h1>
      <p className="text-sm text-slate-500">
        Generate a PDF attendance sheet for any date range.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleGenerate}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Start date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">End date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 text-white text-lg font-semibold py-4 disabled:bg-slate-300"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </form>
    </div>
  );
}
