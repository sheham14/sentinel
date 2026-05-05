import { auth } from "../../../auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/layout/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const hasUnreadAlerts = session?.user?.id
    ? (await prisma.alert.count({
        where: { userId: session.user.id, readAt: null },
      })) > 0
    : false;

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0f1416] max-w-sm mx-auto">
      <main className="pb-[72px]">{children}</main>
      <BottomNav hasUnreadAlerts={hasUnreadAlerts} />
    </div>
  );
}
