"use client";

import { useEffect, useState } from "react";
import { api, AttendanceRecord } from "./lib/api";
import { getDhakaToday, getDhakaDayName } from "./lib/date";

export default function Home() {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAbsentForm, setShowAbsentForm] = useState(false);
  const [absentNote, setAbsentNote] = useState("");

  const today = getDhakaToday();
  const dayName = getDhakaDayName(today);

  async function loadToday() {
    setLoading(true);
    setError("");
    try {
      const records = await api.getRecords(today, today);
      setRecord(records[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load today's record");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckIn() {
    setActionLoading("checkin");
    setError("");
    try {
      const updated = await api.checkIn();
      setRecord(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
      await loadToday();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCheckOut() {
    setActionLoading("checkout");
    setError("");
    try {
      const updated = await api.checkOut();
      setRecord(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-out failed");
      await loadToday();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMarkAbsent(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading("absent");
    setError("");
    try {
      const updated = await api.markAbsent(today, absentNote);
      setRecord(updated);
      setShowAbsentForm(false);
      setAbsentNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark absent");
    } finally {
      setActionLoading(null);
    }
  }

  const alreadyCheckedIn = Boolean(record?.checkIn);
  const alreadyCheckedOut = Boolean(record?.checkOut);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center py-4">
        <p className="text-lg text-slate-500">{dayName}</p>
        <p className="text-3xl font-bold tracking-tight">{today}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCheckIn}
          disabled={loading || alreadyCheckedIn || actionLoading !== null}
          className="rounded-2xl bg-blue-600 text-white text-xl font-semibold py-8 shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 active:bg-blue-700"
        >
          {actionLoading === "checkin" ? "Checking in..." : "Check In"}
        </button>
        <button
          onClick={handleCheckOut}
          disabled={loading || !alreadyCheckedIn || alreadyCheckedOut || actionLoading !== null}
          className="rounded-2xl bg-emerald-600 text-white text-xl font-semibold py-8 shadow-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 active:bg-emerald-700"
        >
          {actionLoading === "checkout" ? "Checking out..." : "Check Out"}
        </button>
      </div>

      <div className="text-center text-sm text-slate-500 min-h-5">
        {alreadyCheckedIn && !alreadyCheckedOut && `Already checked in at ${record?.checkIn}`}
        {alreadyCheckedOut && `Already checked out at ${record?.checkOut}`}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowAbsentForm((v) => !v)}
          disabled={actionLoading !== null}
          className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-800"
        >
          Mark Absent
        </button>
      </div>

      {showAbsentForm && (
        <form
          onSubmit={handleMarkAbsent}
          className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3"
        >
          <label className="text-sm font-medium text-slate-700">
            Note (e.g. &quot;Sick leave&quot;)
          </label>
          <input
            type="text"
            value={absentNote}
            onChange={(e) => setAbsentNote(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Sick leave"
          />
          <button
            type="submit"
            disabled={actionLoading !== null}
            className="rounded-lg bg-slate-800 text-white py-2 text-sm font-medium disabled:bg-slate-300"
          >
            {actionLoading === "absent" ? "Saving..." : "Confirm Absent"}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
          Today&apos;s Status
        </h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : record ? (
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-medium">{record.status}</dd>
            <dt className="text-slate-500">Check In</dt>
            <dd className="font-medium">{record.checkIn || "—"}</dd>
            <dt className="text-slate-500">Check Out</dt>
            <dd className="font-medium">{record.checkOut || "—"}</dd>
            <dt className="text-slate-500">Late</dt>
            <dd className="font-medium">{record.late}</dd>
            {record.notes && (
              <>
                <dt className="text-slate-500">Notes</dt>
                <dd className="font-medium">{record.notes}</dd>
              </>
            )}
          </dl>
        ) : (
          <p className="text-sm text-slate-400">No record yet for today.</p>
        )}
      </div>
    </div>
  );
}
