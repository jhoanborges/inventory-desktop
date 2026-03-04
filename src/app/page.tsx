"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Truck, ArrowLeftRight } from "lucide-react";
import { getProductos, getRutas, getMovimientos } from "@/services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    stockBajo: 0,
    rutasActivas: 0,
    movimientosHoy: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [prodRes, rutaRes, movRes] = await Promise.all([
          getProductos({ per_page: 1000 }),
          getRutas({ estado: "en_progreso" }),
          getMovimientos({ per_page: 1000 }),
        ]);

        const productos = prodRes.data.data;
        const stockBajo = productos.filter(
          (p) => p.stock_actual <= p.stock_minimo
        ).length;

        setStats({
          totalProductos: prodRes.data.meta.total,
          stockBajo,
          rutasActivas: rutaRes.data.meta.total,
          movimientosHoy: movRes.data.meta.total,
        });
      } catch {
        // API not available yet
      }
    };
    loadStats();
  }, []);

  const cards = [
    {
      title: "Total Productos",
      value: stats.totalProductos,
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Stock Bajo",
      value: stats.stockBajo,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Rutas Activas",
      value: stats.rutasActivas,
      icon: Truck,
      color: "text-green-500",
    },
    {
      title: "Movimientos",
      value: stats.movimientosHoy,
      icon: ArrowLeftRight,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
