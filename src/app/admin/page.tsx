import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminQueue } from "@/components/AdminQueue";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) return <AdminLogin />;

  const submissions = await prisma.submission.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminQueue
      initialSubmissions={submissions.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
