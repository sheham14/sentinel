"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";

type List = {
  id: string;
  name: string;
  itemCount: number;
};

type IngredientItem = {
  id: string;
  name: string;
  productId?: string | null;
  quantity?: number | null;
  unit?: string | null;
};

type SingleModeProps = {
  mode?: "single";
  productId: string;
  productName: string;
  ingredients?: never;
  onClose: () => void;
};

type RecipeModeProps = {
  mode: "recipe";
  ingredients: IngredientItem[];
  productId?: never;
  productName?: never;
  onClose: () => void;
};

type Props = SingleModeProps | RecipeModeProps;

export default function AddToListSheet(props: Props) {
  const { onClose } = props;
  const isRecipeMode = props.mode === "recipe";

  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    fetch("/api/lists")
      .then((r) => r.json())
      .then((data) => {
        setLists(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAddToList(listId: string) {
    if (addedTo.has(listId) || isPending) return;
    setIsPending(true);

    try {
      if (isRecipeMode) {
        // Add all selected ingredients in parallel
        await Promise.all(
          props.ingredients.map((ing) =>
            fetch(`/api/lists/${listId}/items`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                ing.productId
                  ? { productId: ing.productId, quantity: ing.quantity ?? 1 }
                  : { name: ing.name, quantity: ing.quantity, unit: ing.unit },
              ),
            }),
          ),
        );
        setAddedTo((prev) => new Set([...prev, listId]));
        // Close after brief confirmation in recipe mode
        setTimeout(onClose, 700);
      } else {
        // Single product mode — unchanged behaviour
        const res = await fetch(`/api/lists/${listId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: props.productId, quantity: 1 }),
        });
        if (res.ok) {
          setAddedTo((prev) => new Set([...prev, listId]));
        }
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleCreateList() {
    if (!newListName.trim() || isPending) return;
    setIsPending(true);
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim() }),
      });
      if (res.ok) {
        const newList = await res.json();
        setLists((prev) => [...prev, newList]);
        setNewListName("");
        setCreating(false);
        handleAddToList(newList.id);
      }
    } finally {
      setIsPending(false);
    }
  }

  const headerSubtitle = isRecipeMode
    ? `${props.ingredients.length} ingredient${props.ingredients.length !== 1 ? "s" : ""}`
    : props.productName;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-20" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white dark:bg-[#1e2528] rounded-t-[24px] z-30 pb-8">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#e0e0e0] dark:bg-[#2e3538]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0f0] dark:border-[#2e3538]">
          <div>
            <p className="text-[15px] font-medium text-[#111] dark:text-[#e0e0e0]">
              Add to list
            </p>
            <p className="text-[12px] text-[#aaa] truncate max-w-[240px]">
              {headerSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f4f4] dark:bg-[#242b2e] flex items-center justify-center"
          >
            <X size={14} className="text-[#888]" />
          </button>
        </div>

        {/* Lists */}
        <div className="px-5 pt-3 max-h-[40vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-2 py-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[52px] rounded-xl bg-[#f4f4f4] dark:bg-[#242b2e] animate-pulse"
                />
              ))}
            </div>
          ) : lists.length === 0 ? (
            <p className="text-[13px] text-[#aaa] text-center py-6">
              No lists yet. Create one below.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lists.map((list) => {
                const added = addedTo.has(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleAddToList(list.id)}
                    disabled={isPending}
                    className={[
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                      added
                        ? "border-[#00E5C3] bg-[#f0fdf9] dark:bg-[#1a2e2a]"
                        : "border-[#e0e0e0] dark:border-[#2e3538] bg-white dark:bg-[#242b2e]",
                    ].join(" ")}
                  >
                    <div className="text-left">
                      <p className="text-[13px] font-medium text-[#111] dark:text-[#e0e0e0]">
                        {list.name}
                      </p>
                      <p className="text-[11px] text-[#aaa]">
                        {list.itemCount}{" "}
                        {list.itemCount === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <div
                      className={[
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                        added
                          ? "bg-[#00E5C3]"
                          : "border border-[#e0e0e0] dark:border-[#2e3538]",
                      ].join(" ")}
                    >
                      {added && (
                        <Check
                          size={12}
                          className="text-[#004d40]"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new list */}
        <div className="px-5 pt-3">
          {creating ? (
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[#e0e0e0] dark:border-[#2e3538] bg-white dark:bg-[#242b2e] text-[13px] text-[#111] dark:text-[#e0e0e0] placeholder-[#bbb] outline-none focus:border-[#00E5C3]"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim() || isPending}
                className="px-4 py-2.5 bg-[#00E5C3] rounded-xl text-[13px] font-medium text-[#004d40] disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setCreating(false);
                  setNewListName("");
                }}
                className="px-3 py-2.5 rounded-xl border border-[#e0e0e0] dark:border-[#2e3538] text-[13px] text-[#888]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#e0e0e0] dark:border-[#2e3538] text-[13px] text-[#aaa] hover:border-[#00E5C3] hover:text-[#00b89e] transition-colors"
            >
              <Plus size={14} />
              New list
            </button>
          )}
        </div>
      </div>
    </>
  );
}
