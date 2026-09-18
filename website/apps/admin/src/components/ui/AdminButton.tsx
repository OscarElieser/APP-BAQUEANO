import * as React from "react"

/**
 * WHY
 * Estandariza la acción principal interactiva para mantener el diseño Matte Premium.
 *
 * HOW
 * Usa variantes de Tailwind para manejar estados (primary, secondary, danger, ghost) sin repetir código.
 * Evita la opacidad estándar, utilizando `.withValues()` o rgba explícito en el diseño si es necesario, 
 * aunque aquí en Tailwind se usarán colores sólidos y bordes para mantener la legibilidad.
 * 
 * WHAT
 * Componente botón reusable que soporta `asChild` para fusionarse con `Link`.
 */

export interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className = "", variant = "primary", size = "default", ...props }, ref) => {
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
      />
    )
  }
)
AdminButton.displayName = "AdminButton"
