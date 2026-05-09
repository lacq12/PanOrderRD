# PanOrderRD

Sistema de gestión para **Panadería Hermanos Paca**. Permite administrar productos, pedidos, clientes, empleados, usuarios y unidades de medida desde una interfaz web moderna.

---

## Descripción del proyecto

PanOrderRD es una aplicación web full-stack diseñada para digitalizar las operaciones diarias de una panadería. Incluye:

- Dashboard con KPIs de ventas, balance pendiente e ingredientes consolidados por pedidos activos
- Gestión de productos con receta de ingredientes
- Flujo de pedidos en 5 pasos (cliente, carrito, fecha, pago, confirmación)
- Directorio de clientes y empleados
- Mantenimiento de unidades de medida
- Sistema de usuarios con roles (Admin, Gerente, Vendedor)
- Notificaciones automáticas de pagos pendientes, entregas cercanas y stock agotado
- Soporte para modo oscuro y diseño responsive

---

## Arquitectura

```
PanOrderRD/
├── frontend/        React 18 + Vite + Zustand + Tailwind CSS v4
└── backend/         Node.js + Express + PostgreSQL (pg)
```

- **Base de datos:** Supabase (PostgreSQL)
- **Backend:** Railway
- **Frontend:** GitHub Pages (`/PanOrderRD/`)

---

## Requisitos previos

