export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-4 h-8 w-full rounded bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6 p-4">
      <div className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
