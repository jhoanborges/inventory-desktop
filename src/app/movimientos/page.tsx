"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMovimientos, addMovimiento } from "@/store/movimientosSlice";
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
import { Plus, ArrowUpDown } from "lucide-react";
import { getProductos } from "@/services/api";
import type { Producto, MovimientoInventario } from "@/types";

export default function MovimientosPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.movimientos);
  const [open, setOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Partial<MovimientoInventario>>({
    producto_id: 0,
    tipo: "entrada",
    cantidad: 1,
    motivo: "",
  });

  useEffect(() => {
    dispatch(fetchMovimientos({ per_page: 1000 }));
    getProductos({ per_page: 500 }).then((r) => setProductos(r.data.data));
  }, [dispatch]);

  const handleSave = async () => {
    await dispatch(addMovimiento(form));
    setOpen(false);
    dispatch(fetchMovimientos({ per_page: 1000 }));
  };

  const columns: ColumnDef<MovimientoInventario>[] = [
    {
      id: "producto",
      accessorFn: (row) => row.producto?.nombre ?? "-",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Producto <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("producto")}</span>,
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant={String(row.getValue("tipo")) === "entrada" ? "default" : "destructive"}>
          {String(row.getValue("tipo")) === "entrada" ? "Entrada" : "Salida"}
        </Badge>
      ),
    },
    {
      accessorKey: "cantidad",
      header: () => <div className="text-right">Cantidad</div>,
      cell: ({ row }) => <div className="text-right">{row.getValue("cantidad")}</div>,
    },
    {
      accessorKey: "motivo",
      header: "Motivo",
      cell: ({ row }) => row.getValue("motivo") ?? "-",
    },
    {
      id: "usuario",
      accessorFn: (row) => row.user?.name ?? "-",
      header: "Usuario",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Movimiento
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
          <DialogHeader><DialogTitle>Nuevo Movimiento</DialogTitle></DialogHeader>
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
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as "entrada" | "salida" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" min={1} value={form.cantidad ?? 1} onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Motivo</Label>
              <Input value={form.motivo ?? ""} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
