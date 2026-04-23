export default function HomePageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Top bar */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-[34px] h-[34px] rounded-full bg-[#f0f0f0] dark:bg-[#242b2e] flex-shrink-0" />
        <div className="flex-1 h-[38px] rounded-xl bg-[#f0f0f0] dark:bg-[#242b2e]" />
      </div>

      {/* Store pills */}
      <div className="flex gap-2 px-4 pb-3 overflow-hidden">
        {[80, 72, 64, 76, 88].map((w, i) => (
          <div
            key={i}
            className="h-[32px] rounded-full bg-[#f0f0f0] dark:bg-[#242b2e] flex-shrink-0"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Savings banner */}
      <div className="mx-4 mb-4 h-[44px] rounded-[14px] bg-[#f0f0f0] dark:bg-[#242b2e]" />

      {/* Section label */}
      <div className="mx-4 mb-2 h-3 w-24 rounded bg-[#f0f0f0] dark:bg-[#242b2e]" />

      {/* Product cards */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="mx-4 mb-2.5 rounded-[14px] border border-[#ebebeb] dark:border-[#2e3538] p-3 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-[10px] bg-[#f0f0f0] dark:bg-[#242b2e] flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-32 rounded bg-[#f0f0f0] dark:bg-[#242b2e]" />
            <div className="h-2.5 w-20 rounded bg-[#f0f0f0] dark:bg-[#242b2e]" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-4 w-12 rounded bg-[#f0f0f0] dark:bg-[#242b2e] ml-auto" />
            <div className="h-2.5 w-16 rounded bg-[#f0f0f0] dark:bg-[#242b2e] ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
