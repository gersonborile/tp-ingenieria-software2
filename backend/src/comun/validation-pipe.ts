import { ValidationPipe } from '@nestjs/common';

/** Pipe global compartido por `main.ts` y los e2e, para validar los DTOs igual que en producción. */
export const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});
