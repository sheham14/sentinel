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
    async createUser({ user }) {
      console.log("CREATE USER EVENT:", user);
      try {
        const systemRecipes = await prisma.recipe.findMany({
          where: { userId: null, isActive: true },
          include: { ingredients: { orderBy: { sortOrder: "asc" } } },
        });

        await Promise.all(
          systemRecipes.map((recipe) =>
            prisma.recipe.create({
              data: {
                userId: user.id,
                title: recipe.title,
                description: recipe.description,
                imageUrl: recipe.imageUrl,
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
                servings: recipe.servings,
                instructions: recipe.instructions ?? undefined,
                ingredients: {
                  create: recipe.ingredients.map((ing) => ({
                    name: ing.name,
                    quantity: ing.quantity,
                    unit: ing.unit,
                    notes: ing.notes,
                    isOptional: ing.isOptional,
                    sortOrder: ing.sortOrder,
                  })),
                },
              },
            }),
          ),
        );
        console.log(
          `✅ Copied ${systemRecipes.length} system recipes to new user ${user.id}`,
        );
      } catch (err) {
        console.error("Failed to copy system recipes:", err);
      }
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
