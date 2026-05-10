import { Suspense } from "react";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home/HomeClient";
import HomePageSkeleton from "@/components/home/HomePageSkeleton";
import { getWatchlistSummary } from "@/lib/watchlist-summary";
import { prisma } from "@/lib/prisma";

async function HomeData() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [data, hasUnreadAlerts] = await Promise.all([
    getWatchlistSummary(session.user.id),
    prisma.alert.count({ where: { userId: session.user.id, readAt: null } }).then((n) => n > 0),
  ]);

  return (
    <HomeClient
      data={data}
      userName={session.user.name ?? null}
      userImage={session.user.image ?? null}
      hasUnreadAlerts={hasUnreadAlerts}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeData />
    </Suspense>
  );
}
