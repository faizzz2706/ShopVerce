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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:border-primary-100 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-primary-950"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute right-2.5 top-2.5 rounded-full bg-white/95 p-2 shadow-md hover:bg-white dark:bg-gray-900/95 transition-all duration-300 hover:scale-110 active:scale-95 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
        >
          <Heart className="h-4 w-4 fill-none hover:fill-current" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{product.category?.name}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">{product.name}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500">
          <Star className="h-3 w-3 fill-current" />
          <span className="font-semibold">{product.averageRating?.toFixed(1)}</span>
          <span className="text-gray-400 dark:text-gray-500">({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <span className="text-lg font-bold text-gray-950 dark:text-gray-50">₹{Number(product.price).toLocaleString()}</span>
            {product.comparePrice && (
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 line-through">
                ₹{Number(product.comparePrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full rounded-lg bg-primary-600 py-2.5 text-xs font-medium text-white shadow-sm hover:shadow-md hover:bg-primary-700 transition-all duration-200 transform active:scale-[0.98] sm:text-sm"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
