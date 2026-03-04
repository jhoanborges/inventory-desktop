"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutThunk } from "@/store/authSlice";

export default function Header() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <h2 className="text-sm font-medium text-muted-foreground">
        Sistema de Inventario
      </h2>
      <div className="flex items-center gap-4">
        {user && (
          <span className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            {user.name}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={() => dispatch(logoutThunk())}>
          <LogOut className="h-4 w-4 mr-1" />
          Salir
        </Button>
      </div>
    </header>
  );
}
