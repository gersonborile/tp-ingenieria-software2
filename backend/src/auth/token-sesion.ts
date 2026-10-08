import { RolUsuario } from '../generated/prisma/client.js';

/** Claims del token de sesión: identidad y rol del usuario autenticado. */
export type TokenSesion = {
  userId: string;
  email: string;
  rol: RolUsuario;
};
