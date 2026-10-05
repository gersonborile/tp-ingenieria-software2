"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import type { Disciplina, Franja } from "@/lib/mock-reservas";
import { obtenerCanchas, obtenerFranjas } from "@/lib/mock-reservas";

function obtenerFechaLocalHoy(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

const disciplinas: Array<Disciplina | "Todas"> = ["Todas", "Tenis", "Fútbol 5", "Pádel"];
const franjasHorario = [
  "Cualquiera",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

export default function CanchasClient() {
  const searchParams = useSearchParams();
  const disciplinaParam = searchParams.get("disciplina") as Disciplina | null;

  const [disciplinaEnEdicion, setDisciplinaEnEdicion] = useState<Disciplina | "Todas">(
    disciplinaParam ?? "Todas"
  );
  const [fechaEnEdicion, setFechaEnEdicion] = useState(obtenerFechaLocalHoy);
  const [horarioEnEdicion, setHorarioEnEdicion] = useState("Cualquiera");

  const [disciplinaAplicada, setDisciplinaAplicada] = useState<Disciplina | "Todas">(
    disciplinaParam ?? "Todas"
  );
  const [fechaAplicada, setFechaAplicada] = useState(obtenerFechaLocalHoy);
  const [horarioAplicado, setHorarioAplicado] = useState("Cualquiera");

  const canchasAplicadas = useMemo(() => {
    return obtenerCanchas({ disciplina: disciplinaAplicada });
  }, [disciplinaAplicada]);

  const franjasPorCancha = useMemo(() => {
    const franjas: Record<string, Franja[]> = {};
    for (const cancha of canchasAplicadas) {
      franjas[cancha.id] = obtenerFranjas(cancha.id, fechaAplicada);
    }
    return franjas;
  }, [canchasAplicadas, fechaAplicada]);

  function aplicarFiltros() {
    setDisciplinaAplicada(disciplinaEnEdicion);
    setFechaAplicada(fechaEnEdicion);
    setHorarioAplicado(horarioEnEdicion);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        Canchas y disponibilidad
      </h1>
      <p className="text-neutral-600 mb-6">
        Elegí disciplina, fecha y horario para ver los turnos libres
      </p>

      <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Disciplina
          </label>
          <select
            value={disciplinaEnEdicion}
            onChange={(e) =>
              setDisciplinaEnEdicion(e.target.value as Disciplina | "Todas")
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded"
          >
            {disciplinas.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={fechaEnEdicion}
            onChange={(e) => setFechaEnEdicion(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Horario
          </label>
          <select
            value={horarioEnEdicion}
            onChange={(e) => setHorarioEnEdicion(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded"
          >
            {franjasHorario.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={aplicarFiltros}
          className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800"
        >
          Buscar
        </button>
      </div>

      <div className="space-y-4">
        {canchasAplicadas.map((cancha) => {
          const franjas = franjasPorCancha[cancha.id] || [];
          return (
            <div
              key={cancha.id}
              className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-4"
            >
              <div className="w-24 h-24 bg-neutral-200 rounded flex-shrink-0" />
              <div className="flex-1">
                <h2 className="font-semibold text-neutral-900">
                  {cancha.nombre}
                </h2>
                <p className="text-sm text-neutral-600 mb-3">
                  {cancha.disciplina}
                </p>
                <div className="flex flex-wrap gap-2">
                  {franjas.map((franja) => {
                    const mostrarFranja =
                      horarioAplicado === "Cualquiera" || horarioAplicado === franja.hora;
                    if (!mostrarFranja) return null;

                    if (franja.ocupada) {
                      return (
                        <button
                          key={franja.hora}
                          type="button"
                          disabled
                          className="px-3 py-1 text-sm bg-neutral-100 text-neutral-400 rounded border border-neutral-300 line-through cursor-not-allowed"
                        >
                          {franja.hora}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={franja.hora}
                        href={`/canchas/${cancha.id}/reservar?fecha=${fechaAplicada}&hora=${franja.hora}`}
                        className="px-3 py-1 text-sm bg-white text-neutral-900 rounded border border-neutral-300 hover:bg-neutral-50"
                      >
                        {franja.hora}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}