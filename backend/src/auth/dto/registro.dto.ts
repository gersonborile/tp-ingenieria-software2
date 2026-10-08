import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

const recortar = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class RegistroDto {
  @Transform(recortar)
  @IsString({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres.' })
  nombre!: string;

  @Transform(recortar)
  @IsString({ message: 'El contacto es obligatorio.' })
  @MinLength(3, { message: 'El contacto debe tener al menos 3 caracteres.' })
  @MaxLength(120, {
    message: 'El contacto no puede superar los 120 caracteres.',
  })
  contacto!: string;

  @Transform(recortar)
  @IsEmail({}, { message: 'El email no tiene un formato válido.' })
  @MaxLength(160, { message: 'El email no puede superar los 160 caracteres.' })
  email!: string;

  @IsString({ message: 'La contraseña es obligatoria.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres.',
  })
  contrasena!: string;
}
