"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const res = await fetch("/api/usage");
        if (res.ok) {
          const data = await res.json();
          if (data.isPro) {
            router.replace("/");
            return;
          }
        }
      } catch {
        // fallback to pricing on error
      }
      router.replace("/pricing");
    }

    redirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-zinc-600 dark:border-t-zinc-200" />
    </div>
  );
}
