import { useEffect, useState } from "react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const load = () => adminApi.reviews({ approved: "false" }).then((r) => setReviews(r.data.data));

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await adminApi.approveReview(id);
    toast.success("Review approved");
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Reviews (Pending)</h1>
      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border p-4 dark:border-gray-800">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{r.product?.name}</p>
                <p className="text-sm text-gray-500">by {r.user?.email}</p>
                <p className="mt-2">{r.comment}</p>
                <p className="text-amber-500">{"★".repeat(r.rating)}</p>
              </div>
              <button
                onClick={() => approve(r.id)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-gray-500">No pending reviews</p>
        )}
      </div>
    </div>
  );
}
