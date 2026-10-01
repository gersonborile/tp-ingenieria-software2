"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { obtenerPerfil } from "@/lib/api";
import { borrarToken } from "@/lib/sesion";
import type { UsuarioPublico } from "@/lib/tipos";

type Estado = "cargando" | "anonimo" | "autenticado";

export function PanelSesion() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [usuario, setUsuario] = useState<UsuarioPublico | null>(null);

  // Al montar, y al volver a la pestaña, se consulta el recurso protegido: si la
  // respuesta no llega, la sesión se descarta y el cliente queda sin autenticar.
  useEffect(() => {
    let vigente = true;

    async function verificar() {
      const perfil = await obtenerPerfil().catch(() => null);
      if (!vigente) return;
      if (perfil) {
        setUsuario(perfil);
        setEstado("autenticado");
        return;
      }
      borrarToken();
      setUsuario(null);
      setEstado("anonimo");
    }

    void verificar();

    const alVolver = () => void verificar();
    window.addEventListener("focus", alVolver);
    window.addEventListener("storage", alVolver);
    return () => {
      vigente = false;
      window.removeEventListener("focus", alVolver);
      window.removeEventListener("storage", alVolver);
    };
  }, []);

  function cerrarSesion() {
    borrarToken();
    setUsuario(null);
    setEstado("anonimo");
  }

  if (estado === "cargando") {
    return <div className="h-24 w-full max-w-md rounded-xl border border-neutral-200 bg-white" />;
  }

  if (estado === "anonimo" || !usuario) {
    return (
      <section className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-6 text-center">
        <p className="text-sm text-neutral-600">No iniciaste sesión.</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            Crear cuenta
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex w-full max-w-md flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-6 text-center">
      <p className="text-sm text-neutral-600">Sesión iniciada</p>
      <p className="text-lg font-semibold tracking-tight">Hola, {usuario.nombre}</p>
      <p className="text-sm text-neutral-500">{usuario.email}</p>
      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
        {usuario.rol}
      </span>
      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
      >
        Cerrar sesión
      </button>
    </section>
  );
}
