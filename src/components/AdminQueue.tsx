"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SubmissionRow {
  id: string;
  name: string;
  projectType: string;
  fuelType: string;
  state: string | null;
  county: string | null;
  capacityValue: number | null;
  capacityUnit: string | null;
  causeSlugs: string;
  causeDetail: string;
  sourceUrls: string;
  submitterName: string | null;
  submitterEmail: string | null;
  status: string;
  createdAt: string;
}

export function AdminQueue({ initialSubmissions }: { initialSubmissions: SubmissionRow[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  async function review(id: string, action: "approve" | "reject") {
    setBusyId(id);
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setBusyId(null);
    if (res.ok) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert("Failed to update submission.");
    }
  }

  async function signOut() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moderation queue</h1>
        <button onClick={signOut} className="text-sm underline">
          Sign out
        </button>
      </div>
      <p className="text-sm text-[var(--muted)]">
        {submissions.length} pending submission{submissions.length === 1 ? "" : "s"}. Approving
        publishes the project immediately to the public map and list.
      </p>

      <div className="flex flex-col gap-4">
        {submissions.map((s) => (
          <div key={s.id} className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-semibold">{s.name}</h2>
                <p className="text-xs text-[var(--muted)]">
                  {s.projectType} · {s.fuelType} · {[s.county, s.state].filter(Boolean).join(", ") || "no location"}
                  {s.capacityValue != null && ` · ${s.capacityValue} ${s.capacityUnit ?? ""}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => review(s.id, "approve")}
                  disabled={busyId === s.id}
                  className="text-xs px-3 py-1.5 rounded-md bg-emerald-600 text-white disabled:opacity-50"
                >
                  Approve &amp; publish
                </button>
                <button
                  onClick={() => review(s.id, "reject")}
                  disabled={busyId === s.id}
                  className="text-xs px-3 py-1.5 rounded-md bg-red-600 text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
            <p className="text-sm mt-3">
              <strong>Cause(s):</strong> {s.causeSlugs.replace(/,/g, ", ").replace(/_/g, " ")}
            </p>
            <p className="text-sm mt-1">{s.causeDetail}</p>
            <div className="text-xs mt-2">
              <strong>Sources:</strong>
              <ul className="list-disc list-inside">
                {s.sourceUrls.split("\n").filter(Boolean).map((url) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer" className="underline break-all">
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {(s.submitterName || s.submitterEmail) && (
              <p className="text-xs text-[var(--muted)] mt-2">
                Submitted by: {s.submitterName ?? "anonymous"} {s.submitterEmail ? `(${s.submitterEmail})` : ""}
              </p>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Nothing waiting for review.</p>
        )}
      </div>
    </div>
  );
}
