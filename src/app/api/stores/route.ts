import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get("chain");
  const city = searchParams.get("city");

  const stores = await prisma.store.findMany({
    where: {
      isActive: true,
      ...(chain && { chain }),
      ...(city && { city: { contains: city, mode: "insensitive" as const } }),
    },
    orderBy: { chain: "asc" },
  });

  return NextResponse.json(stores);
}
