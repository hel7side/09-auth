"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="auth-container">
      <div className="auth-wrapper">{children}</div>
    </div>
  );
}
