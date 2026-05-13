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
      dietaryRestrictions: true,
      allergies: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingOptIn: true,
      digestFrequency: true,
      onboardingCompleted: true,
      createdAt: true,
      preferredStores: {
        select: {
          storeId: true,
          store: { select: { id: true, chain: true, name: true } },
        },
      },
    },
  });

  if (!userData)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(userData);
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  let body: {
    name?: unknown;
    dietaryRestrictions?: unknown;
    allergies?: unknown;
    preferredStores?: unknown;
    emailNotifications?: unknown;
    pushNotifications?: unknown;
    marketingOptIn?: unknown;
    digestFrequency?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    name,
    dietaryRestrictions,
    allergies,
    preferredStores,
    emailNotifications,
    pushNotifications,
    marketingOptIn,
    digestFrequency,
  } = body;

  // Validate arrays
  if (
    dietaryRestrictions !== undefined &&
    !Array.isArray(dietaryRestrictions)
  ) {
    return NextResponse.json(
      { error: "dietaryRestrictions must be an array" },
      { status: 400 },
    );
  }
  if (allergies !== undefined && !Array.isArray(allergies)) {
    return NextResponse.json(
      { error: "allergies must be an array" },
      { status: 400 },
    );
  }
  if (preferredStores !== undefined && !Array.isArray(preferredStores)) {
    return NextResponse.json(
      { error: "preferredStores must be an array" },
      { status: 400 },
    );
  }

  // Update user fields
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name: String(name) }),
      ...(dietaryRestrictions !== undefined && {
        dietaryRestrictions: (dietaryRestrictions as string[]).filter(Boolean),
      }),
      ...(allergies !== undefined && {
        allergies: (allergies as string[]).filter(Boolean),
      }),
      ...(emailNotifications !== undefined && {
        emailNotifications: Boolean(emailNotifications),
      }),
      ...(pushNotifications !== undefined && {
        pushNotifications: Boolean(pushNotifications),
      }),
      ...(marketingOptIn !== undefined && {
        marketingOptIn: Boolean(marketingOptIn),
      }),
      ...(digestFrequency !== undefined && {
        digestFrequency: digestFrequency as
          | "immediate"
          | "daily"
          | "weekly"
          | "none",
      }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      dietaryRestrictions: true,
      allergies: true,
      emailNotifications: true,
      pushNotifications: true,
      marketingOptIn: true,
      digestFrequency: true,
    },
  });

  // Handle preferred stores separately — delete + insert in transaction
  if (preferredStores !== undefined) {
    const storeIds = preferredStores as string[];
    await prisma.$transaction([
      prisma.userPreferredStore.deleteMany({ where: { userId: user.id } }),
      ...storeIds.map((storeId) =>
        prisma.userPreferredStore.create({
          data: { userId: user.id, storeId },
        }),
      ),
    ]);
  }

  return NextResponse.json(updated);
}
