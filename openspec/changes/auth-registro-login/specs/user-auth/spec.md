## Purpose

Permite identificar a los usuarios de la plataforma: registrarse como socio, iniciar y
cerrar sesión, y obtener una sesión autenticada con su rol para acceder a los recursos
del sistema.

## ADDED Requirements

### Requirement: Registro de usuario
El sistema SHALL permitir que una persona se registre como socio proporcionando nombre,
contacto, tipo, membresía, email y contraseña. El email SHALL ser único en el sistema y
la contraseña SHALL almacenarse únicamente de forma hasheada. El usuario registrado
SHALL obtener el rol `usuario`.

#### Scenario: Registro exitoso
- **WHEN** una persona envía datos de registro válidos con un email no utilizado
- **THEN** el sistema crea el usuario con rol `usuario`, guarda la contraseña hasheada y
  devuelve el usuario creado sin datos de credenciales

#### Scenario: Email duplicado
- **WHEN** una persona intenta registrarse con un email que ya está registrado
- **THEN** el sistema rechaza el registro e indica que el email ya está en uso

#### Scenario: Datos de registro inválidos
- **WHEN** una persona envía datos de registro incompletos o con contraseña que no cumple
  los requisitos mínimos
- **THEN** el sistema rechaza el registro e indica los campos inválidos

### Requirement: Inicio de sesión
El sistema SHALL autenticar a un usuario registrado mediante email y contraseña. Ante
credenciales válidas, SHALL devolver un token de sesión que identifica al usuario y su
rol. Ante credenciales inválidas, SHALL rechazar el acceso sin revelar qué dato fue
incorrecto.

#### Scenario: Login exitoso
- **WHEN** un usuario registrado envía email y contraseña correctos
- **THEN** el sistema devuelve un token de sesión que identifica su usuario y rol

#### Scenario: Credenciales inválidas
- **WHEN** un usuario envía un email inexistente o una contraseña incorrecta
- **THEN** el sistema rechaza el acceso con un error genérico de credenciales inválidas

### Requirement: Sesión autenticada
El sistema SHALL exigir un token de sesión válido para acceder a los recursos protegidos.
SHALL rechazar las peticiones sin token, con token inválido o con token vencido.

#### Scenario: Acceso a recurso protegido con sesión válida
- **WHEN** un usuario con token de sesión válido solicita un recurso protegido
- **THEN** el sistema identifica al usuario por el token y atiende la petición

#### Scenario: Acceso a recurso protegido sin sesión
- **WHEN** una petición a un recurso protegido no incluye token de sesión
- **THEN** el sistema la rechaza exigiendo autenticación

#### Scenario: Token inválido o vencido
- **WHEN** una petición a un recurso protegido incluye un token inválido o vencido
- **THEN** el sistema la rechaza e indica que la sesión no es válida

### Requirement: Autorización por rol
El sistema SHALL asociar a cada usuario un rol (`usuario` o `administrador`) y SHALL
restringir los recursos de administración a usuarios con rol `administrador`. Un usuario
con rol `usuario` SHALL poder acceder únicamente a recursos que le pertenecen.

#### Scenario: Recurso de administración con rol administrador
- **WHEN** un usuario con rol `administrador` y sesión válida solicita un recurso de administración
- **THEN** el sistema atiende la petición

#### Scenario: Recurso de administración sin rol administrador
- **WHEN** un usuario con rol `usuario` y sesión válida solicita un recurso de administración
- **THEN** el sistema rechaza la petición por falta de permisos

#### Scenario: Acceso a recursos ajenos
- **WHEN** un usuario con rol `usuario` solicita recursos que pertenecen a otro usuario
- **THEN** el sistema rechaza la petición

### Requirement: Cierre de sesión
El sistema SHALL permitir que un usuario finalice su sesión dejando de usar el token de
sesión en el cliente.

#### Scenario: Logout
- **WHEN** un usuario autenticado cierra sesión
- **THEN** el cliente descarta el token y las peticiones posteriores no quedan autenticadas

### Requirement: Protección de credenciales
El sistema SHALL almacenar las contraseñas únicamente hasheadas y SHALL NEVER exponer la
contraseña ni su hash en ninguna respuesta del sistema.

#### Scenario: El sistema no expone credenciales
- **WHEN** cualquier respuesta del sistema incluye datos de un usuario
- **THEN** la respuesta nunca contiene la contraseña ni su hash