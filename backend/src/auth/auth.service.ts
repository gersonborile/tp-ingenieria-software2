import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';
import {
  aUsuarioPublico,
  SELECCION_USUARIO_PUBLICO,
  UsuarioPublico,
} from './dto/usuario-publico.js';
import {
  MENSAJE_CREDENCIALES_INVALIDAS,
  MENSAJE_EMAIL_EN_USO,
  MENSAJE_SESION_INVALIDA,
} from './mensajes.js';
import { TokenSesion } from './token-sesion.js';

const ROL_POR_DEFECTO = RolUsuario.USUARIO;
const SALTOS_BCRYPT = 10;

export type SesionIniciada = {
  token: string;
  usuario: UsuarioPublico;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroDto): Promise<UsuarioPublico> {
    const email = normalizarEmail(dto.email);
    const existente = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existente) {
      throw new ConflictException(MENSAJE_EMAIL_EN_USO);
    }

    const passwordHash = await bcrypt.hash(dto.contrasena, SALTOS_BCRYPT);
    const creado = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        contacto: dto.contacto,
        email,
        passwordHash,
        rol: ROL_POR_DEFECTO,
      },
      select: SELECCION_USUARIO_PUBLICO,
    });
    return aUsuarioPublico(creado);
  }

  async iniciarSesion(dto: LoginDto): Promise<SesionIniciada> {
    const email = normalizarEmail(dto.email);
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new UnauthorizedException(MENSAJE_CREDENCIALES_INVALIDAS);
    }

    const coincide = await bcrypt.compare(dto.contrasena, usuario.passwordHash);
    if (!coincide) {
      throw new UnauthorizedException(MENSAJE_CREDENCIALES_INVALIDAS);
    }

    const token = await this.jwtService.signAsync({
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    } satisfies TokenSesion);

    return { token, usuario: aUsuarioPublico(usuario) };
  }

  async perfil(tokenSesion: TokenSesion): Promise<UsuarioPublico> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: tokenSesion.userId },
      select: SELECCION_USUARIO_PUBLICO,
    });
    if (!usuario) {
      throw new UnauthorizedException(MENSAJE_SESION_INVALIDA);
    }
    return aUsuarioPublico(usuario);
  }
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}
