"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductos, addProducto, editProducto, removeProducto } from "@/store/productosSlice";
import type { Producto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

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
  const { items, loading, total } = useAppSelector((s) => s.productos);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchProductos({ search }));
  }, [dispatch, search]);

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
    dispatch(fetchProductos({ search }));
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar este producto?")) {
      await dispatch(removeProducto(id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU, nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Producto
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay productos
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{p.categoria ?? "-"}</TableCell>
                  <TableCell>{p.unidad_medida}</TableCell>
                  <TableCell className="text-right">
                    {p.precio ? `$${Number(p.precio).toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={p.stock_actual <= p.stock_minimo ? "text-red-500 font-bold" : ""}>
                      {p.stock_actual}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.activo ? "default" : "secondary"}>
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpen(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">Total: {total} productos</p>

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
