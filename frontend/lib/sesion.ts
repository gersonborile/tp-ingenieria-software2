import type { Rol, SesionEnToken } from "@/lib/tipos";

const CLAVE_TOKEN = "clubDeportivo.token";

function esRol(valor: unknown): valor is Rol {
  return valor === "usuario" || valor === "administrador";
}

export function guardarToken(token: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(CLAVE_TOKEN, token);
    return true;
  } catch {
    return false;
  }
}

export function leerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function borrarToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Si el almacenamiento no está disponible la sesión ya no es recuperable.
  }
}

function decodificarPayload(token: string): unknown {
  const segmentos = token.split(".");
  if (segmentos.length !== 3) return null;
  try {
    const base64 = segmentos[1].replace(/-/g, "+").replace(/_/g, "/");
    const relleno = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(window.atob(relleno));
  } catch {
    return null;
  }
}

/** Claims del token de sesión: identidad y rol. `null` si el token es ilegible. */
export function leerClaims(token: string): SesionEnToken | null {
  const payload = decodificarPayload(token) as Partial<SesionEnToken> | null;
  if (
    !payload ||
    typeof payload.userId !== "string" ||
    typeof payload.nombre !== "string" ||
    typeof payload.email !== "string" ||
    !esRol(payload.rol)
  ) {
    return null;
  }

  return {
    userId: payload.userId,
    nombre: payload.nombre,
    email: payload.email,
    rol: payload.rol,
  };
}
