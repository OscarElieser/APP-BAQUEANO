"use client";

import { useEffect, useState } from "react";
import { getWebsitePage, saveWebsitePage } from "@baqueano/firebase";
import type { WebsitePage, WebsiteBlock } from "@baqueano/types";
import { Plus, GripVertical, Trash2, Save, LayoutTemplate } from "lucide-react";

export default function WebsiteBuilderPage() {
  const [pageData, setPageData] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await getWebsitePage("home");
        if (data) {
          setPageData(data);
        } else {
          // Initialize empty if doesn't exist
          setPageData({
            id: "home",
            title: "Inicio Baqueano",
            path: "/",
            status: "published",
            updatedAt: new Date().toISOString(),
            blocks: []
          });
        }
      } catch (err) {
        console.error("Failed to load page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  const handleSave = async () => {
    if (!pageData) return;
    setSaving(true);
    try {
      await saveWebsitePage("home", {
        title: pageData.title,
        path: pageData.path,
        status: pageData.status,
        updatedAt: new Date().toISOString(),
        blocks: pageData.blocks
      });
      alert("Página guardada y publicada exitosamente.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar la página.");
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: string) => {
    if (!pageData) return;
    const newBlock: WebsiteBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      props: type === "HeroBanner" ? { title: "Nuevo Hero", image: "" } :
             type === "DestinationsGrid" ? { limit: 6 } :
             type === "NarrativeSection" ? { content: "Texto nuevo" } : {}
    };
    setPageData({ ...pageData, blocks: [...pageData.blocks, newBlock] });
  };

  const removeBlock = (id: string) => {
    if (!pageData) return;
    setPageData({
      ...pageData,
      blocks: pageData.blocks.filter((b) => b.id !== id)
    });
  };

  const updateBlockProp = (id: string, propKey: string, propValue: any) => {
    if (!pageData) return;
    setPageData({
      ...pageData,
      blocks: pageData.blocks.map((b) => {
        if (b.id === id) {
          return { ...b, props: { ...b.props, [propKey]: propValue } };
        }
        return b;
      })
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="flex h-4 w-4 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#165D6F] opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#165D6F]" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-white/10 bg-gradient-to-r from-[#0a1b24] via-[#0d222e] to-[#08131a] p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#165D6F] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#165D6F]" />
            </span>
            <p className="font-tech text-xs font-bold uppercase tracking-widest text-[#F65E01]">
              CONTENT MANAGEMENT SYSTEM &bull; FASE 6
            </p>
          </div>
          <h1 className="mt-1 font-display text-2xl font-black text-white lg:text-3xl">Website Builder</h1>
          <p className="mt-1 text-sm text-white/70">
            Diseña y administra el contenido de la página principal en tiempo real.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F65E01] text-white rounded-md hover:bg-[#D95301] transition-colors text-sm font-bold disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar y Publicar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Bloques */}
        <div className="lg:col-span-1 border border-white/10 bg-[#061018] rounded-xl p-4 self-start sticky top-24">
          <h2 className="text-xs font-bold text-white/50 mb-4 uppercase tracking-wider flex items-center gap-2">
            <LayoutTemplate size={14} /> Bloques Disponibles
          </h2>
          <div className="flex flex-col gap-2">
            {[
              { id: "HeroBanner", label: "Hero Banner (Principal)" },
              { id: "DestinationsGrid", label: "Grilla de Destinos" },
              { id: "NarrativeSection", label: "Sección Narrativa" },
              { id: "BaqueanoAI", label: "Prompt Baqueano AI" }
            ].map((block) => (
              <button 
                key={block.id}
                onClick={() => addBlock(block.id)}
                className="flex items-center gap-2 p-3 border border-white/5 bg-white/[0.02] rounded-lg text-white/80 text-sm hover:bg-white/10 hover:border-white/20 transition-all font-semibold"
              >
                <Plus size={16} className="text-[#10B981]" /> {block.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lienzo de la Página */}
        <div className="lg:col-span-3 border border-white/10 bg-[#08111f] rounded-xl p-6 min-h-[600px] flex flex-col gap-4">
          {pageData?.blocks.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 rounded-lg p-12 flex flex-col items-center justify-center text-white/40 text-sm h-full">
              <LayoutTemplate size={48} className="mb-4 opacity-20" />
              <p>Arrastra o añade bloques desde el panel izquierdo para construir la página</p>
            </div>
          ) : (
            pageData?.blocks.map((block, index) => (
              <div key={block.id} className="group relative border border-white/10 bg-white/[0.02] rounded-lg p-6 hover:border-white/20 transition-colors">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-white/20 hover:text-white/50">
                  <GripVertical size={20} />
                </div>
                
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => removeBlock(block.id)}
                    className="p-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded hover:bg-[#EF4444]/20 border border-[#EF4444]/20"
                    title="Eliminar bloque"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="pl-6">
                  <h3 className="text-[#F4E6C1] font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                    {index + 1}. {block.type}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Render fields dynamically based on block type */}
                    {block.type === "HeroBanner" && (
                      <>
                        <div>
                          <label className="text-xs text-white/50 mb-1.5 block font-bold uppercase">Título Principal</label>
                          <input 
                            type="text" 
                            value={block.props.title || ""} 
                            onChange={(e) => updateBlockProp(block.id, "title", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-white text-sm focus:border-[#165D6F] focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-white/50 mb-1.5 block font-bold uppercase">URL Imagen Fondo</label>
                          <input 
                            type="text" 
                            value={block.props.image || ""} 
                            onChange={(e) => updateBlockProp(block.id, "image", e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-white text-sm focus:border-[#165D6F] focus:outline-none" 
                          />
                        </div>
                      </>
                    )}

                    {block.type === "DestinationsGrid" && (
                      <>
                        <div>
                          <label className="text-xs text-white/50 mb-1.5 block font-bold uppercase">Límite de Destinos</label>
                          <input 
                            type="number" 
                            value={block.props.limit || 6} 
                            onChange={(e) => updateBlockProp(block.id, "limit", Number(e.target.value))}
                            className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-white text-sm focus:border-[#165D6F] focus:outline-none" 
                          />
                        </div>
                      </>
                    )}

                    {block.type === "NarrativeSection" && (
                      <div className="col-span-1 md:col-span-2">
                        <label className="text-xs text-white/50 mb-1.5 block font-bold uppercase">Contenido Markdown</label>
                        <textarea 
                          value={block.props.content || ""} 
                          onChange={(e) => updateBlockProp(block.id, "content", e.target.value)}
                          rows={4}
                          className="w-full bg-black/50 border border-white/10 rounded p-2.5 text-white text-sm focus:border-[#165D6F] focus:outline-none" 
                        />
                      </div>
                    )}
                    
                    {block.type === "BaqueanoAI" && (
                      <div className="col-span-1 md:col-span-2 text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 p-3 rounded-lg">
                        El bloque de Baqueano AI no requiere propiedades adicionales. Se renderiza automáticamente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
