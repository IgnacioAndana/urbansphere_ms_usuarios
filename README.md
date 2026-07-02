# MS Users — UrbanSphere

Microservicio de usuarios de la plataforma inmobiliaria **UrbanSphere**. Gestiona registro, autenticación JWT, perfiles, roles, solicitudes de interés en proyectos y refresh tokens.

| Dato | Valor |
|------|-------|
| Puerto por defecto | `3001` |
| Prefijo API | *(ninguno — rutas en raíz)* |
| Swagger | `/docs` |
| Esquema MySQL | `porsusde_urbansphere` (compartido con MS Projects y MS AI) |

**Integración con el BFF:** este microservicio expone rutas en la raíz (`/usuarios`, `/autenticacion/...`, etc.), sin prefijo `/api`. El BFF (subdominio público) reenvía al puerto interno `3001` con la misma ruta. El front solo habla con el BFF.

---

## Requisitos previos

- **Node.js** 20+ (recomendado 22)
- **npm** 10+
- **MySQL** 8.x con el esquema `porsusde_urbansphere` creado y tablas inicializadas
- Acceso de red al servidor MySQL (local o remoto)

---

## Configuración inicial

### 1. Clonar e instalar dependencias

```bash
cd MS_USUARIOS
npm install
```

### 2. Variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Ejemplo de `.env` (proyecto educativo con BD compartida):

```env
PORT=3001

DB_HOST=207.210.83.165
DB_PORT=3306
DB_NAME=porsusde_urbansphere
DB_USER=tu_usuario
DB_PASSWORD=tu_password

JWT_SECRET=cambia-este-secreto-en-produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

RABBITMQ_URL=amqp://guest:guest@localhost:5672

NODE_ENV=development
```

> Los tres microservicios usan el **mismo** `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. Solo cambia el `PORT` en cada uno.

### 3. Base de datos

Ejecuta el script SQL **antes** de levantar el servicio (crea las tablas del ecosistema; este MS usa 4):

```bash
mysql -u TU_USUARIO -p -h TU_HOST porsusde_urbansphere < database/init-all.sql
```

Si ya tenías tablas `permisos` / `rol_permisos`, ejecuta la migración:

```bash
mysql -u TU_USUARIO -p -h TU_HOST porsusde_urbansphere < database/migracion-simplificar-roles.sql
```

También puedes ejecutarlo desde **phpMyAdmin** o **MySQL Workbench** seleccionando el esquema `porsusde_urbansphere`.

**Tablas que usa este microservicio:**

| Tabla | Descripción |
|-------|-------------|
| `roles` | Roles fijos: admin, user, agent |
| `usuarios` | Usuarios registrados |
| `tokens_refresco` | Tokens de refresco JWT |
| `tokens_restablecimiento` | Enlaces de recuperación de contraseña (un solo uso) |
| `solicitudes_interes` | Formulario "Me interesa este proyecto" |
| `proyectos_favoritos` | Proyectos marcados con corazón por el usuario |

Al primer arranque, el servicio ejecuta un **seed** que crea los 3 roles si aún no existen.

### TypeORM y queries en consola

El servicio **no ejecuta** `init-all.sql` al arrancar. Lo que ves en terminal como:

```text
query: SELECT version()
```

es TypeORM **verificando la conexión** a MySQL (solo visible si `DB_LOGGING=true`). Las tablas deben crearse manualmente con el script SQL.

Variables recomendadas en `.env`:

```env
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### Logs HTTP en consola (PM2)

Cada petición se registra automáticamente (activado por defecto):

```text
[HTTP] → POST /autenticacion/iniciar-sesion
[HTTP] ← POST /autenticacion/iniciar-sesion 201 45ms
[HTTP] → GET /autenticacion/perfil [juan@example.com]
[HTTP] ← GET /autenticacion/perfil 200 12ms [juan@example.com]
```

Ver en el servidor:

```bash
pm2 logs ms-usuarios
```

Desactivar si hace falta:

```env
HTTP_LOGGING=false
```

No registra Swagger (`/docs`). No imprime bodies ni contraseñas.

---

## Cómo levantar el servicio

