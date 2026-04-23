import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: user!.id },
    include: {
      product: {
        include: {
          storeProducts: {
            where: { isActive: true },
            include: {
              store: { select: { id: true, chain: true, name: true } },
            },
            orderBy: { currentPrice: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(watchlist);
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { productId, targetPrice } = body;

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 },
    );
  }

  const entry = await prisma.watchlist.upsert({
    where: { userId_productId: { userId: user!.id, productId } },
    update: { targetPrice: targetPrice ?? null },
    create: { userId: user!.id, productId, targetPrice: targetPrice ?? null },
  });

  return NextResponse.json(entry, { status: 201 });
}
