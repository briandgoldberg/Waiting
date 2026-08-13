import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: { causes: true, sources: true, milestones: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(projects.map(serializeProject));
}
