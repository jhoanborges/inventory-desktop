import axios from "axios";
import type {
  AuthResponse,
  Lote,
  MovimientoInventario,
  PaginatedResponse,
  Producto,
  Ruta,
  User,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/auth/login", { email, password });

export const logout = () => api.post("/auth/logout");

export const getUser = () => api.get<User>("/auth/user");

// Productos
export const getProductos = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<Producto>>("/productos", { params });

export const getProducto = (id: number) =>
  api.get<{ data: Producto }>(`/productos/${id}`);

export const createProducto = (data: Partial<Producto>) =>
  api.post<{ data: Producto }>("/productos", data);

export const updateProducto = (id: number, data: Partial<Producto>) =>
  api.put<{ data: Producto }>(`/productos/${id}`, data);

export const deleteProducto = (id: number) =>
  api.delete(`/productos/${id}`);

export const syncProductos = (productos: Partial<Producto>[]) =>
  api.post("/productos/sync", { productos });

export const importCsv = (file: File) => {
  const formData = new FormData();
  formData.append("archivo", file);
  return api.post("/productos/import-csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    maxBodyLength: 10 * 1024 * 1024,
  });
};

// Lotes
export const getLotes = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<Lote>>("/lotes", { params });

export const createLote = (data: Partial<Lote>) =>
  api.post<{ data: Lote }>("/lotes", data);

export const updateLote = (id: number, data: Partial<Lote>) =>
  api.put<{ data: Lote }>(`/lotes/${id}`, data);

export const deleteLote = (id: number) =>
  api.delete(`/lotes/${id}`);

// Rutas
export const getRutas = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<Ruta>>("/rutas", { params });

export const createRuta = (data: Partial<Ruta>) =>
  api.post<{ data: Ruta }>("/rutas", data);

export const updateRuta = (id: number, data: Partial<Ruta>) =>
  api.put<{ data: Ruta }>(`/rutas/${id}`, data);

export const deleteRuta = (id: number) =>
  api.delete(`/rutas/${id}`);

// Movimientos
export const getMovimientos = (params?: Record<string, string | number>) =>
  api.get<PaginatedResponse<MovimientoInventario>>("/movimientos", { params });

export const createMovimiento = (data: Partial<MovimientoInventario>) =>
  api.post<{ data: MovimientoInventario }>("/movimientos", data);

// Scan
export const scanBarcode = (barcode: string) =>
  api.get<{ data: Producto }>(`/scan/${barcode}`);

export default api;
