import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { wishlistApi } from "../api";
import toast from "react-hot-toast";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistApi.list().then((r) => {
      setItems(r.data.data);
      setLoading(false);
    });
  }, []);

  const remove = async (productId) => {
    await wishlistApi.remove(productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    toast.success("Removed from wishlist");
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      <h1 className="text-xl font-bold sm:text-2xl">My Wishlist</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900"
          >
            <Link to={`/product/${item.product.slug}`}>
              <img
                src={item.product.images?.[0]?.url}
                alt={item.product.name}
                className="aspect-square w-full object-cover"
              />
            </Link>
            <div className="p-3">
              <Link
                to={`/product/${item.product.slug}`}
                className="line-clamp-2 text-sm font-medium hover:text-primary-600"
              >
                {item.product.name}
              </Link>
              <p className="mt-1 font-bold">
                ₹{Number(item.product.price).toLocaleString()}
              </p>
              <button
                onClick={() => remove(item.productId)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-12 text-center text-gray-500">Your wishlist is empty</p>
      )}
    </div>
  );
}
