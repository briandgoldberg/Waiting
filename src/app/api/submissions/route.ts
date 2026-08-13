import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CAUSE_CATEGORY_BY_SLUG } from "@/lib/data/causeCategories";

interface SubmissionPayload {
  name: string;
  projectType: string;
  fuelType: string;
  lat?: number;
  lon?: number;
  state?: string;
  county?: string;
  capacityValue?: number;
  capacityUnit?: string;
  applicationFiledDate?: string;
  causeSlugs: string[];
  causeDetail: string;
  sourceUrls: string; // newline-separated
  submitterName?: string;
  submitterEmail?: string;
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SubmissionPayload>;

  const errors: string[] = [];
  if (!body.name?.trim()) errors.push("name is required");
  if (!body.projectType?.trim()) errors.push("projectType is required");
  if (!body.fuelType?.trim()) errors.push("fuelType is required");
  if (!body.causeDetail?.trim()) errors.push("causeDetail is required");
  if (!body.causeSlugs || body.causeSlugs.length === 0) {
    errors.push("at least one causeSlug is required");
  } else if (body.causeSlugs.some((c) => !CAUSE_CATEGORY_BY_SLUG[c as keyof typeof CAUSE_CATEGORY_BY_SLUG])) {
    errors.push("causeSlugs contains an unknown category");
  }

  const sourceUrls = (body.sourceUrls ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (sourceUrls.length === 0) {
    errors.push("at least one supporting source link is required");
  } else if (!sourceUrls.every(isValidUrl)) {
    errors.push("all source links must be valid http(s) URLs");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      name: body.name!.trim(),
      projectType: body.projectType!,
      fuelType: body.fuelType!,
      lat: body.lat ?? null,
      lon: body.lon ?? null,
      state: body.state?.trim() || null,
      county: body.county?.trim() || null,
      capacityValue: body.capacityValue ?? null,
      capacityUnit: body.capacityUnit?.trim() || null,
      applicationFiledDate: body.applicationFiledDate ? new Date(body.applicationFiledDate) : null,
      causeSlugs: body.causeSlugs!.join(","),
      causeDetail: body.causeDetail!.trim(),
      sourceUrls: sourceUrls.join("\n"),
      submitterName: body.submitterName?.trim() || null,
      submitterEmail: body.submitterEmail?.trim() || null,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, id: submission.id }, { status: 201 });
}
