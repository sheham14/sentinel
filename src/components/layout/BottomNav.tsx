"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M3 9.5L11 3L19 9.5V19H14V14H8V19H3V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function ListsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="4"
        y="3"
        width="14"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8H14M8 12H14M8 16H11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PantryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect
        x="4"
        y="8"
        width="14"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 8V6C7 4.3 8.3 3 10 3H12C13.7 3 15 4.3 15 6V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="7"
        y="11"
        width="3"
        height="2.5"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="12"
        y="11"
        width="3"
        height="2.5"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function RecipesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M7 18h8v-5H7v5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 13c0-1.4-1.5-1.8-1.5-3.2C7 8.2 8.8 7 11 7s4 1.2 4 2.8c0 1.4-1.5 1.8-1.5 3.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlertsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 3C8.2 3 6 5.2 6 8V13L4 15H18L16 13V8C16 5.2 13.8 3 11 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 15C9 16.1 9.9 17 11 17C12.1 17 13 16.1 13 15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon, exact: true },
  { href: "/lists", label: "Lists", Icon: ListsIcon, exact: false },
  { href: "/pantry", label: "Pantry", Icon: PantryIcon, exact: false },
  { href: "/recipes", label: "Recipes", Icon: RecipesIcon, exact: false },
  {
    href: "/alerts",
    label: "Alerts",
    Icon: AlertsIcon,
    exact: false,
    hasNotif: true,
  },
];

export default function BottomNav({
  hasUnreadAlerts,
}: {
  hasUnreadAlerts: boolean;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white dark:bg-[#161b1e] border-t border-[#ebebeb] dark:border-[#2e3538] flex items-center justify-around px-2 z-10">
      {NAV_ITEMS.map(({ href, label, Icon, exact, hasNotif }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "flex flex-col items-center gap-[3px] text-[10px] font-medium transition-colors min-w-[52px]",
              active
                ? "text-[#00b89e]"
                : "text-[#bbb] dark:text-[#444] hover:text-[#00b89e] dark:hover:text-[#00b89e]",
            ].join(" ")}
          >
            <div className="relative">
              <Icon active={active} />
              {hasNotif && hasUnreadAlerts && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff5252] border-[1.5px] border-white dark:border-[#161b1e]" />
              )}
            </div>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
