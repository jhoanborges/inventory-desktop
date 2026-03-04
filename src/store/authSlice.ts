import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "@/services/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const initializeAuth = createAsyncThunk("auth/init", async () => {
  const token = localStorage.getItem("token");
  return token;
});

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const { data } = await api.login(email, password);
    localStorage.setItem("token", data.token);
    return data;
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await api.logout();
  localStorage.removeItem("token");
});

export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  const { data } = await api.getUser();
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error de autenticación";
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.token = action.payload;
      });
  },
});

export default authSlice.reducer;
