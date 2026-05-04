import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const pantry = await prisma.pantryItem.findMany({
    where: { userId: user.id },
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
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(pantry);
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { productId, name, quantity, unit, expiresAt, brand, category } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const item = await prisma.pantryItem.create({
    data: {
      userId: user.id,
      productId: productId ?? null,
      name,
      quantity: quantity ?? null,
      unit: unit ?? null,
      brand: brand ?? null,
      category: category ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      addedFrom: "manual",
    },
  });

  return NextResponse.json(item, { status: 201 });
}
