import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { id } = await params;

  await prisma.alert.updateMany({
    where: { id, userId: user!.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
