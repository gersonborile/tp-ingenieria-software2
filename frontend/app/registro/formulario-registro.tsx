"use client";

import Link from "next/link";
import { useState } from "react";

import { Aviso, Campo } from "@/app/componentes/auth";
import { ApiError, registrar } from "@/lib/api";
import type { CampoInvalido, DatosRegistro } from "@/lib/tipos";

const CAMPOS: {
  campo: keyof DatosRegistro;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  type?: "text" | "email" | "password";
}[] = [
  { campo: "nombre", label: "Nombre", autoComplete: "name" },
  { campo: "contacto", label: "Contacto", placeholder: "Teléfono o email" },
  {
    campo: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "tu@email.com",
  },
  {
    campo: "contrasena",
    label: "Contraseña",
    type: "password",
    autoComplete: "new-password",
  },
];

const VALOR_INICIAL: DatosRegistro = {
  nombre: "",
  contacto: "",
  email: "",
  contrasena: "",
};

export function FormularioRegistro() {
  const [datos, setDatos] = useState<DatosRegistro>(VALOR_INICIAL);
  const [errores, setErrores] = useState<CampoInvalido[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function errorDe(campo: string): string | undefined {
    return errores.find((error) => error.campo === campo)?.mensaje;
  }

  async function manejarEnvio(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrores([]);
    setMensaje(null);
    setExito(null);
    setEnviando(true);

    try {
      const usuario = await registrar(datos);
      setExito(`Listo, ${usuario.nombre}. Ya podés iniciar sesión.`);
      setDatos(VALOR_INICIAL);
    } catch (error) {
      if (error instanceof ApiError) {
        setMensaje(error.message);
        setErrores(error.campos);
      } else {
        setMensaje("No pudimos completar el registro. Intentá de nuevo.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso tono="exito">{exito}</Aviso>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={manejarEnvio} noValidate className="flex flex-col gap-4">
      {mensaje ? <Aviso tono="error">{mensaje}</Aviso> : null}

      {CAMPOS.map(({ campo, label, placeholder, autoComplete, type }) => (
        <Campo
          key={campo}
          id={campo}
          name={campo}
          label={label}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={datos[campo]}
          error={errorDe(campo)}
          onChange={(valor) => setDatos((anterior) => ({ ...anterior, [campo]: valor }))}
        />
      ))}

      <button
        type="submit"
        disabled={enviando}
        className="mt-2 w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
