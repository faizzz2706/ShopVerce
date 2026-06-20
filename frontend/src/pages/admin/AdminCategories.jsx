import { useEffect, useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { adminApi } from "../../api";
import toast from "react-hot-toast";

const emptyCategoryForm = { name: "", description: "" };
const emptySubForm = { categoryId: "", name: "", description: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [subForm, setSubForm] = useState(emptySubForm);
  const [loading, setLoading] = useState(true);

  const load = () =>
    adminApi
      .categories()
      .then((r) => setCategories(r.data.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createCategory(categoryForm);
      toast.success("Category created");
      setCategoryForm(emptyCategoryForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  };

  const createSubCategory = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createSubCategory(subForm);
      toast.success("Subcategory created");
      setSubForm({ ...emptySubForm, categoryId: subForm.categoryId });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create subcategory");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold sm:text-2xl">Categories</h1>
      <p className="mt-1 text-sm text-gray-500">
        Organize products with categories and subcategories.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={createCategory}
          className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Add category
          </h2>
          <div className="mt-4 space-y-3">
            <Field label="Name" required>
              <input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Electronics"
                className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, description: e.target.value })
                }
                placeholder="Optional description"
                rows={2}
                className="w-full resize-none rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </Field>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Create category
            </button>
          </div>
        </form>

        <form
          onSubmit={createSubCategory}
          className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" />
            Add subcategory
          </h2>
          <div className="mt-4 space-y-3">
            <Field label="Parent category" required>
              <select
                value={subForm.categoryId}
                onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Name" required>
              <input
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                placeholder="e.g. Smartphones"
                className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                required
              />
            </Field>
            <Field label="Description">
              <textarea
                value={subForm.description}
                onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
                className="w-full resize-none rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </Field>
            <button
              type="submit"
              disabled={!subForm.categoryId}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Create subcategory
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 rounded-xl border bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b px-4 py-3 dark:border-gray-800">
          <h2 className="flex items-center gap-2 font-semibold">
            <FolderTree className="h-4 w-4" />
            All categories ({categories.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No categories yet. Create one above.</p>
        ) : (
          <ul className="divide-y dark:divide-gray-800">
            {categories.map((cat) => (
              <li key={cat.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-500">/{cat.slug}</p>
                    {cat.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                    {cat.subCategories?.length || 0} subcategories
                  </span>
                </div>
                {cat.subCategories?.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {cat.subCategories.map((sub) => (
                      <li
                        key={sub.id}
                        className="rounded-lg border px-2.5 py-1 text-sm dark:border-gray-700"
                      >
                        {sub.name}
                        <span className="ml-1 text-xs text-gray-500">/{sub.slug}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
