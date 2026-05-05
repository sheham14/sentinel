import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

// PATCH /api/alerts/[id]/read — mark single alert as read
// DELETE /api/alerts/[id] — dismiss (delete) single alert

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const { id } = await params;

  await prisma.alert.deleteMany({
    where: { id, userId: user!.id },
  });

  return NextResponse.json({ success: true });
}
