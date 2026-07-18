export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-2xl border border-gray-100 animate-pulse">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="h-10 bg-gray-100 rounded-full" />
        </div>
        <div className="flex-1 divide-y divide-gray-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="h-11 w-11 bg-gray-100 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 border-b border-gray-100 flex items-center px-6 gap-3">
          <div className="h-9 w-9 bg-gray-100 rounded-full" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="flex-1" />
        <div className="p-4 border-t border-gray-100">
          <div className="h-12 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  )
}
