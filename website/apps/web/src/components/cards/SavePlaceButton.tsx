"use client";

/**
 * WHY
 * Lets explorers test save behavior without implying account sync is live.
 *
 * HOW
 * Stores only local browser preferences and labels Firebase sync as pending.
 *
 * WHAT
 * Local-only save button for destination details.
 */
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export function SavePlaceButton({ placeId }: { placeId: string }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const localFavs = JSON.parse(localStorage.getItem("baqueano_favs") || "[]") as string[];
    setSaved(localFavs.includes(placeId));
    setReady(true);
  }, [placeId]);

  function handleToggle() {
    const localFavs = JSON.parse(localStorage.getItem("baqueano_favs") || "[]") as string[];
    const nextSaved = !saved;
    const nextFavs = nextSaved ? Array.from(new Set([...localFavs, placeId])) : localFavs.filter((id) => id !== placeId);
    localStorage.setItem("baqueano_favs", JSON.stringify(nextFavs));
    setSaved(nextSaved);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={!ready}
        className={`focus-ring flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-xs font-bold uppercase transition ${
          saved ? "border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444]" : "border-white/14 bg-white/[0.04] text-white hover:bg-white/10"
        }`}
      >
        <Heart size={16} className={saved ? "fill-[#EF4444] text-[#EF4444]" : ""} />
        <span>{saved ? "Guardado local" : "Guardar local"}</span>
      </button>
      <p className="text-center text-[10px] text-white/50">Sincronizacion Firebase pendiente de Auth.</p>
    </div>
  );
}
