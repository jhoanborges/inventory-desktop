import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productosReducer from "./productosSlice";
import lotesReducer from "./lotesSlice";
import rutasReducer from "./rutasSlice";
import movimientosReducer from "./movimientosSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    productos: productosReducer,
    lotes: lotesReducer,
    rutas: rutasReducer,
    movimientos: movimientosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
