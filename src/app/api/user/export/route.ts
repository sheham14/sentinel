import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      lists: { include: { items: true } },
      watchlists: true,
      consentLogs: true,
      featureUsages: true,
    },
  });

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Strip sensitive fields before export
  const { accounts, sessions, ...exportData } = userData as any;

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    data: exportData,
  });
}
