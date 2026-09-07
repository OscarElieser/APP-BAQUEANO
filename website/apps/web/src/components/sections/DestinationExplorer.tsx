"use client";

/**
 * WHY
 * Turns `/destinos` into an actual browser-side explorer while Firebase integration matures.
 *
 * HOW
 * Filters service-fed records locally by search, department, difficulty, and category.
 *
 * WHAT
 * Search, filter, sort, save-ready controls, and responsive place grid.
 */
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PlaceRecord } from "@baqueano/types";
import { StatusChip } from "@baqueano/ui";
import { PlaceCard } from "../cards/PlaceCard";

export function DestinationExplorer({ places }: { places: readonly PlaceRecord[] }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("rating");

  const departments = useMemo(() => Array.from(new Set(places.map((place) => place.departmentName))).sort(), [places]);
  const categories = useMemo(() => Array.from(new Set(places.map((place) => place.categoryName))).sort(), [places]);
  const visiblePlaces = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return places
      .filter((place) => department === "all" || place.departmentName === department)
      .filter((place) => category === "all" || place.categoryName === category)
      .filter((place) => !normalizedSearch || `${place.name} ${place.description} ${place.municipalityName}`.toLowerCase().includes(normalizedSearch))
      .sort((left, right) => sort === "name" ? left.name.localeCompare(right.name) : right.rating - left.rating);
  }, [category, department, places, search, sort]);

  return (
    <section className="mt-8">
      <div className="grid gap-3 rounded-md border border-white/12 bg-white/[0.06] p-4 lg:grid-cols-[1fr_180px_180px_160px]">
        <label className="flex min-h-12 items-center gap-3 rounded-md bg-[#061018]/72 px-4 text-white/72">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-white/45" placeholder="Buscar volcan, playa, comunidad o municipio" aria-label="Buscar destinos" />
        </label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)} className="focus-ring min-h-12 rounded-md border border-white/14 bg-[#061018] px-3 text-sm text-white" aria-label="Filtrar por departamento">
          <option value="all">Departamento</option>
          {departments.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="focus-ring min-h-12 rounded-md border border-white/14 bg-[#061018] px-3 text-sm text-white" aria-label="Filtrar por categoria">
          <option value="all">Categoria</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="focus-ring min-h-12 rounded-md border border-white/14 bg-[#061018] px-3 text-sm text-white" aria-label="Ordenar destinos">
          <option value="rating">Valoracion</option>
          <option value="name">Nombre</option>
        </select>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Municipio", "Precio", "Dificultad", "Tipo de experiencia", "Sostenibilidad", "Guardar"].map((filter) => <StatusChip key={filter}>{filter}</StatusChip>)}
      </div>
      <div className="mt-8 flex items-center gap-2 font-tech text-xs uppercase text-white/55">
        <SlidersHorizontal size={16} /> {visiblePlaces.length} registros visibles
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visiblePlaces.map((place) => <PlaceCard key={place.placeId} place={place} />)}
      </div>
      {visiblePlaces.length === 0 ? (
        <div className="mt-8 rounded-md border border-white/12 bg-white/[0.06] p-8 text-center text-white/68">No hay resultados con esos filtros.</div>
      ) : null}
    </section>
  );
}
