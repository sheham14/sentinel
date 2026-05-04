"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Check,
  Trash2,
  Pencil,
  ChefHat,
  MoreHorizontal,
} from "lucide-react";
import EditItemSheet from "@/components/lists/EditItemSheet";
import ListDropdown from "@/components/lists/ListDropdown";
import ListOptionsMenu from "@/components/lists/ListOptionsMenu";
import { calculateEffectivePrice, getAllowedUnits } from "@/lib/unit-convert";

// ── Types ──────────────────────────────────────

const STORE_META: Record<
  string,
  { color: string; bg: string; letter: string }
> = {
  walmart: { color: "#0071ce", bg: "#0071ce18", letter: "W" },
  loblaws: { color: "#c8102e", bg: "#c8102e18", letter: "L" },
  metro: { color: "#e30000", bg: "#e3000018", letter: "M" },
  sobeys: { color: "#d62b2b", bg: "#d62b2b18", letter: "S" },
  dollarama: { color: "#00853e", bg: "#00853e18", letter: "D" },
};

type StoreProduct = {
  id: string;
  currentPrice: number | null;
  isActive: boolean;
  store: {
    id: string;
    chain: string;
    name: string;
  };
};

type Product = {
  id: string;
  name: string;
  brand: string | null;
  unitSize: string | null;
  unitMeasure: string | null;
  unitQuantity: number | null;
  storeProducts: StoreProduct[];
};

type ProductSuggestion = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  bestPrice: number | null;
  bestStore: string | null;
};

type ListItem = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  isChecked: boolean;
  sortOrder: number;
  customPrice: number | null;
  product: Product | null;
};

type GroceryList = {
  id: string;
  name: string;
  items: ListItem[];
};

type Recipe = {
  id: string;
  userId: string | null;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  estimatedCost: number | null;
  ingredients: {
    id: string;
    name: string;
    productId?: string | null;
    quantity?: number | null;
    unit?: string | null;
  }[];
};

type ListMeta = {
  id: string;
  name: string;
  itemCount: number;
};

// ── Helpers ────────────────────────────────────

function getBestPrice(
  product: Product | null,
): { price: number; chain: string } | null {
  if (!product) return null;
  const prices = product.storeProducts
    .filter((sp) => sp.currentPrice !== null)
    .map((sp) => ({ price: Number(sp.currentPrice), chain: sp.store.chain }))
    .sort((a, b) => a.price - b.price);
  return prices[0] ?? null;
}

