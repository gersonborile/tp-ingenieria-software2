import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../generated/prisma/client.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { MENSAJE_SESION_INVALIDA, MENSAJE_SIN_PERMISOS } from '../mensajes.js';
import { TokenSesion } from '../token-sesion.js';

/**
 * Guard global que aplica `@Roles(...)`: sin rol declarado deja pasar, y con rol
 * declarado exige que el token lo incluya. Rol insuficiente responde 403.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user?: TokenSesion }>();
    if (!user) {
      throw new UnauthorizedException(MENSAJE_SESION_INVALIDA);
    }
    if (!rolesRequeridos.includes(user.rol)) {
      throw new ForbiddenException(MENSAJE_SIN_PERMISOS);
    }
    return true;
  }
}
