"use client";

import ProductosTable from "@/components/productos/ProductosTable";

export default function ProductosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Productos</h1>
      <ProductosTable />
    </div>
  );
}
