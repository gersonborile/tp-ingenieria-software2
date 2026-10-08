import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AuthService,
  MENSAJE_CREDENCIALES_INVALIDAS,
  MENSAJE_EMAIL_EN_USO,
} from './auth.service.js';
import type { UsuarioPublico } from './dto/usuario-publico.js';

const CONTRASENA = 'Socio123!';
const HASH = bcrypt.hashSync(CONTRASENA, 10);

type UsuarioEnBase = UsuarioPublico & {
  passwordHash: string;
};

function usuarioEnBase(overrides: Partial<UsuarioEnBase> = {}): UsuarioEnBase {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Socia Demo',
    contacto: '+54 9 11 0000 0001',
    email: 'socio1@clubdeportivo.test',
    rol: RolUsuario.USUARIO,
    passwordHash: HASH,
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    usuario: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };

  const registroValido = {
    nombre: 'Socia Nueva',
    contacto: '+54 9 11 0000 0003',
    email: 'SociaNueva@ClubDeportivo.test',
    contrasena: CONTRASENA,
  };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ id: 'nuevo-id', ...data }),
          ),
      },
    };
    jwtService = { signAsync: vi.fn().mockResolvedValue('token-falso') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('registrar', () => {
    it('crea el usuario con la contraseña hasheada y rol USUARIO', async () => {
      const usuario = await service.registrar(registroValido);

      expect(prisma.usuario.create).toHaveBeenCalledTimes(1);
      const { data } = prisma.usuario.create.mock.calls[0][0];
      expect(data.email).toBe('socianueva@clubdeportivo.test');
      expect(data.rol).toBe(RolUsuario.USUARIO);
      expect(data.passwordHash).not.toBe(registroValido.contrasena);
      await expect(
        bcrypt.compare(registroValido.contrasena, data.passwordHash),
      ).resolves.toBe(true);
      expect(usuario).toEqual({
        id: 'nuevo-id',
        nombre: 'Socia Nueva',
        contacto: '+54 9 11 0000 0003',
        email: 'socianueva@clubdeportivo.test',
        rol: RolUsuario.USUARIO,
      });
      expect(usuario).not.toHaveProperty('passwordHash');
    });

    it('nunca devuelve el hash de la contraseña', async () => {
      prisma.usuario.create.mockResolvedValue(usuarioEnBase());

      const usuario = await service.registrar(registroValido);

      expect(usuario).not.toHaveProperty('passwordHash');
    });

    it('rechaza con 409 cuando el email ya está registrado', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'otra-id' });

      await expect(service.registrar(registroValido)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.registrar(registroValido)).rejects.toThrow(
        MENSAJE_EMAIL_EN_USO,
      );
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it('fuerza el rol USUARIO aunque el body intente mandar otro', async () => {
      await service.registrar({
        ...registroValido,
        rol: RolUsuario.ADMINISTRADOR,
      } as unknown as typeof registroValido);

      const { data } = prisma.usuario.create.mock.calls[0][0];
      expect(data.rol).toBe(RolUsuario.USUARIO);
    });
  });

  describe('iniciarSesion', () => {
    it('devuelve el token con los claims y el usuario público', async () => {
      const usuario = usuarioEnBase();
      prisma.usuario.findUnique.mockResolvedValue(usuario);
      jwtService.signAsync.mockResolvedValue('token-real');

      const sesion = await service.iniciarSesion({
        email: ' Socio1@ClubDeportivo.test ',
        contrasena: CONTRASENA,
      });

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'socio1@clubdeportivo.test' },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        userId: usuario.id,
        email: usuario.email,
        rol: RolUsuario.USUARIO,
      });
      expect(sesion.token).toBe('token-real');
      expect(sesion.usuario).not.toHaveProperty('passwordHash');
      expect(sesion.usuario.email).toBe(usuario.email);
    });

    it('rechaza con 401 si la contraseña es incorrecta', async () => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioEnBase());

      await expect(
        service.iniciarSesion({
          email: 'socio1@clubdeportivo.test',
          contrasena: 'OtraClave1!',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.iniciarSesion({
          email: 'socio1@clubdeportivo.test',
          contrasena: 'OtraClave1!',
        }),
      ).rejects.toThrow(MENSAJE_CREDENCIALES_INVALIDAS);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rechaza con 401 si el usuario no existe, sin revelar el motivo', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.iniciarSesion({
          email: 'no-existe@clubdeportivo.test',
          contrasena: CONTRASENA,
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.iniciarSesion({
          email: 'no-existe@clubdeportivo.test',
          contrasena: CONTRASENA,
        }),
      ).rejects.toThrow(MENSAJE_CREDENCIALES_INVALIDAS);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('perfil', () => {
    it('devuelve el usuario del token sin credenciales', async () => {
      const usuario = usuarioEnBase();
      prisma.usuario.findUnique.mockResolvedValue(usuario);

      const perfil = await service.perfil({
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      });

      const select = prisma.usuario.findUnique.mock.calls[0][0].select;
      expect(Object.keys(select).sort()).toEqual([
        'contacto',
        'email',
        'id',
        'nombre',
        'rol',
      ]);
      expect(perfil).not.toHaveProperty('passwordHash');
      expect(perfil.id).toBe(usuario.id);
    });

    it('rechaza con 401 si el usuario del token ya no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.perfil({
          userId: 'id-inexistente',
          email: 'borrado@clubdeportivo.test',
          rol: RolUsuario.USUARIO,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
