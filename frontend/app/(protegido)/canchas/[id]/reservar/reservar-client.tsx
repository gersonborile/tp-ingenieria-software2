"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

import { crearReserva, obtenerCancha, obtenerEquipamiento } from "@/lib/mock-reservas";
import { diaSemana, formatearFecha, sumarUnaHora } from "@/lib/fechas";
import { leerClaims, leerToken } from "@/lib/sesion";

export default function ReservarClient({ canchaId }: { canchaId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [cantidades, setCantidades] = useState<Record<string, number>>({});

  const fecha = searchParams.get("fecha") ?? "";
  const hora = searchParams.get("hora") ?? "";
  const cancha = obtenerCancha(canchaId);

  function alternarEquipamiento(id: string) {
    setMarcados((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function cambiarCantidad(id: string, valor: string, stock: number) {
    const cantidad = Math.trunc(Number(valor));
    if (Number.isNaN(cantidad)) return;
    const limitada = Math.min(Math.max(cantidad, 1), stock);
    setCantidades((prev) => ({ ...prev, [id]: limitada }));
  }

  if (!cancha || !fecha || !hora) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-neutral-900">
          Confirmar reserva
        </h1>
        <p className="mb-4 text-neutral-600">No encontramos el turno elegido.</p>
        <Link
          href="/canchas"
          className="inline-block rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Cambiar turno
        </Link>
      </div>
    );
  }

  const equipamiento = obtenerEquipamiento(cancha.disciplina);
  const seleccionados = equipamiento
    .filter((item) => marcados[item.id])
    .map((item) => ({
      equipamientoId: item.id,
      nombre: item.nombre,
      cantidad: cantidades[item.id] ?? 1,
    }));
  const textoEquipamiento =
    seleccionados.length > 0
      ? seleccionados
          .map((item) => `${item.cantidad} ${item.nombre.toLowerCase()}`)
          .join(", ")
      : "Sin equipamiento";

  function confirmarReserva() {
    const token = leerToken();
    const claims = token ? leerClaims(token) : null;
    if (!claims) return;
    crearReserva({
      usuarioId: claims.userId,
      canchaId,
      fecha,
      hora,
      equipamiento: seleccionados,
    });
    router.push("/");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        <Link
          href="/canchas"
          className="underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          Canchas
        </Link>
        <span aria-hidden="true">&gt;</span>
        <span>
          {cancha.nombre} · {cancha.disciplina}
        </span>
        <span aria-hidden="true">&gt;</span>
        <span className="text-neutral-900">Reservar</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        Confirmar reserva
      </h1>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[62fr_38fr]">
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Turno seleccionado
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-neutral-900">
                  {cancha.nombre} · {cancha.disciplina}
                </p>
                <p className="mt-1 text-sm text-neutral-700">
                  {diaSemana(fecha)} {formatearFecha(fecha)} · {hora} a{" "}
                  {sumarUnaHora(hora)} hs
                </p>
              </div>
              <Link
                href="/canchas"
                className="shrink-0 rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Cambiar turno
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Equipamiento (opcional)
            </h2>
            <div>
              {equipamiento.map((item, indice) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 py-3 ${
                    indice > 0 ? "border-t border-neutral-200" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`equipamiento-${item.id}`}
                    checked={marcados[item.id] ?? false}
                    onChange={() => alternarEquipamiento(item.id)}
                    className="h-4 w-4 accent-neutral-900"
                  />
                  <label
                    htmlFor={`equipamiento-${item.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="block text-sm font-medium text-neutral-900">
                      {item.nombre}
                    </span>
                    <span className="block text-xs text-neutral-500">
                      {item.stockDisponible} disponibles
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={item.stockDisponible}
                    value={cantidades[item.id] ?? 1}
                    onChange={(e) =>
                      cambiarCantidad(item.id, e.target.value, item.stockDisponible)
                    }
                    className="w-16 rounded border border-neutral-300 px-2 py-1 text-right text-sm"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Resumen
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-neutral-500">Cancha</dt>
                <dd className="text-right font-medium text-neutral-900">
                  {cancha.nombre} · {cancha.disciplina}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-neutral-500">Fecha</dt>
                <dd className="text-right font-medium text-neutral-900">
                  {formatearFecha(fecha)}, {hora}hs
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-neutral-500">Equipamiento</dt>
                <dd className="text-right font-medium text-neutral-900">
                  {textoEquipamiento}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-neutral-500">Estado de pago</dt>
                <dd className="text-right font-medium text-neutral-900">
                  Pendiente
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-neutral-200 pt-4">
              <span className="text-sm font-medium text-neutral-700">
                Monto total
              </span>
              <span className="text-2xl font-bold text-neutral-900">$0</span>
            </div>
            <button
              type="button"
              onClick={confirmarReserva}
              className="mt-4 w-full rounded bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Confirmar reserva
            </button>
            <p className="mt-2 text-center text-xs text-neutral-500">
              Podés cancelar hasta 2 horas antes del turno
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
