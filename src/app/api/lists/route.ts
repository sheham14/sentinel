import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const lists = await prisma.list.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(lists);
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const body = await request.json();
  const { name } = body;

  const list = await prisma.list.create({
    data: {
      userId: user.id,
      name: name ?? "My List",
    },
  });

  return NextResponse.json(list, { status: 201 });
}
