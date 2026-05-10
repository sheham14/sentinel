"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Utensils,
  Bell,
  Refrigerator,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home, exact: true },
  { href: "/lists", label: "Lists", Icon: ClipboardList, exact: false },
  { href: "/pantry", label: "Pantry", Icon: Refrigerator, exact: false },
  { href: "/recipes", label: "Recipes", Icon: Utensils, exact: false },
  {
    href: "/alerts",
    label: "Alerts",
    Icon: Bell,
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
              <Icon size={22} strokeWidth={1.5} />
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
