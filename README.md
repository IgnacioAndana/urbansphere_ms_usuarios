# MS Users — UrbanSphere

Microservicio de usuarios de la plataforma inmobiliaria **UrbanSphere**. Gestiona registro, autenticación JWT, perfiles, roles, permisos y refresh tokens.

| Dato | Valor |
|------|-------|
| Puerto por defecto | `3001` |
| Prefijo API | `/api` |
| Swagger | `/api/docs` |
| Esquema MySQL | `porsusde_urbansphere` (compartido con MS Projects y MS AI) |

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

Ejecuta el script SQL **antes** de levantar el servicio (crea las 13 tablas del ecosistema; este MS usa 5):

```bash
mysql -u TU_USUARIO -p -h TU_HOST porsusde_urbansphere < database/init-all.sql
```

También puedes ejecutarlo desde **phpMyAdmin** o **MySQL Workbench** seleccionando el esquema `porsusde_urbansphere`.

**Tablas que usa este microservicio:**

| Tabla | Descripción |
|-------|-------------|
| `permisos` | Permisos del sistema |
| `roles` | Roles (admin, user, agent) |
| `rol_permisos` | Relación roles ↔ permisos |
| `usuarios` | Usuarios registrados |
| `tokens_refresco` | Tokens de refresco JWT |

> Si ya ejecutaste una versión anterior del script con nombres en inglés, debes **recrear las tablas** ejecutando de nuevo `init-all.sql` (descomenta el bloque DROP al inicio del script si es necesario).

Al primer arranque, el servicio ejecuta un **seed** que crea roles y permisos si aún no existen.

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

---

## Cómo levantar el servicio

### Desarrollo (con hot-reload)

```bash
npm run start:dev
```

Salida esperada:

```text
MS Users running on http://localhost:3001
Swagger docs: http://localhost:3001/api/docs
```

### Producción

```bash
npm run build
npm run start:prod
```

### Docker (entorno local con MySQL en contenedor)

```bash
docker compose up --build
```

- API: `http://localhost:3001`
- MySQL del compose: puerto `3307` (solo para desarrollo local con Docker)

---

## Verificar que funciona

### 1. Swagger

Abre en el navegador:

```text
http://localhost:3001/api/docs
```

### 2. Registrar un usuario

```bash
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d "{\"nombre\":\"Juan Pérez\",\"email\":\"juan@example.com\",\"contrasena\":\"SecurePass123!\"}"
```

### 3. Iniciar sesión

```bash
curl -X POST http://localhost:3001/api/autenticacion/iniciar-sesion \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"juan@example.com\",\"contrasena\":\"SecurePass123!\"}"
```

Respuesta incluye `tokenAcceso`, `tokenRefresco` y datos del `usuario`.

### 4. Perfil autenticado

```bash
curl http://localhost:3001/api/autenticacion/perfil \
  -H "Authorization: Bearer TU_TOKEN_ACCESO"
```

---

## Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/usuarios` | Registro de usuario | No |
| GET | `/api/usuarios` | Listar usuarios | JWT |
| GET | `/api/usuarios/:id` | Obtener usuario por ID | JWT |
| PATCH | `/api/usuarios/:id` | Actualizar usuario | JWT |
| DELETE | `/api/usuarios/:id` | Eliminar usuario | JWT |
| POST | `/api/autenticacion/iniciar-sesion` | Iniciar sesión | No |
| POST | `/api/autenticacion/refrescar` | Renovar tokens | No |
| POST | `/api/autenticacion/cerrar-sesion` | Cerrar sesión | No |
| GET | `/api/autenticacion/perfil` | Perfil del usuario autenticado | JWT |
| GET | `/api/roles` | Listar roles | JWT |
| GET | `/api/permisos` | Listar permisos | JWT |

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

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso completo |
| `user` | Usuario estándar |
| `agent` | Agente inmobiliario |

## Modelo de datos (columnas en español)

| Tabla | Columnas principales |
|-------|---------------------|
| `usuarios` | `nombre`, `email`, `hash_contrasena`, `rol_id`, `activo`, `creado_en`, `actualizado_en` |
| `roles` | `nombre`, `descripcion` |
| `permisos` | `nombre` |
| `tokens_refresco` | `usuario_id`, `token`, `expira_en` |

Rutas, DTOs, métodos de servicio/repositorio y respuestas JSON están en **español**, alineados con el esquema de BD.

## Formato de fechas

| Capa | Formato | Ejemplo |
|------|---------|---------|
| Base de datos MySQL | `yyyy-mm-dd HH:mm:ss` | `2025-06-20 14:30:45` |
| Respuestas API | `dd-mm-yyyy HH:mm:ss` | `20-06-2025 14:30:45` |

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
│   ├── config/           # database, jwt, rabbitmq
│   ├── common/           # guards, filters, interceptors, utils
│   ├── modules/
│   │   ├── users/
│   │   ├── auth/
│   │   ├── roles/
│   │   └── permissions/
│   ├── seed/             # Datos iniciales roles/permisos
│   ├── app.module.ts
│   └── main.ts
├── test/                 # E2E
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

---

## Solución de problemas

| Problema | Posible causa | Solución |
|----------|---------------|----------|
| `ECONNREFUSED` al iniciar | MySQL no accesible | Verifica `DB_HOST`, firewall y que el servidor MySQL esté activo |
| `Access denied for user` | Credenciales incorrectas | Revisa `DB_USER` y `DB_PASSWORD` en `.env` |
| `Unknown database` | Esquema no creado | Crea `porsusde_urbansphere` desde el panel o ejecuta `init-all.sql` |
| `Table doesn't exist` | Tablas no creadas o nombres antiguos en inglés | Ejecuta `database/init-all.sql` (recrear si migraste de versión anterior) |
| Queries SQL en consola | `DB_LOGGING=true` | Normal con logging activo; no es el script SQL. Pon `DB_LOGGING=false` |
| Puerto en uso | Otro proceso en 3001 | Cambia `PORT` en `.env` o libera el puerto |

---

## Referencias

- Plantilla del ecosistema: [`MICROSERVICIO_TEMPLATE.md`](./MICROSERVICIO_TEMPLATE.md)
- Script SQL compartido: [`database/init-all.sql`](./database/init-all.sql)
