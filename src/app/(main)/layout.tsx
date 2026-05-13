import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import BottomNav from "@/components/layout/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, headersList] = await Promise.all([auth(), headers()]);
  const pathname = headersList.get("x-pathname") ?? "";

  if (session?.user && !session.user.onboardingCompleted && pathname !== "/onboarding") {
    redirect("/onboarding");
  }

  if (session?.user && session.user.onboardingCompleted && pathname === "/onboarding") {
    redirect("/");
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0f1416] max-w-sm mx-auto">
      <main className="pb-[72px]">{children}</main>
      <BottomNav />
    </div>
  );
}