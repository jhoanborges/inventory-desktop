"use client";

import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { syncProductos } from "@/services/api";
import { Upload } from "lucide-react";
import type { Producto } from "@/types";

export default function ExcelImport() {
  const [preview, setPreview] = useState<Partial<Producto>[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) return;

    const rows: Partial<Producto>[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => headers.push(String(cell.value).toLowerCase()));
        return;
      }
      const obj: Record<string, unknown> = {};
      row.eachCell((cell, colNumber) => {
        obj[headers[colNumber - 1]] = cell.value;
      });
      rows.push(obj as Partial<Producto>);
    });

    setPreview(rows);
    setResult(null);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const { data } = await syncProductos(preview);
      setResult(data.message);
      setPreview([]);
    } catch {
      setResult("Error al importar productos");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar desde Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Seleccionar archivo Excel
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            La primera fila debe contener los encabezados: sku, nombre, unidad_medida, precio, stock_actual, stock_minimo, barcode, categoria
          </p>
        </div>

        {preview.length > 0 && (
          <>
            <div className="border rounded-md max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(0, 20).map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.unidad_medida}</TableCell>
                      <TableCell>{p.precio}</TableCell>
                      <TableCell>{p.stock_actual}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-sm">{preview.length} productos listos para importar</p>
            <Button onClick={handleImport} disabled={loading}>
              {loading ? "Importando..." : "Importar productos"}
            </Button>
          </>
        )}

        {result && <p className="text-sm font-medium text-green-600">{result}</p>}
      </CardContent>
    </Card>
  );
}
