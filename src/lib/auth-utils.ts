import { auth } from "../../auth";
import { NextResponse } from "next/server";

export type AuthenticatedUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export type AuthResult =
  | { user: AuthenticatedUser; error: null }
  | { user: null; error: NextResponse };

export async function getAuthenticatedUser(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    error: null,
  };
}
