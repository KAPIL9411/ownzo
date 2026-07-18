// Route-level loading skeleton for /listings
// Next.js streams this instantly while the page data loads

export default function ListingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-36 bg-gray-100 rounded-lg mb-2" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-100 rounded-full" />
          <div className="h-8 w-28 bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Search skeleton */}
      <div className="h-11 bg-gray-100 rounded-full w-full" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
            <div className="bg-gray-100" style={{ aspectRatio: '1/1' }} />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="flex justify-between mt-2">
                <div className="h-5 bg-gray-100 rounded w-1/3" />
                <div className="h-9 w-9 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
