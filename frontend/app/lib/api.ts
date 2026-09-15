const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type AttendanceRecord = {
  _id: string;
  date: string;
  day: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "Present" | "Absent" | "Late";
  late: "Yes" | "No";
  remarks: string;
  notes: string;
};

export type Profile = {
  _id?: string;
  name: string;
  studentId: string;
  role: string;
  institution: string;
  unit: string;
  division: string;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new ApiError(body?.message || "Request failed", res.status);
  }
  return body as T;
}

export { ApiError };

export const api = {
  checkIn: () => request<AttendanceRecord>("/api/checkin", { method: "POST" }),
  checkOut: () => request<AttendanceRecord>("/api/checkout", { method: "POST" }),
  markAbsent: (date?: string, note?: string) =>
    request<AttendanceRecord>("/api/absent", {
      method: "POST",
      body: JSON.stringify({ date, note }),
    }),
  getRecords: (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const qs = params.toString();
    return request<AttendanceRecord[]>(`/api/records${qs ? `?${qs}` : ""}`);
  },
  updateRecord: (id: string, data: Partial<AttendanceRecord>) =>
    request<AttendanceRecord>(`/api/records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteRecord: (id: string) =>
    request<{ message: string }>(`/api/records/${id}`, { method: "DELETE" }),
  getProfile: () => request<Profile>("/api/profile"),
  updateProfile: (data: Partial<Profile>) =>
    request<Profile>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  reportUrl: (start: string, end: string) =>
    `${API_BASE}/api/report?start=${start}&end=${end}`,
};
