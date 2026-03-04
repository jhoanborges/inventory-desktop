"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchUser, initializeAuth } from "@/store/authSlice";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, loading } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth()).then(() => setInitialized(true));
  }, [dispatch]);

  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      if (pathname !== "/login") router.replace("/login");
      return;
    }
    if (!user && !loading) {
      dispatch(fetchUser());
    }
  }, [initialized, token, user, loading, pathname, router, dispatch]);

  if (!initialized) return null;
  if (pathname === "/login") return <>{children}</>;
  if (!token) return null;

  return <>{children}</>;
}
