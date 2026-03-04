"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLotes, addLote, removeLote } from "@/store/lotesSlice";
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
import { Plus, Trash2 } from "lucide-react";
import { getProductos } from "@/services/api";
import type { Producto, Lote } from "@/types";

export default function LotesPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total } = useAppSelector((s) => s.lotes);
  const [open, setOpen] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [form, setForm] = useState<Partial<Lote>>({
    producto_id: 0,
    numero_lote: "",
    cantidad: 0,
    estado: "activo",
  });

  useEffect(() => {
    dispatch(fetchLotes({}));
    getProductos({ per_page: 500 }).then((r) => setProductos(r.data.data));
  }, [dispatch]);

  const handleSave = async () => {
    await dispatch(addLote(form));
    setOpen(false);
    dispatch(fetchLotes({}));
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "activo": return "default" as const;
      case "vencido": return "destructive" as const;
      case "agotado": return "secondary" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lotes</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Lote
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N. Lote</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Fabricación</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay lotes</TableCell></TableRow>
            ) : items.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-mono">{l.numero_lote}</TableCell>
                <TableCell>{l.producto?.nombre ?? "-"}</TableCell>
                <TableCell className="text-right">{l.cantidad}</TableCell>
                <TableCell>{l.fecha_fabricacion ?? "-"}</TableCell>
                <TableCell>{l.fecha_vencimiento ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={estadoColor(String(l.estado))}>{String(l.estado)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) dispatch(removeLote(l.id)); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">Total: {total} lotes</p>

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
