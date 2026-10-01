import type { Metadata } from "next";
import Link from "next/link";

import { TarjetaAuth } from "@/app/componentes/auth";
import { FormularioRegistro } from "@/app/registro/formulario-registro";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function PaginaRegistro() {
  return (
    <TarjetaAuth
      titulo="Crear cuenta"
      pie={
        <p className="text-neutral-600">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-neutral-900 underline underline-offset-4"
          >
            Iniciá sesión
          </Link>
        </p>
      }
    >
      <FormularioRegistro />
    </TarjetaAuth>
  );
}
