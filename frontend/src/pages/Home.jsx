import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, bannerApi, categoryApi } from "../api";
import ProductCard from "../components/ProductCard";
import { PageSkeleton } from "../components/Skeleton";
import { ChevronRight, Zap, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bannerApi.list({ position: "hero" }),
      productApi.featured(),
      productApi.bestSellers(),
      productApi.newArrivals(),
      categoryApi.list(),
    ])
      .then(([b, f, bs, na, c]) => {
        setBanners(b.data.data);
        setFeatured(f.data.data);
        setBestSellers(bs.data.data);
        setNewArrivals(na.data.data);
        setCategories(c.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Hero banners */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {banners.slice(0, 2).map((banner) => (
          <Link
            key={banner.id}
            to={banner.link || "/shop"}
            className="group relative overflow-hidden rounded-2xl"
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="h-40 w-full object-cover transition group-hover:scale-105 sm:h-48 md:h-64"
            />
            <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-black/70 to-transparent p-4 sm:p-6">
              <h2 className="text-lg font-bold text-white sm:text-2xl md:text-3xl">{banner.title}</h2>
              <p className="text-sm text-white/80 sm:text-base">{banner.subtitle}</p>
              <span className="mt-3 inline-flex items-center text-sm font-medium text-primary-300">
                Shop Now <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Categories */}
      <section className="mt-8 sm:mt-10">
        <h2 className="text-lg font-bold sm:text-xl">Shop by Category</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3 md:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary-500 hover:shadow dark:border-gray-800 dark:bg-gray-900"
            >
              {cat.image && (
                <img src={cat.image} alt={cat.name} className="h-12 w-12 rounded-full object-cover" />
              )}
              <span className="mt-2 text-center text-xs font-medium sm:text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection icon={Sparkles} title="Featured Products" products={featured} link="/shop?featured=true" />
      <ProductSection icon={TrendingUp} title="Best Sellers" products={bestSellers} link="/shop?bestSeller=true" />
      <ProductSection icon={Zap} title="New Arrivals" products={newArrivals} link="/shop?newArrival=true" />
    </div>
  );
}

function ProductSection({ icon: Icon, title, products, link }) {
  return (
    <section className="mt-8 sm:mt-12">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
          <Icon className="h-5 w-5 text-primary-600" />
          {title}
        </h2>
        <Link to={link} className="text-sm font-medium text-primary-600 hover:underline">
          View All
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
