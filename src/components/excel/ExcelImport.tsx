"use client";

import { useState, useRef } from "react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { syncProductos, importCsv } from "@/services/api";
import { Upload, FileSpreadsheet, FileText, Download } from "lucide-react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Producto } from "@/types";

export default function ExcelImport() {
  const [preview, setPreview] = useState<Partial<Producto>[]>([]);
  const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const excelRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const downloadCsvTemplate = async () => {
    const header = "sku,nombre,unidad_medida,descripcion,categoria,precio,stock_actual,stock_minimo,barcode";
    const row1 = "PROD-001,Tornillo 1/4,unidad,Tornillo galvanizado,Ferretería,0.50,100,20,7501234567890";
    const row2 = "PROD-002,Tuerca 1/4,unidad,Tuerca hexagonal,Ferretería,0.30,200,50,7501234567891";
    const csv = [header, row1, row2].join("\n");

    const filePath = await save({
      defaultPath: "plantilla_productos.csv",
      filters: [{ name: "CSV", extensions: ["csv"] }],
    });
    if (filePath) {
      await writeTextFile(filePath, csv);
    }
  };

  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(null);
    setResult(null);

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
  };

  const handleCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setResult({ message: "El archivo excede el límite de 10MB", type: "error" });
      return;
    }

    setPreview([]);
    setResult(null);
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n");
      if (lines.length < 2) return;

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows: Partial<Producto>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const obj: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] ?? "";
        });
        rows.push(obj as Partial<Producto>);
      }

      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      if (csvFile) {
        const { data } = await importCsv(csvFile);
        setResult({ message: data.message ?? `Importación completada`, type: "success" });
      } else {
        const { data } = await syncProductos(preview);
        setResult({ message: data.message ?? "Importación completada", type: "success" });
      }
      setPreview([]);
      setCsvFile(null);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al importar";
      setResult({ message: msg, type: "error" });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Productos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input ref={csvRef} type="file" accept=".csv" onChange={handleCsv} className="hidden" />
          <input ref={excelRef} type="file" accept=".xlsx,.xls" onChange={handleExcel} className="hidden" />
          <Button variant="outline" onClick={() => csvRef.current?.click()}>
            <FileText className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" onClick={() => excelRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={downloadCsvTemplate}>
            <Download className="h-3 w-3 mr-1" /> Descargar plantilla CSV
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Columnas obligatorias: sku, nombre, unidad_medida. Opcionales: descripcion, categoria, precio, stock_actual, stock_minimo, barcode. Máximo 10MB.
        </p>

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
            <div className="flex items-center gap-2">
              <p className="text-sm">{preview.length} productos listos</p>
              {csvFile && <Badge variant="secondary">CSV → Backend</Badge>}
              {!csvFile && <Badge variant="secondary">Excel → Sync</Badge>}
            </div>
            <Button onClick={handleImport} disabled={loading}>
              {loading ? "Importando..." : "Importar productos"}
            </Button>
          </>
        )}

        {result && (
          <p className={`text-sm font-medium ${result.type === "success" ? "text-green-600" : "text-red-500"}`}>
            {result.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
