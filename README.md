# Inventario Bodega - Desktop

Aplicación de escritorio para gestionar el inventario de bodega. Incluye dashboard, CRUD de productos/lotes/rutas/movimientos, e importación/exportación de Excel.

## Tech Stack

- **Tauri v2** (framework desktop nativo)
- **Next.js 16** + **React 19** + **TypeScript**
- **shadcn/ui** (componentes UI)
- **Tailwind CSS v4** (estilos)
- **Redux Toolkit** (estado global)
- **Axios** (HTTP client)
- **ExcelJS** (importar/exportar Excel)
- **Lucide React** (iconos)
- **Yarn v4** (package manager)

## Requisitos

- Node.js 18+
- Yarn
- Rust (para Tauri) - https://www.rust-lang.org/tools/install
- Backend corriendo en http://localhost

## Instalación

```bash
# Instalar dependencias
yarn install

# Desarrollo en navegador
yarn dev

# Desarrollo como app de escritorio
yarn tauri dev

# Build de producción
yarn build
yarn tauri build
```

## Estructura del proyecto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── page.tsx            # Dashboard con estadísticas
│   ├── layout.tsx          # Layout con sidebar y header
│   ├── providers.tsx       # Redux provider
│   ├── productos/          # Gestión de productos
│   ├── lotes/              # Gestión de lotes
│   ├── rutas/              # Gestión de rutas
│   ├── movimientos/        # Movimientos de inventario
│   └── importar/           # Import/export Excel
├── components/
│   ├── ui/                 # Componentes shadcn/ui
│   ├── layout/             # Sidebar, Header
│   ├── productos/          # ProductosTable
│   └── excel/              # ExcelImport, ExcelExport
├── store/
│   ├── store.ts            # Redux store
│   ├── authSlice.ts        # Autenticación
│   └── hooks.ts            # useAppDispatch, useAppSelector
├── services/
│   └── api.ts              # Axios con interceptores de token
└── types/
    └── index.ts            # Interfaces TypeScript
src-tauri/                  # Código Rust de Tauri
├── tauri.conf.json         # Configuración de Tauri
└── src/main.rs             # Entry point Rust
```

## Configuración

- **Static export**: Next.js está configurado con `output: 'export'` para que Tauri lo sirva sin servidor Node.js
- **API base URL**: Configurada en `src/services/api.ts` apuntando a `http://localhost/api`
- **Temas**: Soporte dark/light mode via `next-themes`

## Funcionalidades

- Dashboard con estadísticas (productos, stock, rutas, movimientos)
- CRUD completo de productos, lotes, rutas
- Registro de movimientos de inventario (entrada/salida)
- Importación masiva desde archivos Excel
- Exportación de datos a Excel
- Autenticación con token Bearer (Sanctum)
- Escaneo de barcode
