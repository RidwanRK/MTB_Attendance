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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AttendanceRecord>>({});
  const [saving, setSaving] = useState(false);

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

  function startEdit(r: AttendanceRecord) {
    setEditingId(r._id);
    setDraft({
      remarks: r.remarks,
      notes: r.notes,
      status: r.status,
      late: r.late,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateRecord(id, draft);
      setRecords((prev) => prev.map((r) => (r._id === id ? updated : r)));
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    setError("");
    try {
      await api.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  }

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
              <th className="px-3 py-2 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-400">
                  No records in this range.
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isEditing = editingId === r._id;
                return (
                  <tr key={r._id} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{r.day}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          className="w-24 rounded border border-slate-300 px-1.5 py-1 text-xs"
                          value={draft.checkIn || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, checkIn: e.target.value }))}
                          placeholder="9:38 AM"
                        />
                      ) : (
                        r.checkIn || "—"
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          className="w-24 rounded border border-slate-300 px-1.5 py-1 text-xs"
                          value={draft.checkOut || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, checkOut: e.target.value }))}
                          placeholder="5:00 PM"
                        />
                      ) : (
                        r.checkOut || "—"
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          className="rounded border border-slate-300 px-1.5 py-1 text-xs"
                          value={draft.status}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              status: e.target.value as AttendanceRecord["status"],
                            }))
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                        </select>
                      ) : (
                        r.status
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <select
                          className="rounded border border-slate-300 px-1.5 py-1 text-xs"
                          value={draft.late}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              late: e.target.value as AttendanceRecord["late"],
                            }))
                          }
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      ) : (
                        r.late
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-32">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-xs"
                          value={draft.remarks || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, remarks: e.target.value }))}
                        />
                      ) : (
                        r.remarks || ""
                      )}
                    </td>
                    <td className="px-3 py-2 min-w-32">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-300 px-1.5 py-1 text-xs"
                          value={draft.notes || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                        />
                      ) : (
                        r.notes || ""
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(r._id)}
                            disabled={saving}
                            className="text-blue-600 font-medium text-xs"
                          >
                            Save
                          </button>
                          <button onClick={cancelEdit} className="text-slate-500 text-xs">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(r)}
                            className="text-blue-600 font-medium text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="text-red-500 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