### Desarrollo (con hot-reload)

```bash
npm run start:dev
```

Salida esperada:

```text
MS Users running on http://localhost:3001
Swagger docs: http://localhost:3001/docs
```

### Producción

```bash
npm run build
npm run start:prod
```

---

## Verificar que funciona

Abre Swagger en el navegador:

```text
http://localhost:3001/docs
```

---

## Ejemplos curl (todos los endpoints)

Base URL del servicio:

```text
http://localhost:3001
```

Flujo recomendado: **registrar** → **iniciar sesión** → copiar `tokenAcceso` y `tokenRefresco` → probar el resto.

En los ejemplos protegidos, reemplaza `TU_TOKEN_ACCESO` y `TU_TOKEN_REFRESCO` por los valores devueltos al iniciar sesión.

### Usuarios

#### POST `/usuarios` — Registro público (sin JWT, siempre rol `user`)

```bash
curl -X POST http://localhost:3001/usuarios \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Juan Pérez\",\"email\":\"juan@example.com\",\"contrasena\":\"SecurePass123!\"}"
```

Crear usuario con rol (solo **admin** autenticado):

```bash
curl -X POST http://localhost:3001/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -d "{\"nombre\":\"María López\",\"email\":\"maria@example.com\",\"contrasena\":\"SecurePass123!\",\"rolId\":3}"
```

#### GET `/usuarios` — Listar usuarios (JWT)

```bash
curl -X GET http://localhost:3001/usuarios \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

#### GET `/usuarios/:id` — Obtener usuario por ID (JWT)

```bash
curl -X GET http://localhost:3001/usuarios/1 \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

#### PATCH `/usuarios/:id` — Actualizar usuario (JWT)

Cualquier rol puede editar **su propio** id (`nombre`, `email`, `contrasena`). Admin y agent pueden editar **cualquier** usuario (incluye `rolId`, `activo`).

```bash
curl -X PATCH http://localhost:3001/usuarios/1 \
  -H "Authorization: Bearer TU_TOKEN_ACCESO" \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Juan Pérez Actualizado\"}"
```

Actualizar contraseña:

```bash
curl -X PATCH http://localhost:3001/usuarios/1 \
  -H "Authorization: Bearer TU_TOKEN_ACCESO" \
  -H "Content-Type: application/json" \
  -d "{\"contrasena\":\"NuevaSecurePass123!\"}"
```

#### DELETE `/usuarios/:id` — Eliminar usuario (JWT, solo admin)

```bash
curl -X DELETE http://localhost:3001/usuarios/1 \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

### Autenticación

#### POST `/autenticacion/iniciar-sesion` — Iniciar sesión (sin auth)

```bash
curl -X POST http://localhost:3001/autenticacion/iniciar-sesion \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@example.com\",\"contrasena\":\"SecurePass123!\"}"
```

Respuesta esperada (fechas en formato `dd-mm-yyyy HH:mm:ss`):

```json
{
  "tokenAcceso": "eyJhbGciOiJIUzI1NiIs...",
  "tokenRefresco": "a1b2c3d4e5f6...",
  "expiraEn": "15m",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "creadoEn": "20-06-2025 14:30:45"
  }
}
```

#### POST `/autenticacion/refrescar` — Renovar tokens (sin auth)

```bash
curl -X POST http://localhost:3001/autenticacion/refrescar \
  -H "Content-Type: application/json" \
  -d "{\"tokenRefresco\":\"TU_TOKEN_REFRESCO\"}"
```

#### POST `/autenticacion/cerrar-sesion` — Cerrar sesión (sin auth)

```bash
curl -X POST http://localhost:3001/autenticacion/cerrar-sesion \
  -H "Content-Type: application/json" \
  -d "{\"tokenRefresco\":\"TU_TOKEN_REFRESCO\"}"
```

#### GET `/autenticacion/perfil` — Perfil del usuario autenticado (JWT)

```bash
curl -X GET http://localhost:3001/autenticacion/perfil \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

#### POST `/autenticacion/solicitar-restablecimiento` — Validar email y enviar enlace

Comprueba que el correo exista en la BD y envía un enlace **de un solo uso** (vía Mailtrap).

