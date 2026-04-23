import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const prefs = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      emailNotifications: true,
      pushNotifications: true,
      marketingOptIn: true,
      digestFrequency: true,
    },
  });

  if (!prefs)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(prefs);
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const {
    emailNotifications,
    pushNotifications,
    marketingOptIn,
    digestFrequency,
  } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
      ...(marketingOptIn !== undefined && { marketingOptIn }),
      ...(digestFrequency !== undefined && { digestFrequency }),
    },
    select: {
      emailNotifications: true,
      pushNotifications: true,
      marketingOptIn: true,
      digestFrequency: true,
    },
  });

  return NextResponse.json(updated);
}
