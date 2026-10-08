import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'esPublico';

/** Exime la ruta del `JwtAuthGuard` global (registro, login). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
