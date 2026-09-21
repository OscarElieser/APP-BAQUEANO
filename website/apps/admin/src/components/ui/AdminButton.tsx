import * as React from "react"

/**
 * WHY
 * Estandariza la acciÃ³n principal interactiva para mantener el diseÃ±o Matte Alianza.
 *
 * HOW
 * Usa variantes de Tailwind para manejar estados (primary, secondary, danger, ghost) sin repetir cÃ³digo.
 * Evita la opacidad estÃ¡ndar, utilizando `.withValues()` o rgba explÃ­cito en el diseÃ±o si es necesario,
 * aunque aquÃ­ en Tailwind se usarÃ¡n colores sÃ³lidos y bordes para mantener la legibilidad.
 *
 * WHAT
 * Componente botÃ³n reusable que soporta `asChild` para fusionarse con `Link`.
 */

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ReactNode;
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className = "", variant = "primary", size = "default", icon, children, ...props }, ref) => {
    let variantClasses = "";
    switch (variant) {
      case "primary":
        variantClasses = "bg-[#F65E01] text-white hover:bg-[#D55201] border border-[#F65E01]/30 shadow-[0_4px_14px_rgba(246,94,1,0.2)]";
        break;
      case "secondary":
        variantClasses = "bg-[#165D6F] text-white hover:bg-[#124B5A] border border-[#165D6F]/30 shadow-[0_4px_14px_rgba(22,93,111,0.2)]";
        break;
      case "danger":
        variantClasses = "bg-red-600/90 text-white hover:bg-red-700 border border-red-500/30";
        break;
      case "outline":
        variantClasses = "bg-transparent text-white border border-white/20 hover:bg-white/10";
        break;
      case "ghost":
        variantClasses = "bg-transparent text-white hover:bg-white/10 border border-transparent";
        break;
    }

    let sizeClasses = "";
    switch (size) {
      case "default":
        sizeClasses = "h-10 px-4 py-2";
        break;
      case "sm":
        sizeClasses = "h-8 px-3 text-xs";
        break;
      case "lg":
        sizeClasses = "h-12 px-8 text-lg";
        break;
      case "icon":
        sizeClasses = "h-10 w-10";
        break;
    }

    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50";
    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

    return (
      <button
        className={combinedClasses}
        ref={ref}
        {...props}
      >{icon}{children}</button>
    )
  }
)
AdminButton.displayName = "AdminButton"
