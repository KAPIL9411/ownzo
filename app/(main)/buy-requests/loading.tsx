export default function BuyRequestsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 bg-gray-100 rounded-lg" />
        <div className="h-9 w-32 bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
            <div className="h-5 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="flex justify-between pt-2">
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
              <div className="h-8 w-24 bg-gray-100 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
