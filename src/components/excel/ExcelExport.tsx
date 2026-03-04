"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductos } from "@/services/api";
import { Download } from "lucide-react";

export default function ExcelExport() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data } = await getProductos({ per_page: 1000 });
      const productos = data.data;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Productos");

      worksheet.columns = [
        { header: "SKU", key: "sku", width: 15 },
        { header: "Nombre", key: "nombre", width: 30 },
        { header: "Categoría", key: "categoria", width: 20 },
        { header: "Unidad de Medida", key: "unidad_medida", width: 15 },
        { header: "Precio", key: "precio", width: 12 },
        { header: "Stock Actual", key: "stock_actual", width: 12 },
        { header: "Stock Mínimo", key: "stock_minimo", width: 12 },
        { header: "Código de Barras", key: "barcode", width: 20 },
        { header: "Activo", key: "activo", width: 10 },
      ];

      worksheet.getRow(1).font = { bold: true };

      productos.forEach((p) => {
        worksheet.addRow({
          sku: p.sku,
          nombre: p.nombre,
          categoria: p.categoria ?? "",
          unidad_medida: p.unidad_medida,
          precio: p.precio,
          stock_actual: p.stock_actual,
          stock_minimo: p.stock_minimo,
          barcode: p.barcode ?? "",
          activo: p.activo ? "Sí" : "No",
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const filePath = await save({
        defaultPath: `productos_${new Date().toISOString().split("T")[0]}.xlsx`,
        filters: [{ name: "Excel", extensions: ["xlsx"] }],
      });
      if (filePath) {
        await writeFile(filePath, new Uint8Array(buffer));
      }
    } catch {
      alert("Error al exportar productos");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar a Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Descarga todos los productos en formato Excel (.xlsx)
        </p>
        <Button onClick={handleExport} disabled={loading}>
          {loading ? "Generando..." : "Descargar Excel"}
        </Button>
      </CardContent>
    </Card>
  );
}
