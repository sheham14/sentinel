import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
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
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  // Calculate estimated cost — sum of cheapest store price per ingredient
  let estimatedCost = 0;
  for (const ing of recipe.ingredients) {
    if (ing.product?.storeProducts?.[0]?.currentPrice) {
      estimatedCost += Number(ing.product.storeProducts[0].currentPrice);
    }
  }

  return NextResponse.json({
    ...recipe,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
  });
}
