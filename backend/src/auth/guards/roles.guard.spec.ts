import {
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../generated/prisma/client.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import { Public } from '../decorators/public.decorator.js';
import { Roles } from '../decorators/roles.decorator.js';
import type { TokenSesion } from '../token-sesion.js';
import { RolesGuard } from './roles.guard.js';

@Controller('recursos')
class ControladorDePrueba {
  @Public()
  @Get('publico')
  publico(): string {
    return 'ok';
  }

  @Get('protegido')
  protegido(@CurrentUser() usuario: TokenSesion): TokenSesion {
    return usuario;
  }

  @Get('solo-admin')
  @Roles(RolUsuario.ADMINISTRADOR)
  soloAdmin(): string {
    return 'ok';
  }

  @Get('varios-roles')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.USUARIO)
  variosRoles(): string {
    return 'ok';
  }
}

type MetodoDePrueba = keyof ControladorDePrueba;

function contexto(
  metodo: MetodoDePrueba,
  user?: TokenSesion,
): ExecutionContext {
  const manejador = ControladorDePrueba.prototype[metodo];
  return {
    getHandler: () => manejador,
    getClass: () => ControladorDePrueba,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function token(rol: RolUsuario): TokenSesion {
  return { userId: 'user-id', email: 'socio@clubdeportivo.test', rol };
}

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get(RolesGuard);
  });

  it('deja pasar las rutas sin @Roles', () => {
    expect(
      guard.canActivate(contexto('protegido', token(RolUsuario.USUARIO))),
    ).toBe(true);
  });

  it('deja pasar las rutas públicas sin token', () => {
    expect(guard.canActivate(contexto('publico'))).toBe(true);
  });

  it('deja pasar cuando el token tiene uno de los roles requeridos', () => {
    expect(
      guard.canActivate(contexto('soloAdmin', token(RolUsuario.ADMINISTRADOR))),
    ).toBe(true);
    expect(
      guard.canActivate(contexto('variosRoles', token(RolUsuario.USUARIO))),
    ).toBe(true);
  });

  it('rechaza con 403 cuando el rol es insuficiente', () => {
    expect(() =>
      guard.canActivate(contexto('soloAdmin', token(RolUsuario.USUARIO))),
    ).toThrow(ForbiddenException);
  });

  it('rechaza con 401 cuando la ruta pide rol pero no hay sesión', () => {
    expect(() => guard.canActivate(contexto('soloAdmin'))).toThrow(
      UnauthorizedException,
    );
  });
});
