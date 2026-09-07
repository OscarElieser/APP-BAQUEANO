"use client";

// ============================================================================
// 🧭 BAQUEANO ECOSYSTEM — DESTINATION EXPLORER COMPONENT
// ============================================================================
//
// 🎯 1. POR QUÉ (WHY / PROPÓSITO):
// Convertir la vista `/destinos` en un motor de descubrimiento dinámico,
// intuitivo y resiliente para el explorador, facilitando la búsqueda por
// municipios, categorías y departamentos con tolerancia a diacríticos y tildes.
//
// ⚙️ 2. CÓMO (HOW / ARQUITECTURA & IMPLEMENTACIÓN):
// - Filtro reactivo en cliente optimizado mediante `useMemo` para evitar re-cálculos innecesarios.
// - Normalización de búsqueda por diacríticos Unicode NFD (`normalizeSearchText`).
// - Disparo de telemetría segura (`trackEvent`) para registrar búsquedas y cero resultados sin PII.
//
// 📦 3. QUÉ (WHAT / ENTREGABLES & FUNCIONALIDAD):
// - Componente exportado: `DestinationExplorer({ places })`.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PlaceRecord } from "@baqueano/types";
import { StatusChip } from "@baqueano/ui";
import { PlaceCard } from "../cards/PlaceCard";
import { normalizeSearchText } from "../../utils/place";
import { trackEvent } from "../../services/analytics.service";

export function DestinationExplorer({ places }: { places: readonly PlaceRecord[] }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("rating");

  const departments = useMemo(() => Array.from(new Set(places.map((place) => place.departmentName))).sort(), [places]);
  const categories = useMemo(() => Array.from(new Set(places.map((place) => place.categoryName))).sort(), [places]);

  const visiblePlaces = useMemo(() => {
    const normalizedQuery = normalizeSearchText(search);

    return places
      .filter((place) => department === "all" || place.departmentName === department)
      .filter((place) => category === "all" || place.categoryName === category)
      .filter((place) => {
        if (!normalizedQuery) {
          return true;
        }
        const placeSearchCorpus = normalizeSearchText(
          `${place.name} ${place.description} ${place.municipalityName} ${place.departmentName} ${place.categoryName}`
        );
        return placeSearchCorpus.includes(normalizedQuery);
      })
      .sort((left, right) => (sort === "name" ? left.name.localeCompare(right.name) : right.rating - left.rating));
  }, [category, department, places, search, sort]);

  // Telemetría de búsqueda y cero resultados
  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(() => {
      if (visiblePlaces.length === 0) {
        trackEvent("search_zero_results", {
          normalized_term: normalizeSearchText(trimmed),
          attempted_category: category !== "all" ? category : undefined,
        });
      } else {
        trackEvent("search_executed", {
          query_length: trimmed.length,
          normalized_term: normalizeSearchText(trimmed),
          result_count: visiblePlaces.length,
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [search, visiblePlaces.length, category]);

  return (
    <section className="mt-8">
      <div className="grid gap-3 rounded-md border border-white/12 bg-white/[0.06] p-4 lg:grid-cols-[1fr_180px_180px_160px]">
        <label className="flex min-h-12 items-center gap-3 rounded-md bg-[#061018]/72 px-4 text-white/72">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/45"
            placeholder="Buscar volcán, playa, comunidad o municipio"
            aria-label="Buscar destinos"
          />
        </label>
        <select
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          className="focus-ring min-h-12 rounded-md border border-white/14 bg-[#061018] px-3 text-sm text-white"
          aria-label="Filtrar por departamento"
        >
          <option value="all">Departamento</option>
          {departments.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="focus-ring min-h-12 rounded-md border border-white/14 bg-[#061018] px-3 text-sm text-white"
          aria-label="Filtrar por categoría"
        >
          <option value="all">Categoría</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="focus-ring min-h-12 rounded-md border border-white/14 bg-[#061018] px-3 text-sm text-white"
          aria-label="Ordenar destinos"
        >
          <option value="rating">Valoración</option>
          <option value="name">Nombre</option>
        </select>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Municipio", "Precio", "Dificultad", "Tipo de experiencia", "Sostenibilidad", "Guardar"].map((filter) => (
          <StatusChip key={filter}>{filter}</StatusChip>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-2 font-tech text-xs uppercase text-white/55">
        <SlidersHorizontal size={16} /> {visiblePlaces.length} registros visibles
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visiblePlaces.map((place) => (
          <PlaceCard key={place.placeId} place={place} />
        ))}
      </div>
      {visiblePlaces.length === 0 ? (
        <div className="mt-8 rounded-md border border-white/12 bg-white/[0.06] p-8 text-center text-white/68">
          No se encontraron destinos con esos criterios de búsqueda. Prueba explorando otros municipios o departamentos.
        </div>
      ) : null}
    </section>
  );
}