- Node.js 20 o superior
- npm 9 o superior
- Cuenta en [Supabase](https://supabase.com) con el proyecto configurado
- (Opcional) Cuenta en [Railway](https://railway.app) para desplegar el backend

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/lacq12/PanOrderRD.git
cd PanOrderRD
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crear el archivo `.env` en `backend/` con las siguientes variables:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-us-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=tu_secreto_jwt_seguro
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

> Ver sección **Supabase** más abajo para obtener el valor de `DATABASE_URL`.

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

Crear el archivo `.env` en `frontend/` (opcional, solo si el backend no corre en el proxy por defecto):

```env
VITE_API_URL=http://localhost:3001/api
```

Si no se define `VITE_API_URL`, el frontend usa el proxy de Vite que apunta a `http://localhost:3000/api` (configurable en `vite.config.js`).

---

## Ejecución local

Abrir dos terminales:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
El servidor arranca en `http://localhost:3000`.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
La app estará disponible en `http://localhost:5173/PanOrderRD/`.

---

## Dependencias

### Backend

| Paquete | Versión | Uso |
|---------|---------|-----|
| express | ^4.19.2 | Framework HTTP |
| pg | ^8.20.0 | Cliente PostgreSQL |
| jsonwebtoken | ^9.0.2 | Autenticación JWT |
| bcryptjs | ^3.0.3 | Hash de contraseñas |
| cors | ^2.8.5 | Control de orígenes |
| dotenv | ^16.4.5 | Variables de entorno |
| nodemon | ^3.1.4 | Recarga automática (dev) |

### Frontend

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | Renderizado DOM |
| zustand | ^5.0.12 | Estado global |
| lucide-react | ^0.487.0 | Iconos |
| react-loading-skeleton | ^3.5.0 | Estados de carga |
| tailwindcss | ^4.1.12 | Estilos utilitarios |
| vite | ^6.3.5 | Bundler y dev server |

---

## Supabase (base de datos)

El proyecto usa **Supabase** como base de datos PostgreSQL administrada en la nube.

### Obtener la cadena de conexión

1. Ir a [supabase.com](https://supabase.com) e ingresar al proyecto
2. Hacer clic en el botón **Connect** (barra superior)
3. Seleccionar la pestaña **Direct** → Connection Method: **Session pooler**
4. Copiar el URI y reemplazar `[YOUR-PASSWORD]` con la contraseña del proyecto
5. Pegarlo como valor de `DATABASE_URL` en el `.env` del backend

> Usar el **Session pooler** en lugar de la conexión directa para compatibilidad con redes IPv4 (Railway y entornos locales).

```env
DATABASE_URL=postgresql://postgres.<ref>:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas de acceso con roles |
| `productos` | Catálogo con precio, stock e ingredientes (JSONB) |
| `clientes` | Directorio de clientes |
| `empleados` | Personal de la panadería |
| `pedidos` | Órdenes de venta |
| `detalle_pedido` | Líneas de cada pedido |
| `unidades` | Unidades de medida para ingredientes |
| `ingredientes` | Ingredientes normalizados |
| `producto_ingredientes` | Relación producto-ingrediente |

### Migraciones necesarias

Si el proyecto se configura desde cero, ejecutar en el **SQL Editor de Supabase**:

```sql
-- Columna de ingredientes en productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS ingredientes JSONB DEFAULT '[]'::jsonb;

-- Tabla de unidades (si no existe)
CREATE TABLE IF NOT EXISTS unidades (
  id            SERIAL PRIMARY KEY,
  descripcion   VARCHAR(50) NOT NULL,
  unidad_medida VARCHAR(10) NOT NULL
);

-- Datos iniciales de unidades
INSERT INTO unidades (descripcion, unidad_medida) VALUES
  ('Kilogramo', 'kg'),
  ('Gramo',     'g'),
  ('Litro',     'L'),
  ('Libra',     'Lb')
ON CONFLICT DO NOTHING;
```

### SSL

La conexión a Supabase usa SSL con `rejectUnauthorized: false` (configurado en `backend/db.js`). Esto es necesario porque Supabase usa certificados autofirmados en algunos entornos de conexión directa.

### Row Level Security (RLS)

Si se activa RLS en Supabase, se deben crear políticas para cada tabla o deshabilitar RLS para las tablas usadas por el backend, ya que la conexión se realiza con el rol `postgres` directamente (no a través de la API de Supabase).

---

## Railway (backend en producción)

El backend está desplegado en **Railway** como servicio Node.js.

### Variables de entorno en Railway

Configurar en el panel de Railway bajo **Variables**:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Cadena de conexión de Supabase (URI completa) |
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 caracteres) |
| `ALLOWED_ORIGINS` | URL del frontend en producción, ej. `https://lacq12.github.io` |

> `PORT` no es necesario definirlo: Railway lo inyecta automáticamente en tiempo de ejecución.

### Despliegue automático

Railway redespliega el backend automáticamente cada vez que se hace push a la rama configurada (por defecto `main`). No se requiere ningún paso manual.

### Redespliegue manual

Desde el panel de Railway, usar el botón **Deploy** en la sección del servicio, o desde la CLI:

```bash
railway up
```

### URL del backend

Railway asigna una URL pública del tipo:

```
https://panorderrd-panorderrd-10.up.railway.app
```

Esa URL se usa como valor de `VITE_API_URL` al hacer el build del frontend para producción.

---

## Build y despliegue del frontend

Para generar la versión de producción:

```bash
cd frontend
npm run build
```

Genera la carpeta `dist/` lista para servir como sitio estático. El `base` configurado en `vite.config.js` es `/PanOrderRD/`, compatible con GitHub Pages.

Para desplegar en GitHub Pages, hacer push del contenido de `dist/` a la rama `gh-pages` o configurar GitHub Actions para automatizarlo.

---

## Version en produccion

La aplicación está publicada en:

**https://lacq12.github.io/PanOrderRD/**

---

## Estructura de archivos

```
PanOrderRD/
├── frontend/
│   ├── public/                   Imagenes y assets estáticos
│   ├── src/
│   │   ├── api.js                Cliente HTTP con todos los endpoints
│   │   ├── store.js              Estado global con Zustand
│   │   ├── hooks/
│   │   │   └── useLoading.js     Hook para skeleton de carga
│   │   └── app/
│   │       ├── App.jsx           Layout, autenticación y navegación
│   │       ├── Dashboard.jsx     KPIs y resumen operacional
│   │       └── components/
│   │           ├── Productos.jsx     Gestión de catálogo
│   │           ├── Clientes.jsx      Directorio de clientes
│   │           ├── Pedidos.jsx       Flujo de pedidos
│   │           ├── Configuracion.jsx Usuarios y empleados
│   │           ├── Unidades.jsx      Unidades de medida
│   │           └── NotificationsPanel.jsx Alertas del sistema
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── server.js                 Rutas REST y lógica de negocio
│   ├── db.js                     Configuración del pool PostgreSQL
│   └── package.json
└── README.md
```
