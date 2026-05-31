import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { adminApi } from "../../api";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "",
  sku: "",
  categoryId: "",
  subCategoryId: "",
  featured: false,
  bestSeller: false,
  newArrival: false,
  imageUrls: "",
};

export default function ProductFormModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(product?.id);
  const subCategories =
    categories.find((c) => c.id === form.categoryId)?.subCategories || [];

  useEffect(() => {
    adminApi.categories().then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: String(product.price ?? ""),
        comparePrice: product.comparePrice ? String(product.comparePrice) : "",
        stock: String(product.stock ?? ""),
        sku: product.sku || "",
        categoryId: product.categoryId || "",
        subCategoryId: product.subCategoryId || "",
        featured: product.featured || false,
        bestSeller: product.bestSeller || false,
        newArrival: product.newArrival || false,
        imageUrls: (product.images || []).map((img) => img.url).join("\n"),
      });
    } else {
      setForm(emptyForm);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "categoryId" ? { subCategoryId: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const images = form.imageUrls
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, alt: form.name }));

    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stock: parseInt(form.stock, 10),
      sku: form.sku,
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId || null,
      featured: form.featured,
      bestSeller: form.bestSeller,
      newArrival: form.newArrival,
      images,
    };

    try {
      if (isEdit) {
        await adminApi.updateProduct(product.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-h-[90vh] sm:rounded-2xl dark:bg-gray-900">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product Name *">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field label="SKU *">
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Slug (auto-generated if empty)">
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="wireless-headphones-pro"
              className={inputClass}
            />
          </Field>

          <Field label="Description *">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₹) *">
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Compare Price (₹)">
              <input
                name="comparePrice"
                type="number"
                min="0"
                step="0.01"
                value={form.comparePrice}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
            <Field label="Stock *">
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category *">
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subcategory">
              <select
                name="subCategoryId"
                value={form.subCategoryId}
                onChange={handleChange}
                className={inputClass}
                disabled={!form.categoryId}
              >
                <option value="">None</option>
                {subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Image URLs (one per line)">
            <textarea
              name="imageUrls"
              value={form.imageUrls}
              onChange={handleChange}
              rows={4}
              placeholder="https://images.unsplash.com/photo-..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste public image URLs. Leave empty on create to use a default placeholder.
            </p>
          </Field>

          <div className="flex flex-wrap gap-4">
            <Checkbox
              name="featured"
              label="Featured"
              checked={form.featured}
              onChange={handleChange}
            />
            <Checkbox
              name="bestSeller"
              label="Best Seller"
              checked={form.bestSeller}
              onChange={handleChange}
            />
            <Checkbox
              name="newArrival"
              label="New Arrival"
              checked={form.newArrival}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 border-t pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border py-2.5 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-primary-600 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Checkbox({ name, label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-primary-600"
      />
      {label}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800";
