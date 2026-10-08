import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService, SesionIniciada } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegistroDto } from './dto/registro.dto.js';
import { UsuarioPublico } from './dto/usuario-publico.js';
import type { TokenSesion } from './token-sesion.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  registrar(@Body() dto: RegistroDto): Promise<UsuarioPublico> {
    return this.authService.registrar(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  iniciarSesion(@Body() dto: LoginDto): Promise<SesionIniciada> {
    return this.authService.iniciarSesion(dto);
  }

  @Get('perfil')
  perfil(@CurrentUser() tokenSesion: TokenSesion): Promise<UsuarioPublico> {
    return this.authService.perfil(tokenSesion);
  }
}
