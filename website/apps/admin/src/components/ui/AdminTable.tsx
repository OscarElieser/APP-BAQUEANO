import * as React from "react"

/**
 * WHY
 * Estandariza la presentación de datos tabulares (destinos, negocios, usuarios) con el tema Matte.
 *
 * HOW
 * Un conjunto de componentes composables (Table, TableHeader, TableRow, TableCell) para 
 * mantener flexibilidad pero forzar la paleta y espaciado correcto.
 */

export function AdminTable({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-white/10 bg-white/[0.02]">
      <table className={`w-full caption-bottom text-sm ${className ?? ""}`} {...props} />
    </div>
  )
}

export function AdminTableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={`border-b border-white/10 bg-[#08111f]/60 ${className ?? ""}`} {...props} />
}

export function AdminTableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className ?? ""}`} {...props} />
}

export function AdminTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-white/5 transition-colors hover:bg-white/[0.04] data-[state=selected]:bg-white/[0.06] ${className ?? ""}`}
      {...props}
    />
  )
}

export function AdminTableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-12 px-4 text-left align-middle font-tech text-xs font-semibold uppercase tracking-wider text-[#F4E6C1]/80 ${className ?? ""}`}
      {...props}
    />
  )
}

export function AdminTableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-4 align-middle ${className ?? ""}`}
      {...props}
    />
  )
}
