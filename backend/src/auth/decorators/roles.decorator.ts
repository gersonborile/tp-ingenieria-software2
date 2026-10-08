import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';

/** Restringe la ruta a los roles indicados: `@Roles(RolUsuario.ADMINISTRADOR)`. */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
