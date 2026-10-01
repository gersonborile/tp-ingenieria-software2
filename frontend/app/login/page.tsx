import type { Metadata } from "next";
import Link from "next/link";

import { TarjetaAuth } from "@/app/componentes/auth";
import { FormularioLogin } from "@/app/login/formulario-login";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function PaginaLogin() {
  return (
    <TarjetaAuth
      titulo="Iniciar sesión"
      pie={
        <p className="text-neutral-600">
          ¿No tenés cuenta?{" "}
          <Link
            href="/registro"
            className="font-medium text-neutral-900 underline underline-offset-4"
          >
            Registrate
          </Link>
        </p>
      }
    >
      <FormularioLogin />
    </TarjetaAuth>
  );
}
