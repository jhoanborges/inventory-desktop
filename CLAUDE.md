# CLAUDE.md - Desktop

## Project overview

Desktop application for warehouse inventory management built with Tauri v2 and Next.js. Provides dashboard, full CRUD for products/lots/routes/movements, and Excel import/export.

## Tech stack

- Tauri v2 (Rust-based desktop wrapper)
- Next.js 16 + React 19 + TypeScript
- shadcn/ui (component library)
- Tailwind CSS v4
- Redux Toolkit (state management)
- Axios (HTTP client)
- ExcelJS + file-saver (Excel import/export)
- Yarn v4 (package manager)

## Development commands

```bash
yarn install          # Install dependencies
yarn dev              # Next.js dev server (browser)
yarn tauri dev        # Tauri desktop app (dev)
yarn build            # Build Next.js
yarn tauri build      # Build production desktop app
```

## Architecture

- **Pages**: `src/app/` - Next.js App Router (dashboard, productos, lotes, rutas, movimientos, importar)
- **Components**: `src/components/` - UI components organized by feature
  - `ui/` - shadcn/ui base components
  - `layout/` - Sidebar, Header
  - `productos/` - ProductosTable
  - `excel/` - ExcelImport, ExcelExport
- **State**: `src/store/` - Redux store with authSlice
- **API**: `src/services/api.ts` - Axios instance with Bearer token interceptor
- **Types**: `src/types/index.ts` - TypeScript interfaces
- **Tauri**: `src-tauri/` - Rust code and Tauri config

## Key patterns

- Next.js configured with `output: 'export'` for static generation (no Node.js server needed by Tauri)
- Auth token stored in localStorage, attached via Axios interceptor
- All API calls go through `src/services/api.ts` centralized service
- shadcn/ui components in `src/components/ui/` - add new ones with `npx shadcn@latest add <component>`
- Redux used only for auth state; data fetching is direct via API service
- Dark/light mode via `next-themes`

## API connection

- Base URL: `http://localhost/api` (expects backend running via Sail)
- Authentication: Bearer token from `/api/auth/login`

## Conventions

- Use `yarn` (not npm) for all package operations
- Components use PascalCase filenames
- Pages follow Next.js App Router conventions (`page.tsx`, `layout.tsx`)
- Spanish for UI text and domain terms, English for code
- Prefer shadcn/ui components over custom ones
