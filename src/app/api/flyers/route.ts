import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  const now = new Date();

  const flyers = await prisma.flyer.findMany({
    where: {
      validFrom: { lte: now },
      validUntil: { gte: now },
      ...(storeId && { storeId }),
    },
    include: {
      store: { select: { id: true, chain: true, name: true } },
    },
    orderBy: { validUntil: "asc" },
  });

  return NextResponse.json(flyers);
}
