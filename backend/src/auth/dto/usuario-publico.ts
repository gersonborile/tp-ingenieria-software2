import { Prisma, RolUsuario } from '../../generated/prisma/client.js';

/** Lista explícita de campos públicos: nunca incluye `passwordHash`. */
export const SELECCION_USUARIO_PUBLICO = {
  id: true,
  nombre: true,
  contacto: true,
  email: true,
  rol: true,
} satisfies Prisma.UsuarioSelect;

export type UsuarioPublico = {
  id: string;
  nombre: string;
  contacto: string | null;
  email: string;
  rol: RolUsuario;
};

/** Descarta cualquier credencial que venga en el objeto de Prisma. */
export function aUsuarioPublico(usuario: UsuarioPublico): UsuarioPublico {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    contacto: usuario.contacto,
    email: usuario.email,
    rol: usuario.rol,
  };
}
