import { prisma } from "@/lib/db";
import { serializeProject } from "@/lib/serialize";
import { Explorer } from "@/components/Explorer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    include: { causes: true, sources: true, milestones: true },
    orderBy: { createdAt: "asc" },
  });

  return <Explorer projects={projects.map(serializeProject)} />;
}
