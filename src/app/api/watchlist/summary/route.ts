import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { getWatchlistSummary } from "@/lib/watchlist-summary";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getWatchlistSummary(session.user.id);
  return NextResponse.json(data);
}
