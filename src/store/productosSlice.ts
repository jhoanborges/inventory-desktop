import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "@/services/api";
import type { Producto } from "@/types";

interface ProductosState {
  items: Producto[];
  total: number;
  currentPage: number;
  lastPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductosState = {
  items: [],
  total: 0,
  currentPage: 1,
  lastPage: 1,
  loading: false,
  error: null,
};

export const fetchProductos = createAsyncThunk(
  "productos/fetch",
  async (params?: Record<string, string | number>) => {
    const { data } = await api.getProductos(params);
    return data;
  }
);

export const addProducto = createAsyncThunk(
  "productos/add",
  async (producto: Partial<Producto>) => {
    const { data } = await api.createProducto(producto);
    return data.data;
  }
);

export const editProducto = createAsyncThunk(
  "productos/edit",
  async ({ id, data }: { id: number; data: Partial<Producto> }) => {
    const res = await api.updateProducto(id, data);
    return res.data.data;
  }
);

export const removeProducto = createAsyncThunk(
  "productos/remove",
  async (id: number) => {
    await api.deleteProducto(id);
    return id;
  }
);

const productosSlice = createSlice({
  name: "productos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
        state.currentPage = action.payload.meta.current_page;
        state.lastPage = action.payload.meta.last_page;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar productos";
      })
      .addCase(addProducto.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total++;
      })
      .addCase(editProducto.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeProducto.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        state.total--;
      });
  },
});

export default productosSlice.reducer;