```bash
curl -X POST http://localhost:3001/autenticacion/solicitar-restablecimiento \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@example.com\"}"
```

Respuesta si existe: `{ "mensaje": "...", "email": "juan@example.com" }`  
Si no existe: **404** — `No existe una cuenta activa con ese correo electrónico`

#### POST `/autenticacion/validar-token-restablecimiento` — Validar enlace antes del formulario

```bash
curl -X POST http://localhost:3001/autenticacion/validar-token-restablecimiento \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"TOKEN_DEL_CORREO\"}"
```

#### POST `/autenticacion/restablecer-contrasena` — Nueva contraseña (token un solo uso)

```bash
curl -X POST http://localhost:3001/autenticacion/restablecer-contrasena \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"TOKEN_DEL_CORREO\",\"contrasena\":\"NuevaSecurePass123!\"}"
```

Variables `.env` del enlace:

```env
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_PATH=/restablecer-contrasena
PASSWORD_RESET_EXPIRES_IN=1h
```

El correo incluye: `{FRONTEND_URL}{PASSWORD_RESET_PATH}?token=...`

### Roles y permisos por rol

Los permisos se controlan por **nombre de rol** en código (sin tablas `permisos` / `rol_permisos`).

| Endpoint | admin | agent | user |
|----------|-------|-------|------|
| `POST /usuarios` (sin JWT) | Registro público → rol `user` | igual | igual |
| `POST /usuarios` (con JWT) | Crear usuario (asignar rol) | ❌ | ❌ |
| `GET /usuarios` | ✅ | ✅ | ❌ |
| `GET /usuarios/:id` | ✅ | ✅ | ❌ |
| `PATCH /usuarios/:id` | Cualquier usuario | Cualquier usuario | Solo **su propio** id |
| `DELETE /usuarios/:id` | ✅ | ❌ | ❌ |

> Al editar **su propio perfil**, `user` solo puede cambiar `nombre`, `email` y `contrasena`. Admin y agent pueden editar cualquier usuario con todos los campos.

> En MS Projects, el rol `user` solo debe poder **consultar** proyectos (GET).

#### GET `/roles` — Listar roles (JWT admin o agent)

```bash
curl -X GET http://localhost:3001/roles \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

### Solicitudes de interés ("Me interesa este proyecto")

Endpoint para el formulario del frontend. **Público** (sin login) o con JWT (usa el email de la sesión).

#### POST `/solicitudes-interes` — Enviar solicitud

```bash
curl -X POST http://localhost:3001/solicitudes-interes \
  -H "Content-Type: application/json" \
  -d "{\"proyectoId\":1,\"nombre\":\"Juan Pérez\",\"email\":\"juan@example.com\"}"
```

Con sesión activa (el email del body se ignora y se usa el de la sesión):

```bash
curl -X POST http://localhost:3001/solicitudes-interes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ACCESO" \
  -d "{\"proyectoId\":1,\"nombre\":\"Juan Pérez\",\"email\":\"juan@example.com\"}"
```

#### GET `/solicitudes-interes` — Listar todas (JWT admin o agent)

```bash
curl -X GET http://localhost:3001/solicitudes-interes \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

### Favoritos (corazón en proyectos)

Requiere **JWT**. Distinto de "Me interesa": solo guarda `usuario_id` + `proyecto_id` (FK a `proyectos.id`) para el ícono de corazón.

#### GET `/favoritos/ids` — IDs favoritos del usuario (para pintar corazones)

```bash
curl -X GET http://localhost:3001/favoritos/ids \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

Respuesta: `{ "proyectoIds": [12, 34] }`

#### GET `/favoritos/proyecto/:proyectoId` — ¿Está en favoritos?

```bash
curl -X GET http://localhost:3001/favoritos/proyecto/12 \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

#### POST `/favoritos` — Agregar favorito

```bash
curl -X POST http://localhost:3001/favoritos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ACCESO" \
  -d "{\"proyectoId\":12}"
```

#### DELETE `/favoritos/:proyectoId` — Quitar favorito

