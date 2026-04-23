import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      storeProducts: {
        where: { isActive: true },
        include: {
          store: { select: { id: true, chain: true, name: true } },
          priceHistory: {
            orderBy: { scrapedAt: "desc" },
            take: 1,
          },
        },
        orderBy: { currentPrice: "asc" },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
