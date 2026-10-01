export type Rol = "usuario" | "administrador";

export type UsuarioPublico = {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  rol: Rol;
};

export type DatosRegistro = {
  nombre: string;
  contacto: string;
  email: string;
  contrasena: string;
};

export type DatosLogin = {
  email: string;
  contrasena: string;
};

export type SesionAutenticada = {
  token: string;
  usuario: UsuarioPublico;
};

export type CampoInvalido = {
  campo: string;
  mensaje: string;
};

export type SesionEnToken = {
  userId: string;
  nombre: string;
  email: string;
  rol: Rol;
};
