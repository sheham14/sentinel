import Link from "next/link";
import { BarChart2, Bell, ChefHat } from "lucide-react";

function SentinelIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <path
        d="M19 3C11.8 3 6 8.8 6 16C6 23.5 19 37 19 37C19 37 32 23.5 32 16C32 8.8 26.2 3 19 3Z"
        stroke="#004d40"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="16" r="5" stroke="#004d40" strokeWidth="2" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: BarChart2,
    title: "Compare prices across stores",
    sub: "Walmart, Loblaws, Metro, Sobeys and more",
  },
  {
    icon: Bell,
    title: "Get notified when prices drop",
    sub: "Never miss a deal on products you buy",
  },
  {
    icon: ChefHat,
    title: "AI-powered meal planning",
    sub: "Recipes based on your budget and pantry",
  },
];

// This is a server component — no 'use client' needed
export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1416] flex flex-col max-w-sm mx-auto px-7">
      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-[28px] bg-[#00E5C3] flex items-center justify-center mb-7 shadow-[0_4px_32px_rgba(0,229,195,0.3)]">
          <SentinelIcon />
        </div>

        <h1 className="text-[26px] font-medium text-[#111] dark:text-[#e8e8e8] text-center leading-snug mb-3">
          Your everyday grocery planner
        </h1>
        <p className="text-[15px] text-[#888] text-center leading-relaxed mb-10 max-w-[260px]">
          Compare prices, track deals, and plan meals — all in one place.
        </p>

        {/* Features */}
        <div className="w-full flex flex-col gap-4 mb-10">
          {FEATURES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="w-[38px] h-[38px] rounded-xl bg-[#f0fdf9] dark:bg-[#1a2e2a] flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-[#00b89e]" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[#111] dark:text-[#e0e0e0] mb-0.5">
                  {title}
                </p>
                <p className="text-[12px] text-[#aaa]">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="pb-10 flex-shrink-0 flex flex-col gap-3">
        <Link
          href="/signin"
          className="w-full py-[14px] bg-[#00E5C3] rounded-[14px] text-[15px] font-medium text-[#004d40] text-center active:scale-[0.98] transition-all block"
        >
          Get started
        </Link>
        <Link
          href="/signin"
          className="w-full py-[10px] text-[13px] text-[#aaa] text-center hover:text-[#666] dark:hover:text-[#ccc] transition-colors"
        >
          Already have an account?{" "}
          <span className="text-[#00b89e]">Sign in</span>
        </Link>
      </div>
    </div>
  );
}
