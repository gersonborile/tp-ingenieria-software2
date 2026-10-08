import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenSesion } from '../token-sesion.js';

/** Claims del usuario autenticado: `@CurrentUser() usuario`. */
export const CurrentUser = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): TokenSesion =>
    contexto.switchToHttp().getRequest<{ user: TokenSesion }>().user,
);
