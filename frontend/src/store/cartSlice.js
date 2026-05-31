import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi } from "../api";

export const fetchCart = createAsyncThunk("cart/fetch", async (couponCode) => {
  const { data } = await cartApi.get(couponCode);
  return data.data;
});

export const addToCart = createAsyncThunk("cart/add", async ({ productId, quantity = 1 }) => {
  const { data } = await cartApi.add({ productId, quantity });
  return data.data;
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    totals: null,
    coupon: null,
    loading: false,
  },
  reducers: {
    clearCartState: (state) => {
      state.cart = null;
      state.totals = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.totals = action.payload.totals;
        state.coupon = action.payload.coupon;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload.cart;
        state.totals = action.payload.totals;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
