"use client";

import { useState } from "react";
import { Search, Image as ImageIcon, Video, FolderOpen, HardDrive, Link } from "lucide-react";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "../../components/ui/AdminTable";
import { AdminBadge } from "../../components/ui/AdminBadge";

const initialAssets = [
  { id: "asset-101", name: "hero-ometepe.webp", type: "Imagen", folder: "/website/hero", size: "1.2 MB", status: "optimized" },
  { id: "asset-102", name: "promo-video.mp4", type: "Video", folder: "/marketing/social", size: "45 MB", status: "raw" },
  { id: "asset-103", name: "logo-baqueano-white.svg", type: "Vector", folder: "/system/brand", size: "12 KB", status: "optimized" },
  { id: "asset-104", name: "gallery-canon-somoto-1.jpg", type: "Imagen", folder: "/destinations/gallery", size: "3.4 MB", status: "processing" }
];

export default function MultimediaAdminPage() {
  const [assets] = useState(initialAssets);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white">Multimedia & Asset Manager</h1>
          <p className="font-tech text-sm text-white/60">Gestión centralizada de imágenes, videos y vectores alojados en Firebase Storage.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex w-full items-center gap-2 px-2 text-white/50">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre de archivo o ruta..."
            className="w-full bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>Archivo / Asset</AdminTableHead>
              <AdminTableHead>Ruta de Storage</AdminTableHead>
              <AdminTableHead>Peso</AdminTableHead>
              <AdminTableHead>Estado CDN</AdminTableHead>
              <AdminTableHead className="text-right">Enlace</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {assets.map((asset) => (
              <AdminTableRow key={asset.id} className="group hover:bg-slate-800/50 transition-colors">
                <AdminTableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165D6F]/20 text-[#165D6F]">
                      {asset.type === "Video" ? <Video size={16} /> : <ImageIcon size={16} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{asset.name}</span>
                      <span className="font-tech text-xs text-slate-500 uppercase">{asset.type}</span>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <FolderOpen size={14} className="text-[#F65E01]" />
                    <span className="font-mono text-xs">{asset.folder}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <HardDrive size={14} className="text-slate-500" />
                    <span className="font-tech text-sm">{asset.size}</span>
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <AdminBadge variant={
                    asset.status === "optimized" ? "green" :
                    asset.status === "processing" ? "orange" : "neutral"
                  }>
                    {asset.status === "optimized" ? "Optimizado" : asset.status === "processing" ? "Procesando" : "Original"}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <button className="rounded p-1.5 text-white/40 hover:bg-white/10 hover:text-[#10B981] transition-colors" title="Copiar URL">
                    <Link size={18} />
                  </button>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      </div>
    </div>
  );
}
