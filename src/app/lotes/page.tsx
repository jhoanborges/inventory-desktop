"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLotes, addLote, removeLote } from "@/store/lotesSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Trash2, ArrowUpDown } from "lucide-react";
import { getProductos } from "@/services/api";
import type { Producto, Lote } from "@/types";

export default function LotesPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.lotes);
  const [open, setOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Partial<Lote>>({
    producto_id: 0,
    numero_lote: "",
    cantidad: 0,
    estado: "activo",
  });

  useEffect(() => {
    dispatch(fetchLotes({ per_page: 1000 }));
    getProductos({ per_page: 500 }).then((r) => setProductos(r.data.data));
  }, [dispatch]);

  const handleSave = async () => {
    await dispatch(addLote(form));
    setOpen(false);
    dispatch(fetchLotes({ per_page: 1000 }));
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "activo": return "default" as const;
      case "vencido": return "destructive" as const;
      case "agotado": return "secondary" as const;
      default: return "default" as const;
    }
  };

  const columns: ColumnDef<Lote>[] = [
    {
      accessorKey: "numero_lote",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          N. Lote <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono">{row.getValue("numero_lote")}</span>,
    },
    {
      id: "producto",
      accessorFn: (row) => row.producto?.nombre ?? "-",
      header: "Producto",
    },
    {
      accessorKey: "cantidad",
      header: () => <div className="text-right">Cantidad</div>,
      cell: ({ row }) => <div className="text-right">{row.getValue("cantidad")}</div>,
    },
    {
      accessorKey: "fecha_fabricacion",
      header: "Fabricación",
      cell: ({ row }) => row.getValue("fecha_fabricacion") ?? "-",
    },
    {
      accessorKey: "fecha_vencimiento",
      header: "Vencimiento",
      cell: ({ row }) => row.getValue("fecha_vencimiento") ?? "-",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={estadoColor(String(row.getValue("estado")))}>
          {String(row.getValue("estado"))}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) dispatch(removeLote(row.original.id)); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lotes</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Lote
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchColumn=""
        searchPlaceholder="Buscar..."
        pageSize={20}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Lote</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Producto</Label>
              <Select onValueChange={(v) => setForm({ ...form, producto_id: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                <SelectContent>
                  {productos.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre} ({p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Número de Lote</Label>
              <Input value={form.numero_lote ?? ""} onChange={(e) => setForm({ ...form, numero_lote: e.target.value })} />
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" value={form.cantidad ?? 0} onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Fecha Fabricación</Label>
              <Input type="date" onChange={(e) => setForm({ ...form, fecha_fabricacion: e.target.value })} />
            </div>
            <div>
              <Label>Fecha Vencimiento</Label>
              <Input type="date" onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
