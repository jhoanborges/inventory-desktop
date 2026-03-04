import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "@/services/api";
import type { Lote } from "@/types";

interface LotesState {
  items: Lote[];
  total: number;
  currentPage: number;
  lastPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: LotesState = {
  items: [],
  total: 0,
  currentPage: 1,
  lastPage: 1,
  loading: false,
  error: null,
};

export const fetchLotes = createAsyncThunk(
  "lotes/fetch",
  async (params?: Record<string, string | number>) => {
    const { data } = await api.getLotes(params);
    return data;
  }
);

export const addLote = createAsyncThunk(
  "lotes/add",
  async (lote: Partial<Lote>) => {
    const { data } = await api.createLote(lote);
    return data.data;
  }
);

export const editLote = createAsyncThunk(
  "lotes/edit",
  async ({ id, data }: { id: number; data: Partial<Lote> }) => {
    const res = await api.updateLote(id, data);
    return res.data.data;
  }
);

export const removeLote = createAsyncThunk(
  "lotes/remove",
  async (id: number) => {
    await api.deleteLote(id);
    return id;
  }
);

const lotesSlice = createSlice({
  name: "lotes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLotes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLotes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.meta.total;
        state.currentPage = action.payload.meta.current_page;
        state.lastPage = action.payload.meta.last_page;
      })
      .addCase(fetchLotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error al cargar lotes";
      })
      .addCase(addLote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total++;
      })
      .addCase(editLote.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeLote.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l.id !== action.payload);
        state.total--;
      });
  },
});

export default lotesSlice.reducer;
