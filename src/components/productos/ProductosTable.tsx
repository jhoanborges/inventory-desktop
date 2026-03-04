"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductos, addProducto, editProducto, removeProducto } from "@/store/productosSlice";
import type { Producto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";

const emptyForm: Partial<Producto> = {
  sku: "",
  nombre: "",
  descripcion: "",
  categoria: "",
  unidad_medida: "unidad",
  precio: 0,
  stock_actual: 0,
  stock_minimo: 0,
  barcode: "",
  activo: true,
};

export default function ProductosTable() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.productos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchProductos({ per_page: 1000 }));
  }, [dispatch]);

  const handleOpen = (producto?: Producto) => {
    if (producto) {
      setEditing(producto);
      setForm(producto);
    } else {
      setEditing(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await dispatch(editProducto({ id: editing.id, data: form }));
    } else {
      await dispatch(addProducto(form));
    }
    setOpen(false);
    dispatch(fetchProductos({ per_page: 1000 }));
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar este producto?")) {
      await dispatch(removeProducto(id));
    }
  };

  const columns: ColumnDef<Producto>[] = [
    {
      accessorKey: "sku",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          SKU <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono">{row.getValue("sku")}</span>,
    },
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("nombre")}</span>,
    },
    {
      accessorKey: "categoria",
      header: "Categoría",
      cell: ({ row }) => row.getValue("categoria") ?? "-",
    },
    {
      accessorKey: "unidad_medida",
      header: "Unidad",
    },
    {
      accessorKey: "precio",
      header: () => <div className="text-right">Precio</div>,
      cell: ({ row }) => {
        const precio = row.getValue("precio") as number | null;
        return <div className="text-right">{precio ? `$${Number(precio).toFixed(2)}` : "-"}</div>;
      },
    },
    {
      accessorKey: "stock_actual",
      header: () => <div className="text-right">Stock</div>,
      cell: ({ row }) => {
        const stock = row.original.stock_actual;
        const minimo = row.original.stock_minimo;
        return (
          <div className={`text-right ${stock <= minimo ? "text-red-500 font-bold" : ""}`}>
            {stock}
          </div>
        );
      },
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.activo ? "default" : "secondary"}>
          {row.original.activo ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="text-right space-x-1">
          <Button variant="ghost" size="icon" onClick={() => handleOpen(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => handleOpen()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Producto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchColumn=""
        searchPlaceholder="Buscar por SKU, nombre o código..."
        pageSize={20}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SKU</Label>
              <Input value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Categoría</Label>
              <Input value={form.categoria ?? ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </div>
            <div>
              <Label>Unidad de Medida</Label>
              <Select value={form.unidad_medida} onValueChange={(v) => setForm({ ...form, unidad_medida: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidad">Unidad</SelectItem>
                  <SelectItem value="kg">Kilogramo</SelectItem>
                  <SelectItem value="caja">Caja</SelectItem>
                  <SelectItem value="litro">Litro</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Precio</Label>
              <Input type="number" step="0.01" value={form.precio ?? 0} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label>Código de barras</Label>
              <Input value={form.barcode ?? ""} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div>
              <Label>Stock Actual</Label>
              <Input type="number" value={form.stock_actual ?? 0} onChange={(e) => setForm({ ...form, stock_actual: parseInt(e.target.value) })} />
            </div>
            <div>
              <Label>Stock Mínimo</Label>
              <Input type="number" value={form.stock_minimo ?? 0} onChange={(e) => setForm({ ...form, stock_minimo: parseInt(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Descripción</Label>
              <Input value={form.descripcion ?? ""} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
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
