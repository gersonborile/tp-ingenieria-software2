import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { MENSAJE_SESION_INVALIDA } from '../mensajes.js';

/**
 * Guard global: exige un token Bearer válido salvo en las rutas marcadas con
 * `@Public()`. Sin token, con token inválido o vencido responde 401.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    const esPublico = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) {
      return true;
    }
    return super.canActivate(context);
  }

  override handleRequest<TUsuario>(
    error: unknown,
    usuario: TUsuario,
  ): TUsuario {
    if (error || !usuario) {
      throw new UnauthorizedException(MENSAJE_SESION_INVALIDA);
    }
    return usuario;
  }
}
