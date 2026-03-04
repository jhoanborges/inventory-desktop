import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "@/services/api";
import type { Ruta } from "@/types";

interface RutasState {
  items: Ruta[];
  total: number;
  currentPage: number;
  lastPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: RutasState = {
  items: [],
  total: 0,
  currentPage: 1,
  lastPage: 1,
  loading: false,
  error: null,
};

export const fetchRutas = createAsyncThunk(
  "rutas/fetch",
  async (params?: Record<string, string | number>) => {
    const { data } = await api.getRutas(params);
    return data;
  }
);

export const addRuta = createAsyncThunk(
  "rutas/add",
  async (ruta: Partial<Ruta>) => {
    const { data } = await api.createRuta(ruta);
    return data.data;
  }
);

export const editRuta = createAsyncThunk(
  "rutas/edit",
  async ({ id, data }: { id: number; data: Partial<Ruta> }) => {
    const res = await api.updateRuta(id, data);
    return res.data.data;
  }
);

export const removeRuta = createAsyncThunk(
  "rutas/remove",
  async (id: number) => {
    await api.deleteRuta(id);
    return id;
  }
);

const rutasSlice = createSlice({
  name: "rutas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRutas.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRutas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
        state.currentPage = action.payload.meta.current_page;
        state.lastPage = action.payload.meta.last_page;
      })
      .addCase(fetchRutas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar rutas";
      })
      .addCase(addRuta.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total++;
      })
      .addCase(editRuta.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeRuta.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
        state.total--;
      });
  },
});

export default rutasSlice.reducer;