```bash
curl -X DELETE http://localhost:3001/favoritos/12 \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

#### GET `/favoritos` — Listar mis favoritos

```bash
curl -X GET http://localhost:3001/favoritos \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

Migración en BD existente:

```bash
mysql -u USUARIO -p -h HOST porsusde_urbansphere < database/migracion-proyectos-favoritos.sql
```

### Correo (Mailtrap)

1. Registro en https://mailtrap.io
2. Verifica tu dominio (ej. `urbansphere.cl`) en **Email Sending → Domains**
3. Crea un **API Token** en Settings → API Tokens
4. En `.env`:

```env
MAILTRAP_API_TOKEN=tu_api_token
MAIL_FROM=hello@urbansphere.cl
MAIL_FROM_NAME=UrbanSphere
FRONTEND_URL=http://13.222.88.101
```

5. `git pull`, `npm run build`, `pm2 restart ms-usuarios`

`MAIL_FROM` debe usar un email de tu **dominio verificado** en Mailtrap.

Si el correo falla al restablecer contraseña, la API responde **503** y el token no queda activo.

### PowerShell (Windows)

Si usas PowerShell nativo, puedes probar así:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/autenticacion/iniciar-sesion" `
  -ContentType "application/json" `
  -Body '{"email":"juan@example.com","contrasena":"SecurePass123!"}'
```

---

## Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/usuarios` | Registro público (sin JWT) o crear usuario (JWT admin) | No / JWT admin |
| GET | `/usuarios` | Listar usuarios | JWT admin, agent |
| GET | `/usuarios/:id` | Obtener usuario por ID | JWT admin, agent |
| PATCH | `/usuarios/:id` | Actualizar perfil propio o cualquier usuario (admin/agent) | JWT |
| DELETE | `/usuarios/:id` | Eliminar usuario | JWT admin |
| POST | `/autenticacion/iniciar-sesion` | Iniciar sesión | No |
| POST | `/autenticacion/refrescar` | Renovar tokens | No |
| POST | `/autenticacion/cerrar-sesion` | Cerrar sesión | No |
| GET | `/autenticacion/perfil` | Perfil del usuario autenticado | JWT |
| POST | `/autenticacion/solicitar-restablecimiento` | Validar email y enviar enlace | No |
| POST | `/autenticacion/validar-token-restablecimiento` | Comprobar token vigente | No |
| POST | `/autenticacion/restablecer-contrasena` | Nueva contraseña (token único) | No |
| GET | `/roles` | Listar roles | JWT admin, agent |
| POST | `/solicitudes-interes` | Me interesa este proyecto | Opcional |
| GET | `/solicitudes-interes` | Listar solicitudes | JWT admin, agent |
| GET | `/solicitudes-interes/proyecto/:proyectoId` | Solicitudes por proyecto | JWT admin, agent |
| GET | `/favoritos/ids` | IDs de proyectos favoritos del usuario | JWT |
| GET | `/favoritos/proyecto/:proyectoId` | Comprobar si es favorito | JWT |
| GET | `/favoritos` | Listar mis favoritos | JWT |
| POST | `/favoritos` | Marcar proyecto favorito | JWT |
| DELETE | `/favoritos/:proyectoId` | Quitar de favoritos | JWT |

---

## Arquitectura

```text
Controller → Service → Repository → Entity → MySQL (porsusde_urbansphere)
```

## Stack

- NestJS + TypeScript
- TypeORM + MySQL
- JWT (access 15 min) + Refresh token (7 días)
- Bcrypt para contraseñas
- Swagger / OpenAPI
- Jest + Supertest

## Roles por defecto

| ID | Rol | Descripción |
|----|-----|-------------|
| 1 | `admin` | Acceso completo; puede crear y eliminar usuarios |
| 2 | `user` | Usuario estándar; ver proyectos y enviar solicitudes de interés |
| 3 | `agent` | Igual que admin excepto crear/eliminar usuarios |

## Modelo de datos (columnas en español)

