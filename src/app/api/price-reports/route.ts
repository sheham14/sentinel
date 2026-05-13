import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { productId, storeId, reportedPrice, notes } = await req.json();

  const storeProduct = await prisma.storeProduct.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });
  if (!storeProduct) {
    return NextResponse.json(
      { error: "Store product not found" },
      { status: 404 },
    );
  }

  const report = await prisma.priceReport.create({
    data: {
      storeProductId: storeProduct.id,
      reportedBy: user.id,
      reportedPrice,
      currentDbPrice: storeProduct.currentPrice,
      seenAt: new Date(),
      notes: notes ?? null,
    },
  });

  return NextResponse.json(
    { success: true, reportId: report.id },
    { status: 201 },
  );
}
