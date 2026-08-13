import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { upsertNormalizedProject } from "@/lib/ingest/common";
import type { CauseSlug } from "@/lib/data/causeCategories";
import type { FuelType, ProjectStage, ProjectType } from "@/lib/data/taxonomies";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const submissions = await prisma.submission.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(submissions);
}

interface PatchBody {
  id: string;
  action: "approve" | "reject";
  reviewerNote?: string;
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as PatchBody;
  const submission = await prisma.submission.findUnique({ where: { id: body.id } });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (submission.status !== "pending") {
    return NextResponse.json({ error: "Submission already reviewed" }, { status: 409 });
  }

  if (body.action === "reject") {
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "rejected", reviewedAt: new Date(), reviewerNote: body.reviewerNote ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  // approve — publish as a real Project, never auto-published before this point
  const causeSlugs = submission.causeSlugs.split(",").filter(Boolean) as CauseSlug[];
  const sources = submission.sourceUrls
    .split("\n")
    .filter(Boolean)
    .map((url) => ({ label: "User-submitted source", url }));

  const project = await upsertNormalizedProject({
    matchKey: `submission:${submission.id}`,
    name: submission.name,
    projectType: submission.projectType as ProjectType,
    fuelType: submission.fuelType as FuelType,
    lat: submission.lat,
    lon: submission.lon,
    state: submission.state,
    county: submission.county,
    capacityValue: submission.capacityValue,
    capacityUnit: submission.capacityUnit,
    applicationFiledDate: submission.applicationFiledDate,
    currentStatus: "User-submitted, verified by admin review",
    currentStage: "agency_permitting" as ProjectStage,
    causeSlugs,
    causeDetail: submission.causeDetail,
    dataQualityNote: "Originally submitted by a member of the public and verified by an admin before publishing.",
    sources,
    externalIds: {},
  });

  // upsertNormalizedProject always sets verificationStatus "verified"
  // (it's shared with the automated ingestion modules) — override it here
  // so user submissions are visibly distinguished from primary-source data.
  await prisma.project.update({
    where: { id: project.id },
    data: { verificationStatus: "user_submitted_verified" },
  });

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: "approved",
      reviewedAt: new Date(),
      reviewerNote: body.reviewerNote ?? null,
      publishedProjectId: project.id,
    },
  });

  return NextResponse.json({ ok: true, projectSlug: project.slug });
}
