import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    adminApi.banners().then((r) => setBanners(r.data.data));
  }, []);

  const create = async () => {
    await adminApi.createBanner({
      title: "New Banner",
      subtitle: "Shop now",
      imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
      link: "/shop",
      position: "hero",
      active: true,
      sortOrder: banners.length + 1,
    });
    toast.success("Banner created");
    adminApi.banners().then((r) => setBanners(r.data.data));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <button onClick={create} className="rounded-lg bg-primary-600 px-4 py-2 text-white">
          Add Banner
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <div key={b.id} className="overflow-hidden rounded-xl border dark:border-gray-800">
            <img src={b.imageUrl} alt={b.title} className="h-32 w-full object-cover" />
            <div className="p-4">
              <p className="font-medium">{b.title}</p>
              <p className="text-sm text-gray-500">{b.subtitle}</p>
              <p className="text-xs text-gray-400">
                {b.position} | {b.active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
