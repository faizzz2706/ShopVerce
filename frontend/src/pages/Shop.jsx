import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi, categoryApi } from "../api";
import ProductCard from "../components/ProductCard";
import { ProductCardSkeleton } from "../components/Skeleton";
import { SlidersHorizontal, X } from "lucide-react";

function FilterPanel({ categories, params, updateFilter, onClose }) {
  return (
    <div className="space-y-4">
      {onClose && (
        <div className="flex items-center justify-between lg:hidden">
          <h3 className="font-semibold">Filters</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      <div className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold">Categories</h3>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm sm:max-h-none">
          <li>
            <button
              type="button"
              onClick={() => {
                updateFilter("category", "");
                onClose?.();
              }}
              className="hover:text-primary-600"
            >
              All
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  updateFilter("category", c.slug);
                  onClose?.();
                }}
                className={`text-left hover:text-primary-600 ${
                  params.category === c.slug ? "font-bold text-primary-600" : ""
                }`}
              >
                {c.name} ({c._count?.products || 0})
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold">Price Range</h3>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full rounded border px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            onChange={(e) => updateFilter("minPrice", e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-full rounded border px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            onChange={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold">Rating</h3>
        {[4, 3].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              updateFilter("rating", r);
              onClose?.();
            }}
            className="mt-2 block w-full py-1 text-left text-sm hover:text-primary-600"
          >
            {r}★ & above
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = Object.fromEntries(searchParams);

  useEffect(() => {
    categoryApi.list().then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({ ...params, page: params.page || 1, limit: 12 })
      .then((r) => {
        setProducts(r.data.data);
        setPagination(r.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Desktop filters */}
        <aside className="hidden w-56 shrink-0 xl:w-64 lg:block">
          <FilterPanel categories={categories} params={params} updateFilter={updateFilter} />
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setFiltersOpen(false)}
              aria-hidden
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-[min(100%,300px)] overflow-y-auto bg-white p-4 shadow-xl lg:hidden dark:bg-gray-900">
              <FilterPanel
                categories={categories}
                params={params}
                updateFilter={updateFilter}
                onClose={() => setFiltersOpen(false)}
              />
            </aside>
          </>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold sm:text-2xl">
              {params.search ? `Results for "${params.search}"` : "All Products"}
            </h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-3 py-2.5 text-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <select
                value={params.sort || "newest"}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2.5 text-sm sm:flex-none sm:min-w-[160px] dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {products.length === 0 && (
                <p className="mt-12 text-center text-gray-500">No products found</p>
              )}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => updateFilter("page", i + 1)}
                      className={`min-h-[2.25rem] min-w-[2.25rem] rounded px-2.5 py-1 text-sm sm:px-3 ${
                        pagination.page === i + 1
                          ? "bg-primary-600 text-white"
                          : "border hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
