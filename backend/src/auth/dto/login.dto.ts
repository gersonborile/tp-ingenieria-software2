import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

const recortar = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class LoginDto {
  @Transform(recortar)
  @IsEmail({}, { message: 'El email no tiene un formato válido.' })
  email!: string;

  @IsString({ message: 'La contraseña es obligatoria.' })
  contrasena!: string;
}
