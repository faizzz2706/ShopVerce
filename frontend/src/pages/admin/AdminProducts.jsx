import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";
import ProductFormModal from "../../components/admin/ProductFormModal";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    adminApi.products({ search, limit: 100 }).then((r) => setProducts(r.data.data));
  };

  useEffect(() => {
    load();
  }, [search]);

  const openCreate = () => {
    setModalProduct(null);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setModalProduct(product);
    setShowModal(true);
  };

  const updateStock = async (id, stock) => {
    await adminApi.updateInventory(id, parseInt(stock, 10));
    toast.success("Stock updated");
    load();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product? It will be hidden from the store.")) return;
    await adminApi.deleteProduct(id);
    toast.success("Product deleted");
    load();
  };

  const handleSaved = () => {
    toast.success(modalProduct ? "Product updated" : "Product created");
    load();
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Products</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border px-3 py-2.5 text-sm sm:w-auto dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 space-y-3 md:hidden">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex gap-3">
              <img
                src={p.images?.[0]?.url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium line-clamp-2">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category?.name}</p>
                <p className="mt-1 font-bold">₹{Number(p.price).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm">
                Stock
                <input
                  type="number"
                  defaultValue={p.stock}
                  onBlur={(e) => {
                    if (parseInt(e.target.value, 10) !== p.stock) {
                      updateStock(p.id, e.target.value);
                    }
                  }}
                  className="w-16 rounded border px-2 py-1 text-center dark:border-gray-700 dark:bg-gray-800"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  className="rounded-lg border px-3 py-1.5 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteProduct(p.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="py-8 text-center text-gray-500">No products found</p>
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-xl border md:block dark:border-gray-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th>Category</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Flags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t dark:border-gray-800">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images?.[0]?.url}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <p className="max-w-[200px] line-clamp-1 text-xs text-gray-500">
                        {p.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-center text-xs">
                  {p.category?.name}
                  {p.subCategory && (
                    <span className="block text-gray-500">{p.subCategory.name}</span>
                  )}
                </td>
                <td className="text-center font-mono text-xs">{p.sku}</td>
                <td className="text-center">₹{Number(p.price).toLocaleString()}</td>
                <td className="text-center">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    onBlur={(e) => {
                      if (parseInt(e.target.value, 10) !== p.stock) {
                        updateStock(p.id, e.target.value);
                      }
                    }}
                    className="w-16 rounded border px-2 py-1 text-center dark:border-gray-700 dark:bg-gray-800"
                  />
                </td>
                <td className="text-center">
                  <div className="flex flex-wrap justify-center gap-1">
                    {p.featured && (
                      <Badge label="Featured" color="bg-amber-100 text-amber-800" />
                    )}
                    {p.bestSeller && (
                      <Badge label="Best" color="bg-blue-100 text-blue-800" />
                    )}
                    {p.newArrival && (
                      <Badge label="New" color="bg-green-100 text-green-800" />
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id)}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-gray-500">No products found</p>
        )}
      </div>

      {showModal && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
      {label}
    </span>
  );
}
