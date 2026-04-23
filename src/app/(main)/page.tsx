import { Suspense } from "react";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import HomeClient from "@/components/home/HomeClient";
import HomePageSkeleton from "@/components/home/HomePageSkeleton";
import { getWatchlistSummary } from "@/lib/watchlist-summary";

async function HomeData() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const data = await getWatchlistSummary(session.user.id);

  return (
    <HomeClient
      data={data}
      userName={session.user.name ?? null}
      userImage={session.user.image ?? null}
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
