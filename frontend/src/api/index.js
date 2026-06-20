import api from "./client";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout", { refreshToken: localStorage.getItem("refreshToken") }),
  me: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
  resendVerification: () => api.post("/auth/resend-verification"),
};

export const productApi = {
  list: (params) => api.get("/products", { params }),
  bySlug: (slug) => api.get(`/products/${slug}`),
  featured: () => api.get("/products/featured"),
  bestSellers: () => api.get("/products/best-sellers"),
  newArrivals: () => api.get("/products/new-arrivals"),
  recentlyViewed: () => api.get("/products/recently-viewed"),
};

export const categoryApi = {
  list: () => api.get("/categories"),
};

export const cartApi = {
  get: (couponCode) => api.get("/cart", { params: { couponCode } }),
  add: (data) => api.post("/cart/items", data),
  update: (itemId, data) => api.patch(`/cart/items/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  validateCoupon: (code) => api.post("/cart/coupon/validate", { code }),
};

export const wishlistApi = {
  list: () => api.get("/wishlist"),
  add: (productId) => api.post("/wishlist", { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderApi = {
  list: (params) => api.get("/orders", { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  return: (id, reason) => api.post(`/orders/${id}/return`, { reason }),
  invoice: (id) => api.get(`/orders/${id}/invoice`),
};

export const userApi = {
  dashboard: () => api.get("/users/dashboard"),
  updateProfile: (data) => api.patch("/users/profile", data),
  changePassword: (data) => api.patch("/users/password", data),
  addresses: () => api.get("/users/addresses"),
  createAddress: (data) => api.post("/users/addresses", data),
  updateAddress: (id, data) => api.patch(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  notifications: () => api.get("/users/notifications"),
  markRead: (id) => api.patch(`/users/notifications/${id}/read`),
  markAllRead: () => api.patch("/users/notifications/read-all"),
};

export const reviewApi = {
  byProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post("/reviews", data),
};

export const bannerApi = {
  list: (params) => api.get("/banners", { params }),
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  users: (params) => api.get("/admin/users", { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  products: (params) => api.get("/admin/products", { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post("/admin/products", data),
  updateProduct: (id, data) => api.patch(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  updateInventory: (id, stock) => api.patch(`/admin/products/${id}/inventory`, { stock }),
  orders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, data) => api.patch(`/admin/orders/${id}/status`, data),
  reviews: (params) => api.get("/admin/reviews", { params }),
  approveReview: (id) => api.patch(`/admin/reviews/${id}/approve`),
  coupons: () => api.get("/admin/coupons"),
  createCoupon: (data) => api.post("/admin/coupons", data),
  categories: () => api.get("/admin/categories"),
  createCategory: (data) => api.post("/admin/categories", data),
  createSubCategory: (data) => api.post("/admin/subcategories", data),
  banners: () => api.get("/admin/banners"),
  createBanner: (data) => api.post("/admin/banners", data),
};
