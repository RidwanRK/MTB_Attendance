"use client";

import { useEffect, useState } from "react";
import { api, Profile } from "../lib/api";

const emptyProfile: Profile = {
  name: "",
  studentId: "",
  role: "",
  institution: "",
  unit: "",
  division: "",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .getProfile()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof Profile, label: string) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500">{label}</label>
        <input
          type="text"
          value={profile[key] || ""}
          onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-slate-500">
        These details appear in the header of your generated report.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm">
          Profile saved.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4"
      >
        {field("name", "Name")}
        {field("studentId", "Student ID")}
        {field("role", "Role")}
        {field("institution", "Institution")}
        {field("unit", "Unit")}
        {field("division", "Division")}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 text-white text-lg font-semibold py-4 disabled:bg-slate-300"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
