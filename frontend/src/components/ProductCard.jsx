import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { wishlistApi } from "../api";
import { addToCart } from "../store/cartSlice";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const image = product.images?.[0]?.url;
  const discount = product.comparePrice
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await dispatch(addToCart({ productId: product.id })).unwrap();
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first");
      return;
    }
    try {
      await wishlistApi.add(product.id);
      toast.success("Added to wishlist");
    } catch {
      toast.error("Could not add to wishlist");
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow hover:bg-white dark:bg-gray-900/90"
        >
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium">{product.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
          <Star className="h-3 w-3 fill-current" />
          <span>{product.averageRating?.toFixed(1)}</span>
          <span className="text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold">₹{Number(product.price).toLocaleString()}</span>
            {product.comparePrice && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ₹{Number(product.comparePrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full rounded-lg bg-primary-600 py-2.5 text-xs font-medium text-white hover:bg-primary-700 sm:text-sm"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