| Tabla | Columnas principales |
|-------|---------------------|
| `usuarios` | `nombre`, `email`, `hash_contrasena`, `rol_id`, `activo`, `creado_en`, `actualizado_en` |
| `roles` | `nombre`, `descripcion` |
| `solicitudes_interes` | `proyecto_id`, `nombre`, `email`, `usuario_id`, `creado_en` |
| `proyectos_favoritos` | `usuario_id`, `proyecto_id`, `creado_en` (único por usuario+proyecto) |
| `tokens_restablecimiento` | `usuario_id`, `token`, `expira_en`, `usado`, `creado_en` |
| `tokens_refresco` | `usuario_id`, `token`, `expira_en` |

Rutas, DTOs, métodos de servicio/repositorio y respuestas JSON están en **español**, alineados con el esquema de BD.

## Formato de fechas

| Capa | Formato | Ejemplo |
|------|---------|---------|
| Base de datos MySQL | `DATETIME` → `yyyy-mm-dd HH:mm:ss` | `2025-06-20 14:30:45` |
| Respuestas API | `dd-mm-yyyy HH:mm:ss` | `20-06-2025 14:30:45` |

> **Importante:** usar `DATETIME` sin microsegundos. Si ves `.521444` al final, ejecuta `database/migracion-fechas-datetime.sql`.

El interceptor `FormatearFechasInterceptor` aplica el formato de respuesta automáticamente en todos los endpoints. Los servicios trabajan con objetos `Date` sin formatear manualmente.

**Ejemplo de respuesta al registrar usuario:**

```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "creadoEn": "20-06-2025 14:30:45",
  "actualizadoEn": "20-06-2025 14:30:45"
}
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con recarga automática |
| `npm run build` | Compilar a `dist/` |
| `npm run start:prod` | Ejecutar build de producción |
| `npm run test` | Tests unitarios |
| `npm run test:cov` | Tests con cobertura |
| `npm run test:e2e` | Tests end-to-end (requiere MySQL) |
| `npm run lint` | ESLint |

---

## Tests

```bash
npm run test        # Unitarios
npm run test:cov    # Cobertura (controllers, services, repositories ≥ 80%)
npm run test:e2e    # E2E — requiere .env con BD accesible
```

---

## Estructura del proyecto

```text
MS_USUARIOS/
├── database/
│   └── init-all.sql      # Script del esquema compartido (3 microservicios)
├── src/
│   ├── config/           # database, jwt, rabbitmq, email
│   ├── common/           # guards, filters, interceptors, correo
│   │   └── correo/
│   │       ├── assets/   # logos para plantillas HTML de email
│   │       └── plantillas/
│   ├── modules/
│   │   ├── users/
│   │   ├── auth/
│   │   ├── roles/
│   │   ├── solicitudes-interes/
│   │   └── favoritos/
│   ├── seed/             # Datos iniciales (3 roles)
│   ├── app.module.ts
│   └── main.ts
├── test/                 # E2E
└── .env.example
```

---

## Solución de problemas

| Problema | Posible causa | Solución |
|----------|---------------|----------|
| `ECONNREFUSED` al iniciar | MySQL no accesible | Verifica `DB_HOST`, firewall y que el servidor MySQL esté activo |
| `Access denied for user` | Credenciales incorrectas | Revisa `DB_USER` y `DB_PASSWORD` en `.env` |
| `Unknown database` | Esquema no creado | Crea `porsusde_urbansphere` desde el panel o ejecuta `init-all.sql` |
| `Table doesn't exist` | Tablas no creadas o nombres antiguos en inglés | Ejecuta `database/init-all.sql` (recrear si migraste de versión anterior) |
| Fechas con microsegundos en BD | Columnas `DATETIME(6)` antiguas | Ejecuta `database/migracion-fechas-datetime.sql` |
| Queries SQL en consola | `DB_LOGGING=true` | Normal con logging activo; no es el script SQL. Pon `DB_LOGGING=false` |
| Puerto en uso | Otro proceso en 3001 | Cambia `PORT` en `.env` o libera el puerto |

---

## Referencias

- Plantilla del ecosistema: [`MICROSERVICIO_TEMPLATE.md`](./MICROSERVICIO_TEMPLATE.md)
- Script SQL compartido: [`database/init-all.sql`](./database/init-all.sql)
