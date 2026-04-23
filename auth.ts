import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

console.log("AUTH_SECRET:", process.env.AUTH_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  events: {
    signIn(message) {
      console.log("SIGNIN EVENT:", message);
    },
    createUser(message) {
      console.log("CREATE USER EVENT:", message);
    },
  },
  logger: {
    error(error) {
      console.error("AUTH ERROR:", error);
    },
    warn(code) {
      console.warn("AUTH WARN:", code);
    },
    debug(code, metadata) {
      console.log("AUTH DEBUG:", code, metadata);
    },
  },
});
