import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function PATCH() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  await prisma.alert.updateMany({
    where: { userId: user.id, sentAt: null },
    data: { sentAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  await prisma.alert.deleteMany({
    where: {
      userId: user.id,
      sentAt: { not: null },
    },
  });

  return NextResponse.json({ success: true });
}
