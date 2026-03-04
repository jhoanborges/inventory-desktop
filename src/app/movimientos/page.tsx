"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMovimientos, addMovimiento } from "@/store/movimientosSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { getProductos } from "@/services/api";
import type { Producto, MovimientoInventario } from "@/types";

export default function MovimientosPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total } = useAppSelector((s) => s.movimientos);
  const [open, setOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Partial<MovimientoInventario>>({
    producto_id: 0,
    tipo: "entrada",
    cantidad: 1,
    motivo: "",
  });

  useEffect(() => {
    dispatch(fetchMovimientos({}));
    getProductos({ per_page: 500 }).then((r) => setProductos(r.data.data));
  }, [dispatch]);

  const handleSave = async () => {
    await dispatch(addMovimiento(form));
    setOpen(false);
    dispatch(fetchMovimientos({}));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Movimiento
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay movimientos</TableCell></TableRow>
            ) : items.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.producto?.nombre ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={String(m.tipo) === "entrada" ? "default" : "destructive"}>
                    {String(m.tipo) === "entrada" ? "Entrada" : "Salida"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{m.cantidad}</TableCell>
                <TableCell>{m.motivo ?? "-"}</TableCell>
                <TableCell>{m.user?.name ?? "-"}</TableCell>
                <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">Total: {total} movimientos</p>

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
