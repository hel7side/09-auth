"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { checkSession } from "@/lib/api/clientApi";

interface AuthProviderProps {
  children: ReactNode;
}

const privateRoutes = ["/profile", "/notes"];

const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, clearIsAuthenticated, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!isInitialized.current) {
        try {
          const user = await checkSession();
          if (user) {
            setUser(user);
          } else {
            clearIsAuthenticated();
          }
        } catch {
          clearIsAuthenticated();
        } finally {
          isInitialized.current = true;
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [setUser, clearIsAuthenticated]);

  useEffect(() => {
    const isPrivate = privateRoutes.some((route) => pathname.startsWith(route));
    if (isInitialized.current && isPrivate && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [pathname, isAuthenticated, router]);

  if (loading) {
    return <div>Loading...</div>;
  }
  return <>{children}</>;
};

export default AuthProvider;
