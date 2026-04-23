import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingOptIn: true,
      digestFrequency: true,
      onboardingCompleted: true,
      createdAt: true,
    },
  });

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(userData);
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const {
    name,
    emailNotifications,
    pushNotifications,
    marketingOptIn,
    digestFrequency,
  } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(pushNotifications !== undefined && { pushNotifications }),
      ...(marketingOptIn !== undefined && { marketingOptIn }),
      ...(digestFrequency !== undefined && { digestFrequency }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingOptIn: true,
      digestFrequency: true,
    },
  });

  return NextResponse.json(updated);
}
