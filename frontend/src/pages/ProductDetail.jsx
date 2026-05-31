import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Star, Minus, Plus, Truck, Shield } from "lucide-react";
import { productApi, reviewApi } from "../api";
import { addToCart } from "../store/cartSlice";
import ProductCard from "../components/ProductCard";
import { PageSkeleton } from "../components/Skeleton";

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .bySlug(slug)
      .then((r) => {
        setData(r.data.data);
        return reviewApi.byProduct(r.data.data.product.id);
      })
      .then((r) => setReviews(r.data.data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageSkeleton />;
  if (!data) return <p className="p-8 text-center">Product not found</p>;

  const { product, related } = data;

  const handleAddToCart = async () => {
    if (!user) return toast.error("Please login first");
    await dispatch(addToCart({ productId: product.id, quantity: qty }));
    toast.success("Added to cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
            <img
              src={product.images[selectedImage]?.url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                  selectedImage === i ? "border-primary-600" : "border-transparent"
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-primary-600">
            {product.category?.name} / {product.subCategory?.name}
          </p>
          <h1 className="mt-2 text-xl font-bold sm:text-2xl md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(product.averageRating) ? "fill-current" : ""}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.averageRating?.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
            <span className="text-2xl font-bold sm:text-3xl">₹{Number(product.price).toLocaleString()}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  ₹{Number(product.comparePrice).toLocaleString()}
                </span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700">
                  {Math.round((1 - product.price / product.comparePrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-gray-600 dark:text-gray-400">{product.description}</p>

          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:gap-4">
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4" /> Free delivery above ₹999
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" /> 7-day return
            </span>
          </div>

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-fit items-center rounded-lg border">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              className="flex-1 rounded-lg bg-primary-600 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        <div className="mt-4 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border p-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {r.user.firstName} {r.user.lastName}
                </span>
                <span className="text-amber-500">{"★".repeat(r.rating)}</span>
              </div>
              {r.title && <p className="mt-1 font-medium">{r.title}</p>}
              <p className="mt-1 text-gray-600 dark:text-gray-400">{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </section>

      {/* Related */}
      {related?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Related Products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
