import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-utils";

export async function GET() {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  const sessions = await prisma.aiChatSession.findMany({
    where: { userId: user.id, isTemp: false },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: {
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser();
  if (error) return error;

  let body: { isTemp?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }

  const session = await prisma.aiChatSession.create({
    data: {
      userId: user.id,
      title: null, // set after first message
      isTemp: body.isTemp ?? false,
      model: "claude-haiku-4-5-20251001",
      tokenCount: 0,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
