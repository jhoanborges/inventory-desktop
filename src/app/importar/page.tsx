"use client";

import ExcelImport from "@/components/excel/ExcelImport";
import ExcelExport from "@/components/excel/ExcelExport";

export default function ImportarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Importar / Exportar Excel</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExcelImport />
        <ExcelExport />
      </div>
    </div>
  );
}
