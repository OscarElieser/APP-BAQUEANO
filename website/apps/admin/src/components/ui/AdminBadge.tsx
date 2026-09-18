import * as React from "react"

/**
 * WHY
 * Permite identificar rápidamente el estado de entidades (published, draft, archived) o prioridades.
 *
 * HOW
 * Usa variantes con colores semánticos, usando backgrounds semi-transparentes sobre los tonos oscuros Matte.
 */

export interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
  children: React.ReactNode;
}

export function AdminBadge({ className = "", variant = "neutral", children, ...props }: AdminBadgeProps) {
  let variantClasses = "";
  switch (variant) {
    case "success":
      variantClasses = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      break;
    case "warning":
      variantClasses = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      break;
    case "danger":
      variantClasses = "bg-red-500/10 text-red-400 border border-red-500/20";
      break;
    case "info":
      variantClasses = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
      break;
    case "neutral":
    default:
      variantClasses = "bg-white/5 text-white/70 border border-white/10";
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}
