"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRutas, addRuta, removeRuta } from "@/store/rutasSlice";
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
import type { Ruta } from "@/types";

export default function RutasPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total } = useAppSelector((s) => s.rutas);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Ruta>>({
    nombre: "",
    origen: "",
    destino: "",
    vehiculo: "",
    estado: "pendiente",
  });

  useEffect(() => { dispatch(fetchRutas({})); }, [dispatch]);

  const handleSave = async () => {
    await dispatch(addRuta(form));
    setOpen(false);
    dispatch(fetchRutas({}));
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente": return "secondary" as const;
      case "en_progreso": return "default" as const;
      case "completada": return "outline" as const;
      default: return "default" as const;
    }
  };

  const estadoLabel = (estado: string) => {
    switch (estado) {
      case "pendiente": return "Pendiente";
      case "en_progreso": return "En Progreso";
      case "completada": return "Completada";
      default: return estado;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rutas</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Ruta
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Operador</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No hay rutas</TableCell></TableRow>
            ) : items.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nombre}</TableCell>
                <TableCell>{r.origen}</TableCell>
                <TableCell>{r.destino}</TableCell>
                <TableCell>{r.operador?.name ?? "-"}</TableCell>
                <TableCell>{r.vehiculo ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={estadoColor(String(r.estado))}>{estadoLabel(String(r.estado))}</Badge>
                </TableCell>
                <TableCell>{r.fecha_inicio ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) dispatch(removeRuta(r.id)); }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">Total: {total} rutas</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Ruta</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div><Label>Nombre</Label><Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div><Label>Origen</Label><Input value={form.origen ?? ""} onChange={(e) => setForm({ ...form, origen: e.target.value })} /></div>
            <div><Label>Destino</Label><Input value={form.destino ?? ""} onChange={(e) => setForm({ ...form, destino: e.target.value })} /></div>
            <div><Label>Vehículo</Label><Input value={form.vehiculo ?? ""} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} /></div>
            <div>
              <Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v as Ruta["estado"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
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
