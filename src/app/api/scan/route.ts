import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");

  if (!barcode) {
    return NextResponse.json({ error: "barcode is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { barcode },
    include: {
      storeProducts: {
        where: { isActive: true },
        include: {
          store: { select: { id: true, chain: true, name: true } },
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
