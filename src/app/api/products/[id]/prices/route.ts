import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  const range = searchParams.get("range") ?? "90d";

  const rangeMap: Record<string, number> = {
    "30d": 30,
    "90d": 90,
    "1y": 365,
    all: 9999,
  };
  const days = rangeMap[range] ?? 90;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const storeProducts = await prisma.storeProduct.findMany({
    where: {
      productId: id,
      isActive: true,
      ...(storeId && { storeId }),
    },
    include: {
      store: { select: { id: true, chain: true, name: true } },
      priceHistory: {
        where: { scrapedAt: { gte: since } },
        orderBy: { scrapedAt: "asc" },
      },
    },
  });

  if (!storeProducts.length) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(storeProducts);
}
