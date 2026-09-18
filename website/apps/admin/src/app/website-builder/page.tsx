import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Builder | Baqueano Command Center",
};

export default function WebsiteBuilderPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Website Builder</h1>
          <p className="text-slate-400 mt-1">
            Diseña y administra el contenido estático y dinámico de la página principal sin tocar código.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-md hover:bg-slate-700 transition-colors text-sm font-medium">
            Previsualizar
          </button>
          <button className="px-4 py-2 bg-[#F65E01] text-white rounded-md hover:bg-[#D95301] transition-colors text-sm font-medium">
            Guardar y Publicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Bloques */}
        <div className="lg:col-span-1 border border-slate-800 bg-[#0F172A]/50 backdrop-blur-xl rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Bloques Disponibles</h2>
          <div className="flex flex-col gap-2">
            {[
              "Hero Banner",
              "Carrusel de Destinos",
              "Grilla de Negocios",
              "Texto con Imagen",
              "Mapa Interactivo",
              "Baqueano AI Prompt"
            ].map((block) => (
              <div 
                key={block}
                className="p-3 border border-slate-700/50 bg-slate-800/50 rounded-lg text-slate-300 text-sm cursor-grab hover:bg-slate-700 transition-colors"
              >
                + {block}
              </div>
            ))}
          </div>
        </div>

        {/* Lienzo de la Página */}
        <div className="lg:col-span-3 border border-slate-800 bg-[#0F172A]/50 backdrop-blur-xl rounded-xl p-6 min-h-[600px] flex flex-col gap-4">
          
          {/* Bloque: Hero Banner */}
          <div className="relative group border border-slate-700 bg-slate-800/30 rounded-lg p-6">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">✏️</button>
              <button className="p-1.5 bg-red-900/50 text-red-400 rounded hover:bg-red-900">🗑️</button>
            </div>
            <h3 className="text-slate-200 font-semibold mb-2">Hero Banner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Título Principal</label>
                <input type="text" defaultValue="Descubre Nicaragua" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Fondo (URL)</label>
                <input type="text" defaultValue="https://firebasestorage.../hero.jpg" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-sm" />
              </div>
            </div>
          </div>

          {/* Bloque: Carrusel */}
          <div className="relative group border border-slate-700 bg-slate-800/30 rounded-lg p-6">
             <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">✏️</button>
              <button className="p-1.5 bg-red-900/50 text-red-400 rounded hover:bg-red-900">🗑️</button>
            </div>
            <h3 className="text-slate-200 font-semibold mb-2">Carrusel de Destinos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Filtro por Departamento</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-sm">
                  <option>Todos</option>
                  <option>León</option>
                  <option>Granada</option>
                  <option>Rivas</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Límite de Ítems</label>
                <input type="number" defaultValue={6} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-sm" />
              </div>
            </div>
          </div>

          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex items-center justify-center text-slate-500 text-sm">
            Arrastra más bloques aquí para construir la página
          </div>

        </div>
      </div>
    </div>
  );
}