function getEffectivePriceRange(
  product: Product | null,
  quantity: number,
  unit: string,
  customPrice: number | null,
): { min: number; max: number } | null {
  // Plain text item with custom price
  if (!product && customPrice !== null) {
    const total = customPrice * quantity;
    return { min: total, max: total };
  }

  if (!product) return null;

  const prices = product.storeProducts
    .filter((sp) => sp.currentPrice !== null)
    .map((sp) =>
      calculateEffectivePrice(
        Number(sp.currentPrice),
        product.unitQuantity,
        product.unitMeasure,
        product.unitSize,
        quantity,
        unit,
      ),
    )
    .filter((p): p is number => p !== null);

  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getStoreTotals(
  items: ListItem[],
  preferredChains: string[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const item of items) {
    if (item.isChecked) continue;
    const qty = Number(item.quantity ?? 1);
    const unit = item.unit ?? "each";

    // Plain text item with custom price — add to all preferred stores equally
    if (!item.product && item.customPrice !== null) {
      for (const chain of preferredChains) {
        totals[chain] = (totals[chain] ?? 0) + item.customPrice * qty;
      }
      continue;
    }

    if (!item.product) continue;

    for (const sp of item.product.storeProducts) {
      const chain = sp.store?.chain?.toLowerCase();
      if (!chain || !preferredChains.includes(chain)) continue;
      if (sp.currentPrice === null) continue;
      const effective = calculateEffectivePrice(
        Number(sp.currentPrice),
        item.product.unitQuantity,
        item.product.unitMeasure,
        item.product.unitSize,
        qty,
        unit,
      );
      if (effective !== null) {
        totals[chain] = (totals[chain] ?? 0) + effective;
      }
    }
  }
  return totals;
}

const LAST_LIST_KEY = "sentinel_last_list_id";

// ── List item row ──────────────────────────────

function ListItemRow({
  item,
  activeChain,
  onCheck,
  onEdit,
  onDelete,
  onQuantityChange,
}: {
  item: ListItem;
  activeChain: string | null;
  onCheck: (id: string) => void;
  onEdit: (item: ListItem) => void;
  onDelete: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}) {
  const startX = useRef(0);
  const [swiped, setSwiped] = useState(false);
  const qty = Number(item.quantity ?? 1);
  const unit = item.unit ?? "each";
  const priceRange = getEffectivePriceRange(
    item.product,
    qty,
    unit,
    item.customPrice,
  );

  const filteredSp =
    activeChain && item.product
      ? item.product.storeProducts.find(
          (sp) => sp.store.chain.toLowerCase() === activeChain.toLowerCase(),
        )
      : null;

  const filteredPrice =
    filteredSp?.currentPrice !== null && filteredSp?.currentPrice !== undefined
      ? calculateEffectivePrice(
          Number(filteredSp.currentPrice),
          item.product!.unitQuantity,
          item.product!.unitMeasure,
          item.product!.unitSize, // ← added
          qty,
          unit,
        )
      : null;

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 10) return; // tap, not swipe
    if (diff > 60) setSwiped(true);
    else if (diff < -20) setSwiped(false);
  }

  return (
    <div className="relative overflow-hidden border-b border-[#f5f5f5] dark:border-[#1e2528]">
      {/* Swipe actions — only for active items */}
      {!item.isChecked && (
        <div className="absolute right-0 top-0 bottom-0 flex">
          <button
            onClick={() => {
              setSwiped(false);
              onEdit(item);
            }}
            className="w-10 flex items-center justify-center bg-[#f0fdf9] dark:bg-[#1a2e2a]"
          >
            <Pencil size={14} className="text-[#00b89e]" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-10 flex items-center justify-center bg-[#fef2f2] dark:bg-[#2e1a1a]"
          >
            <Trash2 size={14} className="text-[#ef4444]" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Item row */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={[
          "flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-[#0f1416] transition-all duration-200",
          item.isChecked ? "opacity-50" : "",
          swiped && !item.isChecked ? "-translate-x-20" : "translate-x-0",
        ].join(" ")}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCheck(item.id);
          }}
          className={[
            "w-[22px] h-[22px] rounded-full border flex items-center justify-center flex-shrink-0 transition-all",
            item.isChecked
              ? "bg-[#00E5C3] border-[#00E5C3]"
              : "border-[#e0e0e0] dark:border-[#2e3538] bg-white dark:bg-[#1e2528]",
          ].join(" ")}
        >
          {item.isChecked && (
            <Check size={11} className="text-[#004d40]" strokeWidth={2.5} />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className={[
              "text-[13px] font-medium truncate",
              item.isChecked
                ? "line-through text-[#aaa]"
                : "text-[#111] dark:text-[#e0e0e0]",
            ].join(" ")}
          >
            {item.name}
          </p>

          {/* Notes */}
          {item.notes && !item.isChecked && (
            <p className="text-[11px] text-[#bbb] dark:text-[#555] italic truncate mt-0.5">
              {item.notes}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {activeChain && filteredPrice !== null ? (
              <span className="text-[11px] text-[#00b89e]">
                ${filteredPrice.toFixed(2)}
              </span>
            ) : priceRange ? (
              <span className="text-[11px] text-[#00b89e]">
                ${priceRange.min.toFixed(2)}
                {priceRange.min !== priceRange.max &&
                  ` – $${priceRange.max.toFixed(2)}`}
                {!item.product && (
                  <span className="text-[10px] text-[#bbb] ml-1">custom</span>
                )}
              </span>
            ) : (
              <span className="text-[11px] text-[#ccc]">Price unavailable</span>
            )}
          </div>
        </div>

        {/* Inline quantity — hidden for completed items */}
        {!item.isChecked ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (qty > 1) onQuantityChange(item.id, qty - 1);
              }}
              className="w-6 h-6 rounded-lg border border-[#e0e0e0] dark:border-[#2e3538] flex items-center justify-center text-[#888] dark:text-[#555]"
            >
              <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                <path
                  d="M1 1H9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <span className="text-[12px] font-medium text-[#888] dark:text-[#aaa] min-w-[28px] text-center">
              {qty}
              {item.unit && item.unit !== "each" ? ` ${item.unit}` : ""}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (qty < 999) onQuantityChange(item.id, qty + 1);
              }}
              className="w-6 h-6 rounded-lg border border-[#e0e0e0] dark:border-[#2e3538] flex items-center justify-center text-[#888] dark:text-[#555]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 1V9M1 5H9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          // Completed — just show qty, no controls
          <span className="text-[12px] text-[#ccc] dark:text-[#444] flex-shrink-0">
            {qty}
            {item.unit && item.unit !== "each" ? ` ${item.unit}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmSheet({
  recipe,
  onConfirm,
  onCancel,
  deleting,
}: {
  recipe: Recipe;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-30" onClick={onCancel} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white dark:bg-[#1e2528] rounded-t-[24px] z-40 pb-8">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0] dark:bg-[#2e3538]" />
        </div>
        <div className="px-5 pt-4 pb-2">
          <div className="w-10 h-10 rounded-[12px] bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-1">
            Delete recipe?
          </p>
          <p className="text-[13px] text-[#aaa] leading-relaxed">
            "{recipe.title}" will be removed. This can't be undone.
          </p>
        </div>
        <div className="px-5 pt-3 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="w-full py-3 bg-red-500 rounded-[12px] text-[13px] font-medium text-white disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete recipe"}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-[12px] border border-[#e0e0e0] dark:border-[#2e3538] text-[13px] text-[#555] dark:text-[#aaa]"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Three-dot Menu ───────────────────────────────────────────────────────────

function RecipeMenu({
  recipe,
  onDelete,
  onClose,
  buttonRef,
}: {
  recipe: Recipe;
  onDelete: () => void;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  const rect = buttonRef.current?.getBoundingClientRect();
  const top = (rect?.bottom ?? 0) + 4;
  const right = window.innerWidth - (rect?.right ?? 0);

  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div
        className="fixed z-30 bg-white dark:bg-[#242b2e] border border-[#ebebeb] dark:border-[#2e3538] rounded-[12px] shadow-lg overflow-hidden min-w-[140px]"
        style={{ top, right }}
      >
        <Link
          href={`/recipes/${recipe.id}/edit`}
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#111] dark:text-[#e0e0e0] hover:bg-[#f7f7f7] dark:hover:bg-[#2e3538] transition-colors border-b border-[#f5f5f5] dark:border-[#2e3538]"
        >
          <Pencil size={13} className="text-[#aaa]" />
          Edit
        </Link>
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </>
  );
}

// ── Recipe card ────────────────────────────────

export function RecipeCard({
  recipe,
  currentUserId,
  onAddToList,
  onDeleted,
}: {
  recipe: Recipe;
  currentUserId: string;
  onAddToList: (recipe: Recipe) => void;
  onDeleted: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isOwner = recipe.userId === currentUserId;
  const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(recipe.id);
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
      <div className="relative mx-4 mb-3 bg-white dark:bg-[#1e2528] border border-[#ebebeb] dark:border-[#2e3538] rounded-[14px] overflow-hidden">
        <div className="flex items-center gap-3 p-3.5">
          <div className="w-12 h-12 rounded-[10px] bg-[#f7f7f7] dark:bg-[#242b2e] flex items-center justify-center text-[22px] flex-shrink-0">
            🍽️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#111] dark:text-[#e0e0e0] truncate">
              {recipe.title}
            </p>
            <p className="text-[11px] text-[#aaa] mt-0.5">
              {recipe.servings} servings
              {totalTime > 0 && ` · ${totalTime} min`}
              {` · ${recipe.ingredients.length} ingredients`}
            </p>
          </div>

          {/* 3-dot menu — owner only */}
          {isOwner && (
            <div className="relative flex-shrink-0">
              <button
                ref={menuButtonRef}
                onClick={() => setMenuOpen((v) => !v)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#f4f4f4] dark:hover:bg-[#242b2e] transition-colors"
              >
                <MoreHorizontal size={15} className="text-[#aaa]" />
              </button>
              {menuOpen && (
                <RecipeMenu
                  recipe={recipe}
                  onDelete={() => setConfirmDelete(true)}
                  onClose={() => setMenuOpen(false)}
                  buttonRef={menuButtonRef}
                />
              )}
            </div>
          )}
        </div>

        {recipe.estimatedCost && (
          <div className="flex items-center justify-between px-3.5 py-2 bg-[#f0fdf9] dark:bg-[#1a2e2a] border-t border-[#e0faf4] dark:border-[#1e4a3a]">
            <span className="text-[12px] text-[#0a7a62] dark:text-[#6ee7c7]">
              Estimated cost
            </span>
            <span className="text-[12px] font-medium text-[#0a7a62] dark:text-[#6ee7c7]">
              ${recipe.estimatedCost.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex border-t border-[#f5f5f5] dark:border-[#2e3538]">
          <button
            onClick={() => onAddToList(recipe)}
            className="flex-1 py-2.5 text-[11px] font-medium text-[#00b89e] text-center"
          >
            Add all to list
          </button>
          <div className="w-px bg-[#f5f5f5] dark:bg-[#2e3538]" />
          <Link
            href={`/recipes/${recipe.id}`}
            className="flex-1 py-2.5 text-[11px] font-medium text-[#00b89e] text-center"
          >
            View
          </Link>
        </div>
      </div>

      {confirmDelete && (
        <DeleteConfirmSheet
          recipe={recipe}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          deleting={deleting}
        />
      )}
    </>
  );
}

// ─── Recipe FAB ───────────────────────────────────────────────────────────────

export function RecipeFAB() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/recipes/new")}
      className="fixed bottom-[76px] right-4 z-10 w-12 h-12 bg-[#00E5C3] rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      aria-label="New recipe"
    >
      <Plus size={22} className="text-[#004d40]" strokeWidth={2.5} />
    </button>
  );
}

// ── Main component ─────────────────────────────

export default function ListsClient({
  initialList,
  allLists,
  initialRecipes,
  preferredStores,
  currentUserId,
}: {
  initialList: GroceryList | null;
  allLists: ListMeta[];
  initialRecipes: Recipe[];
  preferredStores: { chain: string; name: string }[];
  currentUserId: string;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const router = useRouter();
  const [lists, setLists] = useState<ListMeta[]>(allLists);
  const [activeList, setActiveList] = useState<GroceryList | null>(initialList);
  const [items, setItems] = useState<ListItem[]>(initialList?.items ?? []);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"grocery" | "recipes">(
    searchParams.get("tab") === "recipes" ? "recipes" : "grocery",
  );
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  //   const [optimizing, setOptimizing] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const quantityDebounceRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout>();
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const res = await fetch(
        `/api/products?q=${encodeURIComponent(q)}&limit=5`,
      );
      const data = res.ok ? await res.json() : [];
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);
  const preferredChains = preferredStores.map((s) => s.chain.toLowerCase());
  const storeTotals = getStoreTotals(items, preferredChains);

  // Best store for this list
  const sortedTotals = Object.entries(storeTotals)
    .filter(([, t]) => t > 0)
    .sort((a, b) => a[1] - b[1]);
  const bestStoreChain = sortedTotals[0]?.[0] ?? null;
  const activeTotal = activeChain ? storeTotals[activeChain] : null;

  // Save last viewed list
  useEffect(() => {
    if (activeList) {
      localStorage.setItem(LAST_LIST_KEY, activeList.id);
    }
  }, [activeList?.id]);

  // ── Switch list ────────────────────────────

  async function handleSwitchList(list: ListMeta) {
    const res = await fetch(`/api/lists/${list.id}`);
    if (!res.ok) return;
    const data = await res.json();
    setActiveList(data);
    setItems(data.items ?? []);
  }

  // ── Create list ────────────────────────────

  async function handleCreateList(name: string) {
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;
    const newList = await res.json();
    setLists((prev) => [
      ...prev,
      { id: newList.id, name: newList.name, itemCount: 0 },
    ]);
    setActiveList(newList);
    setItems([]);
  }

  // ── Add item ───────────────────────────────

  async function handleAddItem(productId?: string, productName?: string) {
    const name = productName ?? newItemName.trim();
    if (!name || !activeList) return;

    const res = await fetch(`/api/lists/${activeList.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        productId: productId ?? null,
        quantity: 1,
        unit: "each",
      }),
    });
    if (!res.ok) return;
    const newItem = await res.json();
    setItems((prev) => [...prev, newItem]);
    // Keep input open but clear it for next item
    setNewItemName("");
    setSuggestions([]);
    setLists((prev) =>
      prev.map((l) =>
        l.id === activeList.id ? { ...l, itemCount: l.itemCount + 1 } : l,
      ),
    );
  }

  // ── Check item ─────────────────────────────

  async function handleCheck(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item || !activeList) return;
    const newChecked = !item.isChecked;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isChecked: newChecked } : i)),
    );
    await fetch(`/api/lists/${activeList.id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, isChecked: newChecked }),
    });
  }

  function handleQuantityChange(itemId: string, quantity: number) {
    if (!activeList) return;
    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    );
    // Debounce the API call
    clearTimeout(quantityDebounceRefs.current[itemId]);
    quantityDebounceRefs.current[itemId] = setTimeout(async () => {
      await fetch(`/api/lists/${activeList.id}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
    }, 600);
  }

  async function handleClearCompleted() {
    if (!activeList) return;
    const completedIds = items.filter((i) => i.isChecked).map((i) => i.id);
    if (!completedIds.length) return;
    // Optimistic update
    setItems((prev) => prev.filter((i) => !i.isChecked));
    await fetch(`/api/lists/${activeList.id}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearCompleted: true }),
    });
    setLists((prev) =>
      prev.map((l) =>
        l.id === activeList.id
          ? { ...l, itemCount: items.filter((i) => !i.isChecked).length }
          : l,
      ),
    );
  }

  async function handleClearAll() {
    if (!activeList) return;
    setItems([]);
    await fetch(`/api/lists/${activeList.id}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    });
    setLists((prev) =>
      prev.map((l) => (l.id === activeList.id ? { ...l, itemCount: 0 } : l)),
    );
  }

  async function handleDeleteList() {
    if (!activeList) return;
    await fetch(`/api/lists/${activeList.id}`, { method: "DELETE" });
    const remaining = lists.filter((l) => l.id !== activeList.id);
    setLists(remaining);
    if (remaining.length > 0) {
      handleSwitchList(remaining[0]);
    } else {
      setActiveList(null);
      setItems([]);
    }
  }

  // ── Edit item ──────────────────────────────

  async function handleSaveEdit(
    itemId: string,
    data: {
      quantity: number;
      unit: string;
      notes: string;
      customPrice: number | null;
    },
  ) {
    if (!activeList) return;
    const res = await fetch(`/api/lists/${activeList.id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, ...data }),
    });
    if (!res.ok) return;
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...data } : i)),
    );
  }
  // ── Delete item ────────────────────────────

  async function handleDelete(itemId: string) {
    if (!activeList) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch(`/api/lists/${activeList.id}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    setLists((prev) =>
      prev.map((l) =>
        l.id === activeList.id
          ? { ...l, itemCount: Math.max(0, l.itemCount - 1) }
          : l,
      ),
    );
  }

  // ── Optimize ───────────────────────────────

  //   async function handleOptimize() {
  //     if (!activeList || !bestStoreChain) return;
  //     setOptimizing(true);
  //     setActiveChain(bestStoreChain);
  //     setOptimizing(false);
  //   }

  // ── Add recipe to list ─────────────────────

  async function handleAddRecipeToList(recipe: Recipe) {
    if (!activeList) return;
    await Promise.all(
      recipe.ingredients.map((ing) =>
        fetch(`/api/lists/${activeList.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: ing.productId ?? undefined,
            name: ing.name,
            quantity: ing.quantity ? Number(ing.quantity) : 1,
            unit: ing.unit ?? null,
          }),
        }),
      ),
    );
    // Refetch list
    const res = await fetch(`/api/lists/${activeList.id}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    }
    setActiveTab("grocery");
  }

  // ─── Delete Confirm Sheet ─────────────────────────────────────────────────────

  function DeleteConfirmSheet({
    recipe,
    onConfirm,
    onCancel,
    deleting,
  }: {
    recipe: Recipe;
    onConfirm: () => void;
    onCancel: () => void;
    deleting: boolean;
  }) {
    return (
      <>
        <div className="fixed inset-0 bg-black/40 z-30" onClick={onCancel} />
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white dark:bg-[#1e2528] rounded-t-[24px] z-40 pb-8">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#e0e0e0] dark:bg-[#2e3538]" />
          </div>
          <div className="px-5 pt-4 pb-2">
            <div className="w-10 h-10 rounded-[12px] bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-3">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-1">
              Delete recipe?
            </p>
            <p className="text-[13px] text-[#aaa] leading-relaxed">
              "{recipe.title}" will be removed. This can't be undone.
            </p>
          </div>
          <div className="px-5 pt-3 flex flex-col gap-2">
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="w-full py-3 bg-red-500 rounded-[12px] text-[13px] font-medium text-white disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete recipe"}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 rounded-[12px] border border-[#e0e0e0] dark:border-[#2e3538] text-[13px] text-[#555] dark:text-[#aaa]"
            >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Empty state ────────────────────────────

  if (!activeList && lists.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f1416] flex flex-col items-center justify-center px-8 text-center pb-24">
        <div className="w-14 h-14 rounded-[18px] bg-[#f0fdf9] dark:bg-[#1a2e2a] flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect
              x="4"
              y="3"
              width="16"
              height="18"
              rx="2"
              stroke="#00b89e"
              strokeWidth="1.5"
            />
            <path
              d="M8 8H16M8 12H16M8 16H12"
              stroke="#00b89e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-2">
          No lists yet
        </p>
        <p className="text-[13px] text-[#aaa] leading-relaxed mb-6">
          Create a grocery list to start tracking what you need and find the
          best prices.
        </p>
        <button
          onClick={() => handleCreateList("Weekly Groceries")}
          className="px-6 py-3 bg-[#00E5C3] rounded-xl text-[13px] font-medium text-[#004d40]"
        >
          Create your first list
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1416] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        {activeTab === "grocery" && activeList ? (
          <ListDropdown
            lists={lists}
            activeList={{
              id: activeList.id,
              name: activeList.name,
              itemCount: items.length,
            }}
            onSwitch={handleSwitchList}
            onCreate={handleCreateList}
          />
        ) : (
          <span className="text-[16px] font-medium text-[#111] dark:text-[#e0e0e0]">
            {/* {""} Placeholder for Recipe collections */}
          </span>
        )}
        {activeTab === "grocery" && activeList && (
          <ListOptionsMenu
            hasCompleted={checked.length > 0}
            onClearCompleted={handleClearCompleted}
            onClearAll={handleClearAll}
            onDeleteList={handleDeleteList}
          />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#ebebeb] dark:border-[#2e3538] px-4 gap-6 flex-shrink-0">
        {(["grocery", "recipes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "text-[13px] font-medium pb-2.5 border-b-2 -mb-px transition-colors capitalize",
              activeTab === tab
                ? "text-[#00b89e] border-[#00E5C3]"
                : "text-[#bbb] border-transparent",
            ].join(" ")}
          >
            {tab === "grocery" ? "Grocery list" : "Recipes"}
          </button>
        ))}
      </div>

      {/* Store filter pills */}
      {activeTab === "grocery" && preferredStores.length > 0 && (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none flex-shrink-0">
          {preferredStores.map((store) => {
            const meta = STORE_META[store.chain.toLocaleLowerCase()];
            const isActive = activeChain === store.chain;
            return (
              <button
                key={store.chain}
                onClick={() => setActiveChain(isActive ? null : store.chain)}
                className={[
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium flex-shrink-0 transition-all",
                  isActive
                    ? "bg-[#00E5C3] border-[#00E5C3] text-[#004d40]"
                    : "bg-white dark:bg-[#1e2528] border-[#e0e0e0] dark:border-[#2e3538] text-[#333] dark:text-[#ccc]",
                ].join(" ")}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: meta?.bg, color: meta?.color }}
                >
                  {meta?.letter}
                </span>
                {store.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[220px]">
        {activeTab === "grocery" ? (
          <>
            {/* Active items */}
            {unchecked.map((item) => (
              <ListItemRow
                key={item.id}
                item={item}
                activeChain={activeChain}
                onCheck={handleCheck}
                onEdit={setEditingItem}
                onDelete={handleDelete}
                onQuantityChange={handleQuantityChange}
              />
            ))}

            {/* Add item row */}
            {addingItem ? (
              <div className="relative">
                {/* Suggestions dropdown — above input */}
                {(suggestions.length > 0 || suggestionsLoading) && (
                  <div className="absolute top-full left-0 right-0 mb-1 bg-white dark:bg-[#1e2528] border border-[#e0e0e0] dark:border-[#2e3538] rounded-xl shadow-lg overflow-hidden z-30">
                    {suggestionsLoading ? (
                      <div className="flex flex-col gap-0">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-2.5 animate-pulse"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#f0f0f0] dark:bg-[#242b2e] flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-2.5 w-28 rounded bg-[#f0f0f0] dark:bg-[#242b2e]" />
                              <div className="h-2 w-16 rounded bg-[#f0f0f0] dark:bg-[#242b2e]" />
                            </div>
                            <div className="h-3 w-10 rounded bg-[#f0f0f0] dark:bg-[#242b2e]" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      suggestions.map((s) => (
                        <button
                          key={s.id}
                          onMouseDown={(e) => e.preventDefault()} // prevent input blur before tap
                          onClick={() => handleAddItem(s.id, s.name)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f7f7] dark:hover:bg-[#242b2e] transition-colors border-b border-[#f5f5f5] dark:border-[#1e2528] last:border-0"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#f7f7f7] dark:bg-[#242b2e] flex items-center justify-center text-[16px] flex-shrink-0">
                            🛒
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-[13px] font-medium text-[#111] dark:text-[#e0e0e0] truncate">
                              {s.name}
                            </p>
                            <p className="text-[11px] text-[#aaa] truncate">
                              {[s.brand, s.category?.replace(/_/g, " ")]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          </div>
                          {s.bestPrice !== null && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-[12px] font-medium text-[#00b89e]">
                                ${s.bestPrice.toFixed(2)}
                              </p>
                              {s.bestStore && (
                                <p className="text-[10px] text-[#aaa] capitalize">
                                  {s.bestStore}
                                </p>
                              )}
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Input row */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5] dark:border-[#1e2528]">
                  <div className="w-[22px] h-[22px] rounded-full border border-dashed border-[#ccc] dark:border-[#444] flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search or type item name..."
                    value={newItemName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewItemName(val);
                      clearTimeout(searchDebounceRef.current);
                      if (!val.trim()) {
                        setSuggestions([]);
                        return;
                      }
                      searchDebounceRef.current = setTimeout(
                        () => fetchSuggestions(val),
                        350,
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem();
                      if (e.key === "Escape") {
                        setAddingItem(false);
                        setNewItemName("");
                        setSuggestions([]);
                      }
                    }}
                    onBlur={() => {
                      // Delay clearing so tap on suggestion registers first
                      setTimeout(() => setSuggestions([]), 150);
                    }}
                    className="flex-1 text-[13px] bg-transparent text-[#111] dark:text-[#e0e0e0] placeholder-[#bbb] outline-none"
                  />
                  <button
                    onClick={() => handleAddItem()}
                    className="text-[12px] font-medium text-[#00b89e]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setAddingItem(false);
                      setNewItemName("");
                      setSuggestions([]);
                    }}
                    className="text-[12px] text-[#aaa]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNewItemName("");
                  setAddingItem(true);
                }}
                className="flex items-center gap-3 px-4 py-3 w-full text-left border-b border-[#f5f5f5] dark:border-[#1e2528]"
              >
                <div className="w-[22px] h-[22px] rounded-full border border-dashed border-[#ccc] dark:border-[#444] flex items-center justify-center flex-shrink-0">
                  <Plus size={11} className="text-[#ccc] dark:text-[#444]" />
                </div>
                <span className="text-[13px] text-[#ccc] dark:text-[#444]">
                  Add item
                </span>
              </button>
            )}

            {/* Checked items */}
            {checked.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 py-2">
                  <p className="text-[10px] font-medium text-[#ccc] dark:text-[#444] uppercase tracking-[0.8px]">
                    Completed
                  </p>
                  <button
                    onClick={handleClearCompleted}
                    className="text-[11px] font-medium text-[#ef4444]"
                  >
                    Clear all
                  </button>
                </div>
                {checked.map((item) => (
                  <ListItemRow
                    key={item.id}
                    item={item}
                    activeChain={activeChain}
                    onCheck={handleCheck}
                    onEdit={setEditingItem}
                    onDelete={handleDelete}
                    onQuantityChange={handleQuantityChange}
                  />
                ))}
              </>
            )}

            {/* Empty state */}
            {items.length === 0 && !addingItem && (
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="w-14 h-14 rounded-[18px] bg-[#f0fdf9] dark:bg-[#1a2e2a] flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="3"
                      width="16"
                      height="18"
                      rx="2"
                      stroke="#00b89e"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 8H16M8 12H16M8 16H12"
                      stroke="#00b89e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-2">
                  Your list is empty
                </p>
                <p className="text-[13px] text-[#aaa] leading-relaxed mb-6">
                  Start adding items and we'll find the best prices across your
                  stores.
                </p>
                <button
                  onClick={() => setAddingItem(true)}
                  className="px-5 py-2.5 bg-[#00E5C3] rounded-xl text-[13px] font-medium text-[#004d40]"
                >
                  Add first item
                </button>
              </div>
            )}
          </>
        ) : (
          /* Recipes tab */
          <div className="pt-3">
            {recipes.length === 0 ? (
              <div className="flex flex-col items-center py-16 px-8 text-center">
                <div className="w-14 h-14 rounded-[18px] bg-[#f0fdf9] dark:bg-[#1a2e2a] flex items-center justify-center mb-4">
                  <ChefHat
                    size={24}
                    className="text-[#00b89e]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0] mb-2">
                  No recipes yet
                </p>
                <p className="text-[13px] text-[#aaa] leading-relaxed mb-6">
                  Browse recipes and save ones you like. Add their ingredients
                  straight to this list.
                </p>
                <Link
                  href="/recipes"
                  className="px-5 py-2.5 bg-[#00E5C3] rounded-xl text-[13px] font-medium text-[#004d40]"
                >
                  Browse recipes
                </Link>
              </div>
            ) : (
              recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  currentUserId={currentUserId}
                  onAddToList={handleAddRecipeToList}
                  onDeleted={(id) =>
                    setRecipes((prev) => prev.filter((r) => r.id !== id))
                  }
                />
              ))
            )}
            <RecipeFAB />
          </div>
        )}
      </div>

      {/* Bottom panel — store totals + optimize */}
      {activeTab === "grocery" && unchecked.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white dark:bg-[#161b1e] border-t border-[#ebebeb] dark:border-[#2e3538] px-4 pt-3 pb-[40px] z-10">
          {/* Store total cards */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none mb-3">
            {Object.entries(storeTotals)
              .filter(([, t]) => t > 0)
              .sort((a, b) => a[1] - b[1])
              .map(([chain, total], i) => {
                const meta = STORE_META[chain.toLowerCase()];
                const isBest = i === 0;
                const isActive = chain === activeChain;
                return (
                  <button
                    key={chain}
                    onClick={() => setActiveChain(isActive ? null : chain)}
                    className={[
                      "flex-shrink-0 rounded-[10px] px-3 py-2 text-center border min-w-[70px] transition-all",
                      isActive
                        ? "bg-[#f0fdf9] dark:bg-[#1a2e2a] border-[#b2f0e4] dark:border-[#1e4a3a]"
                        : isBest
                          ? "border-[#00E5C3] bg-[#f7f7f7] dark:bg-[#1e2528]"
                          : "border-[#ebebeb] dark:border-[#2e3538] bg-[#f7f7f7] dark:bg-[#1e2528]",
                    ].join(" ")}
                  >
                    <p className="text-[10px] text-[#888] dark:text-[#555] mb-0.5 capitalize">
                      {chain}
                    </p>
                    <p className="text-[13px] font-medium text-[#111] dark:text-[#e0e0e0]">
                      ${total.toFixed(2)}
                    </p>
                    {isBest && (
                      <span className="text-[9px] bg-[#00E5C3] text-[#004d40] rounded px-1 py-px">
                        Best
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {/* Subtotal + optimize */}
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[12px] text-[#aaa]">
              Subtotal · {unchecked.length} items
            </span>
            <span className="text-[20px] font-medium text-[#111] dark:text-[#e0e0e0]">
              ${(activeTotal ?? sortedTotals[0]?.[1] ?? 0).toFixed(2)}
            </span>
          </div>

          {/* <button
            onClick={handleOptimize}
            disabled={optimizing || !bestStoreChain}
            className="w-full py-2.5 bg-[#f0fdf9] dark:bg-[#1a2e2a] border border-[#b2f0e4] dark:border-[#1e4a3a] rounded-[10px] text-[12px] font-medium text-[#0a7a62] dark:text-[#6ee7c7] disabled:opacity-50"
          >
            {optimizing ? "Optimizing…" : "Optimize for cheapest"}
          </button> */}
        </div>
      )}

      {/* Edit sheet */}
      {editingItem && (
        <EditItemSheet
          item={{
            ...editingItem,
            customPrice: editingItem.customPrice,
            product: editingItem.product
              ? {
                  ...editingItem.product,
                  unitMeasure: editingItem.product.unitMeasure ?? null,
                  unitQuantity: editingItem.product.unitQuantity
                    ? Number(editingItem.product.unitQuantity)
                    : null,
                  bestPrice: getBestPrice(editingItem.product)?.price ?? null,
                  bestStore: getBestPrice(editingItem.product)?.chain ?? null,
                }
              : null,
          }}
          onSave={handleSaveEdit}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
