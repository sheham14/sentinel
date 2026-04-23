"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, CheckSquare, List } from "lucide-react";

type Props = {
  hasCompleted: boolean;
  onClearCompleted: () => void;
  onClearAll: () => void;
  onDeleteList: () => void;
};

export default function ListOptionsMenu({
  hasCompleted,
  onClearCompleted,
  onClearAll,
  onDeleteList,
}: Props) {
  const [open, setOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmClearAll(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleClearCompleted() {
    onClearCompleted();
    setOpen(false);
  }

  function handleClearAll() {
    if (!confirmClearAll) {
      setConfirmClearAll(true);
      return;
    }
    onClearAll();
    setOpen(false);
    setConfirmClearAll(false);
  }

  function handleDeleteList() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDeleteList();
    setOpen(false);
    setConfirmDelete(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          setConfirmClearAll(false);
          setConfirmDelete(false);
        }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-[#aaa] dark:text-[#555] hover:bg-[#f4f4f4] dark:hover:bg-[#1e2528] transition-colors"
      >
        <MoreVertical size={16} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute top-9 right-0 w-[200px] bg-white dark:bg-[#1e2528] border border-[#e0e0e0] dark:border-[#2e3538] rounded-2xl shadow-lg z-20 overflow-hidden py-1">
          {/* Clear completed */}
          {hasCompleted && (
            <button
              onClick={handleClearCompleted}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f7f7] dark:hover:bg-[#242b2e] transition-colors"
            >
              <CheckSquare
                size={14}
                className="text-[#aaa] flex-shrink-0"
                strokeWidth={1.5}
              />
              <span className="text-[13px] text-[#333] dark:text-[#ccc]">
                Clear completed
              </span>
            </button>
          )}

          {/* Clear whole list */}
          <button
            onClick={handleClearAll}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f7f7] dark:hover:bg-[#242b2e] transition-colors"
          >
            <List
              size={14}
              className={[
                "flex-shrink-0",
                confirmClearAll ? "text-[#f59e0b]" : "text-[#aaa]",
              ].join(" ")}
              strokeWidth={1.5}
            />
            <span
              className={[
                "text-[13px]",
                confirmClearAll
                  ? "text-[#f59e0b] font-medium"
                  : "text-[#333] dark:text-[#ccc]",
              ].join(" ")}
            >
              {confirmClearAll ? "Tap again to confirm" : "Clear whole list"}
            </span>
          </button>

          <div className="border-t border-[#f0f0f0] dark:border-[#2e3538] my-1" />

          {/* Delete list */}
          <button
            onClick={handleDeleteList}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fef2f2] dark:hover:bg-[#2e1a1a] transition-colors"
          >
            <Trash2
              size={14}
              className={[
                "flex-shrink-0",
                confirmDelete ? "text-[#ef4444]" : "text-[#ef4444] opacity-60",
              ].join(" ")}
              strokeWidth={1.5}
            />
            <span
              className={[
                "text-[13px]",
                confirmDelete
                  ? "text-[#ef4444] font-medium"
                  : "text-[#ef4444] opacity-60",
              ].join(" ")}
            >
              {confirmDelete ? "Tap again to confirm" : "Delete list"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
