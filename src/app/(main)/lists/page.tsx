import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListsClient from "@/components/lists/ListsClient";
import type { ComponentProps } from "react";

const LAST_LIST_KEY = "sentinel_last_list_id";

async function getLists(userId: string) {
  return prisma.list.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      _count: { select: { items: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function getListDetail(listId: string, userId: string) {
  return prisma.list.findFirst({
    where: { id: listId, userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              storeProducts: {
                where: { isActive: true },
                include: {
                  store: { select: { id: true, chain: true, name: true } },
                },
                orderBy: { currentPrice: "asc" },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

async function getRecipes(userId: string) {
  // Return all recipes for now — user-saved recipes come in Phase 2
  return prisma.recipe.findMany({
    take: 20,
    include: {
      ingredients: {
        select: {
          id: true,
          name: true,
          productId: true,
          quantity: true,
          unit: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { title: "asc" },
  });
}

export default async function ListsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const userId = session.user.id;

  const [rawLists, preferredStores, recipes] = await Promise.all([
    getLists(userId),
    prisma.userPreferredStore.findMany({
      where: { userId },
      include: { store: { select: { chain: true, name: true } } },
    }),
    getRecipes(userId),
  ]);

  const allLists = rawLists.map((l) => ({
    id: l.id,
    name: l.name,
    itemCount: l._count.items,
  }));

  // Load most recent list
  const firstList = rawLists[0] ?? null;
  const initialList = firstList
    ? await getListDetail(firstList.id, userId)
    : null;

  const shapedRecipes = recipes.map((r) => ({
    id: r.id,
    userId: r.userId ?? null,
    title: r.title,
    servings: r.servings ?? 4,
    prepMinutes: r.prepTime,
    cookMinutes: r.cookTime,
    estimatedCost: null,
    ingredients: r.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      productId: ing.productId ?? null,
      quantity: ing.quantity ? Number(ing.quantity) : null,
      unit: ing.unit ?? null,
    })),
  }));

  const serializedList = initialList
    ? {
        ...initialList,
        items: initialList.items.map((item) => ({
          ...item,
          quantity:
            item.quantity !== null && item.quantity !== undefined
              ? Number(item.quantity)
              : null,
          customPrice: item.customPrice ? Number(item.customPrice) : null,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          product: item.product
            ? {
                ...item.product,
                unitQuantity: item.product.unitQuantity
                  ? Number(item.product.unitQuantity)
                  : null,
                storeProducts: item.product.storeProducts.map((sp) => ({
                  ...sp,
                  currentPrice: sp.currentPrice
                    ? Number(sp.currentPrice)
                    : null,
                })),
              }
            : null,
        })),
      }
    : null;

  return (
    <ListsClient
      initialList={
        serializedList as ComponentProps<typeof ListsClient>["initialList"]
      }
      allLists={allLists}
      initialRecipes={shapedRecipes}
      currentUserId={userId}
      preferredStores={preferredStores.map((ps) => ({
        chain: ps.store.chain,
        name: ps.store.name,
      }))}
    />
  );
}
