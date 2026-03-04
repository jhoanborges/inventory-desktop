import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "@/services/api";
import type { MovimientoInventario } from "@/types";

interface MovimientosState {
  items: MovimientoInventario[];
  total: number;
  currentPage: number;
  lastPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: MovimientosState = {
  items: [],
  total: 0,
  currentPage: 1,
  lastPage: 1,
  loading: false,
  error: null,
};

export const fetchMovimientos = createAsyncThunk(
  "movimientos/fetch",
  async (params?: Record<string, string | number>) => {
    const { data } = await api.getMovimientos(params);
    return data;
  }
);

export const addMovimiento = createAsyncThunk(
  "movimientos/add",
  async (movimiento: Partial<MovimientoInventario>) => {
    const { data } = await api.createMovimiento(movimiento);
    return data.data;
  }
);

const movimientosSlice = createSlice({
  name: "movimientos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovimientos.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMovimientos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
        state.currentPage = action.payload.meta.current_page;
        state.lastPage = action.payload.meta.last_page;
      })
      .addCase(fetchMovimientos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar movimientos";
      })
      .addCase(addMovimiento.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total++;
      });
  },
});

export default movimientosSlice.reducer;
