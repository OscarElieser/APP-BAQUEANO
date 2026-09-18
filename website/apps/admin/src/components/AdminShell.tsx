"use client";

/**
 * WHY
 * Provides a consistent operating surface for Baqueano administrators.
 *
 * HOW
 * Uses the shared module list and stable navigation with accessible landmarks.
 *
 * WHAT
 * Sidebar, topbar, and content container for admin routes.
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminModules } from "@baqueano/config";
import { Bell, ShieldCheck } from "lucide-react";
import { AdminAuthGate } from "./AdminAuthGate";

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  
  // Extraemos el módulo actual de la URL
  const currentModule = pathname?.split("/")[1] || "dashboard";
  const currentTitle = currentModule.replace("-", " ").toUpperCase();

  return (
    <AdminAuthGate>
      <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#061018] p-4 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/assets/images/brand/baqueano_logo_horizontal.png" alt="Baqueano" width={160} height={52} className="h-auto w-40" priority />
          </Link>
          <p className="mt-5 font-tech text-xs font-bold uppercase text-[#F4E6C1]">Control Center</p>
          <nav className="mt-5 grid gap-1 overflow-auto pb-20" aria-label="Modulos de administracion">
            {adminModules.map((module) => {
              const href = module === "dashboard" ? "/dashboard" : `/${module}`;
              const isActive = pathname?.startsWith(href);
              
              return (
                <Link 
                  key={module} 
                  href={href} 
                  className={`focus-ring rounded-md px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                    isActive 
                      ? "bg-[#165D6F]/30 text-white border-l-2 border-[#F65E01] shadow-[inset_0_0_20px_rgba(22,93,111,0.2)]" 
                      : "text-white/66 hover:bg-white/10 hover:text-white border-l-2 border-transparent"
                  }`}
                >
                  {module.replace("-", " ")}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/10 bg-[#08111f]/86 px-4 backdrop-blur lg:px-8">
            <div>
              <p className="font-tech text-xs font-bold uppercase text-[#F65E01] tracking-wider">
                ADMIN &gt; {currentTitle}
              </p>
              <h1 className="font-display text-xl font-black text-white capitalize">{currentModule.replace("-", " ")}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-sm font-bold text-white">Super Admin</span>
                <span className="text-xs text-white/50">Centro de Operaciones</span>
              </div>
              <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/12 bg-white/[0.06] hover:bg-white/10 transition-colors" aria-label="Notificaciones">
                <Bell size={18} />
              </button>
              <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#10B981]/30 bg-[#10B981]/12 text-[#10B981] hover:bg-[#10B981]/20 transition-colors" aria-label="Sesion protegida">
                <ShieldCheck size={18} />
              </button>
            </div>
          </header>
          <main className="min-w-0 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </AdminAuthGate>
  );
}
