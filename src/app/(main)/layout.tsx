import { auth } from "../../../auth";
import BottomNav from "@/components/layout/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // TODO: fetch real unread alert count from DB
  const hasUnreadAlerts = !!session?.user;

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0f1416] max-w-sm mx-auto">
      <main className="pb-[72px]">{children}</main>

      <BottomNav hasUnreadAlerts={hasUnreadAlerts} />
    </div>
  );
}

//   <div className="fixed bottom-[120px] left-1/2 -translate-x-1/2 w-full max-w-sm pointer-events-none px-4 pb-safe">
//     <div className="relative w-full">
//       <Link
//         href="/recipes/ask"
//         className="absolute right-0 w-[52px] h-[52px] rounded-[18px] bg-[#00E5C3] flex items-center justify-center shadow-[0_4px_16px_rgba(0,229,195,0.4)] active:scale-95 transition-transform pointer-events-auto"
//       >
//         <ChefHat size={24} strokeWidth={1.5} className="text-[#004d40]" />
//       </Link>
//     </div>
//   </div>
