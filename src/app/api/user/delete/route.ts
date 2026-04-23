import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function POST() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, deletionRequestedAt: true },
  });

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (userData.deletionRequestedAt) {
    return NextResponse.json(
      {
        error: "Deletion already requested",
        requestedAt: userData.deletionRequestedAt,
      },
      { status: 409 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { deletionRequestedAt: new Date() },
    select: { id: true, deletionRequestedAt: true },
  });

  return NextResponse.json({
    message:
      "Deletion requested. Your account will be permanently deleted within 30 days.",
    requestedAt: updated.deletionRequestedAt,
  });
}
