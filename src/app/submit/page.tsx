"use client";

import { useState } from "react";
import Link from "next/link";
import { CAUSE_CATEGORIES } from "@/lib/data/causeCategories";
import { FUEL_TYPES, PROJECT_TYPES, type FuelType, type ProjectType } from "@/lib/data/taxonomies";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>(PROJECT_TYPES[0].value);
  const [fuelType, setFuelType] = useState<FuelType>(FUEL_TYPES[0].value);
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");
  const [capacityValue, setCapacityValue] = useState("");
  const [capacityUnit, setCapacityUnit] = useState("MW");
  const [appliedDate, setAppliedDate] = useState("");
  const [causeSlugs, setCauseSlugs] = useState<string[]>([]);
  const [causeDetail, setCauseDetail] = useState("");
  const [sourceUrls, setSourceUrls] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        projectType,
        fuelType,
        state: state || undefined,
        county: county || undefined,
        capacityValue: capacityValue ? Number(capacityValue) : undefined,
        capacityUnit: capacityValue ? capacityUnit : undefined,
        applicationFiledDate: appliedDate || undefined,
        causeSlugs,
        causeDetail,
        sourceUrls,
        submitterName: submitterName || undefined,
        submitterEmail: submitterEmail || undefined,
      }),
    });

    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.details?.join("; ") ?? data.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-10 text-center flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Thanks — submitted for review</h1>
        <p className="text-sm text-[var(--muted)]">
          Your project has been added to the moderation queue. It will not appear on the public
          map or list until an admin reviews and approves it.
        </p>
        <Link href="/" className="text-sm underline">
          ← Back to map &amp; list
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
          ← Back to map &amp; list
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit a project</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Submissions go into a moderation queue and do not appear publicly until an admin
          reviews and approves them. At least one supporting source link is required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Project name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Project type">
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className={inputCls}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fuel / technology">
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
              className={inputCls}
            >
              {FUEL_TYPES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="State">
            <input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. TX" className={inputCls} />
          </Field>
          <Field label="County">
            <input value={county} onChange={(e) => setCounty(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Capacity">
            <input
              type="number"
              value={capacityValue}
              onChange={(e) => setCapacityValue(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Capacity unit">
            <input value={capacityUnit} onChange={(e) => setCapacityUnit(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Application / interconnection request filed date">
          <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} className={inputCls} />
        </Field>

        <Field label="Cause category (select at least one)">
          <div className="flex flex-col gap-1.5">
            {CAUSE_CATEGORIES.map((c) => (
              <label key={c.slug} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={causeSlugs.includes(c.slug)}
                  onChange={() =>
                    setCauseSlugs((prev) =>
                      prev.includes(c.slug) ? prev.filter((s) => s !== c.slug) : [...prev, c.slug],
                    )
                  }
                />
                {c.label}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Cause detail">
          <textarea
            required
            value={causeDetail}
            onChange={(e) => setCauseDetail(e.target.value)}
            rows={3}
            placeholder='e.g. "Awaiting Army Corps 404 permit since March 2023"'
            className={inputCls}
          />
        </Field>

        <Field label="Supporting source link(s) — one per line, required">
          <textarea
            required
            value={sourceUrls}
            onChange={(e) => setSourceUrls(e.target.value)}
            rows={3}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Your name (optional)">
            <input value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Your email (optional)">
            <input
              type="email"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="self-start px-4 py-2 rounded-md bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
