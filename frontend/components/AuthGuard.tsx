"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!ready) return;
    if (!user && !isPublic) {
      router.replace("/login");
    }
  }, [ready, user, isPublic, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf5fe] text-slate-500 text-sm">
        Loading workspace...
      </div>
    );
  }

  if (!user && !isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#edf5fe] text-slate-500 text-sm">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
