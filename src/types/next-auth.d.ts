import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    onboardingCompleted: boolean;
  }
}
