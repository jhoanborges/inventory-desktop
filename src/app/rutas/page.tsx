"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRutas, addRuta, removeRuta } from "@/store/rutasSlice";
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
import type { Ruta } from "@/types";

export default function RutasPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.rutas);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Ruta>>({
    nombre: "",
    origen: "",
    destino: "",
    vehiculo: "",
    estado: "pendiente",
  });

  useEffect(() => { dispatch(fetchRutas({ per_page: 1000 })); }, [dispatch]);

  const handleSave = async () => {
    await dispatch(addRuta(form));
    setOpen(false);
    dispatch(fetchRutas({ per_page: 1000 }));
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

  const columns: ColumnDef<Ruta>[] = [
    {
      accessorKey: "nombre",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nombre <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("nombre")}</span>,
    },
    { accessorKey: "origen", header: "Origen" },
    { accessorKey: "destino", header: "Destino" },
    {
      id: "operador",
      accessorFn: (row) => row.operador?.name ?? "-",
      header: "Operador",
    },
    {
      accessorKey: "vehiculo",
      header: "Vehículo",
      cell: ({ row }) => row.getValue("vehiculo") ?? "-",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={estadoColor(String(row.getValue("estado")))}>
          {estadoLabel(String(row.getValue("estado")))}
        </Badge>
      ),
    },
    {
      accessorKey: "fecha_inicio",
      header: "Inicio",
      cell: ({ row }) => row.getValue("fecha_inicio") ?? "-",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar?")) dispatch(removeRuta(row.original.id)); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rutas</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Ruta
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
