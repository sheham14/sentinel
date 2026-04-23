import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  // Get session — optional, guests can still search
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const where = {
    isActive: true,
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { brand: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category: category as any }),
  };

  const [products, total, watchlist] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
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
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.count({ where }),
    // Fetch user's watchlist IDs if logged in
    userId
      ? prisma.watchlist.findMany({
          where: { userId },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  const watchedIds = new Set(
    watchlist.map((w: { productId: string }) => w.productId),
  );

  // Shape into flat array the search page expects
  const shaped = products.map((product) => {
    const prices = product.storeProducts
      .filter((sp) => sp.priceHistory.length > 0)
      .map((sp) => ({
        storeId: sp.storeId,
        chain: sp.store.chain,
        price: Number(sp.priceHistory[0].price),
        isSale: sp.priceHistory[0].isSale,
      }))
      .sort((a, b) => a.price - b.price);

    const best = prices[0] ?? null;

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      unitSize: product.unitSize,
      imageUrl: product.imageUrl,
      category: product.category,
      bestPrice: best?.price ?? null,
      bestStore: best?.chain ?? null,
      prices,
      isWatched: watchedIds.has(product.id),
    };
  });

  return NextResponse.json(shaped, {
    headers: {
      // Cache for 5 min as per PLAN.md — Redis caching can replace this later
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
