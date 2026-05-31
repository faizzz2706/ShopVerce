import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-900 text-gray-300 dark:border-gray-800">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-3 py-8 sm:gap-8 sm:px-4 sm:py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-lg font-bold text-white sm:text-xl">ShopVerse</h3>
          <p className="mt-2 text-sm">
            Your one-stop destination for everything you need. Fast delivery, great prices.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary-500">All Products</Link></li>
            <li><Link to="/shop?featured=true" className="hover:text-primary-500">Featured</Link></li>
            <li><Link to="/shop?bestSeller=true" className="hover:text-primary-500">Best Sellers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Account</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/profile" className="hover:text-primary-500">Profile</Link></li>
            <li><Link to="/orders" className="hover:text-primary-500">Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-primary-500">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Support</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Email: support@shopverse.com</li>
            <li>Phone: 1800-SHOP-NOW</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm">
        © {new Date().getFullYear()} ShopVerse. All rights reserved.
      </div>
    </footer>
  );
}
