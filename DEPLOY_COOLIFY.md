# 🚀 Guía de Despliegue en Coolify (Oracle VPS) — Florería La Carreta

Esta guía detalla paso a paso cómo desplegar la plataforma completa (Frontend React + Backend ASP.NET Core 9 + MySQL 8 + Notificaciones Zoho) en tu VPS de Oracle utilizando **Coolify** conectado a **GitHub**.

---

## 🏗️ Arquitectura de Despliegue

```
        Internet / Clientes
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      VPS Oracle Cloud                       │
│                                                             │
│   Coolify Traefik Reverse Proxy (SSL Automático Let's Encrypt)
│   Dominio: https://floreria.molinazdev.lat                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Contenedor Web (Nginx + React Build)                 │   │
│   │ - Sirve la SPA React optimizada                     │   │
│   │ - Redirige /api/* hacia el contenedor api:5000       │   │
│   │ - Redirige /uploads/* hacia el contenedor api:5000   │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │ Red interna Docker           │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Contenedor API (ASP.NET Core 9 .NET)                 │   │
│   │ - Autenticación JWT                                 │   │
│   │ - CRUD Productos, Categorías, Pedidos, Ajustes      │   │
│   │ - Subida de imágenes (/app/uploads)                 │   │
│   │ - Notificaciones Email (MailKit / Zoho SMTP)        │   │
│   └──────────────────────────┬──────────────────────────┘   │
│                              │                              │
│   ┌──────────────────────────▼──────────────────────────┐   │
│   │ Contenedor DB (MySQL 8.0)                           │   │
│   │ - Base de datos: floreria_lacarreta_db              │   │
│   │ - Volumen persistente: mysql_data                   │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Subir cambios a tu Repositorio de GitHub

En tu terminal local de desarrollo:

```bash
git add .
git commit -m "feat: plataforma lista para produccion con backend ASP.NET Core y panel autoadministrable"
git push origin main
```

---

## 2. Configurar el Dominio en DNS

En el panel donde administras `molinazdev.lat` (ej. Cloudflare, Namecheap, etc.):

1. Agrega un **Registro A**:
   - **Nombre / Host**: `floreria` (para que sea `floreria.molinazdev.lat`)
   - **Tipo**: `A`
   - **Contenido / Valor**: `IP_PUBLICA_DE_TU_VPS_ORACLE`
   - **TTL**: Auto o 5 minutos
   - *(Si usas Cloudflare, puedes dejar el Proxy activado en nube naranja)*.

---

## 3. Crear el Recurso en Coolify (Configuración 100% Automática)

1. Ingresa a tu panel de **Coolify** en el VPS.
2. Ve a **Projects** → Selecciona tu proyecto o crea uno (ej. `Florería La Carreta`).
3. Haz clic en **+ New Resource** → Elige **Docker Compose (from Git)**.
4. Selecciona tu integración con **GitHub** y escoge el repositorio **`MZubiri/LaCarreta`**.
5. En la rama, selecciona **`main`**.
6. **¡Listo! No necesitas configurar nada manual:**
   - Coolify detecta automáticamente el archivo `docker-compose.yml`.
   - Lee el archivo `.env.example` y **auto-popula todas las variables de entorno automáticamente**.
   - Lee la etiqueta `coolify.fqdn=https://floreria.molinazdev.lat` y **asigna el dominio y certificado SSL de inmediato**.
   - `docker-compose.yml` tiene además valores por defecto integrados para que la base de datos, el API y el frontend funcionen sin intervención manual.

---

## 6. Desplegar (Deploy)

1. Haz clic en el botón **Deploy** en Coolify.
2. Coolify:
   - Clonará el repositorio desde GitHub.
   - Construirá la imagen de ASP.NET Core 9 (`FloreriaApi/Dockerfile`).
   - Construirá el bundle de React y la imagen Nginx (`Dockerfile.web`).
   - Levantará MySQL 8 con persistencia de datos.
   - Esperará a que la base de datos esté saludable (`healthcheck`).
   - El seeder de C# (`DbInitializer.cs`) inicializará automáticamente:
     - El usuario administrador (`admin` con contraseña `AdminDemo2026`).
     - Todos los 12 arreglos florales iniciales.
     - Las categorías dinámicas.
     - La configuración inicial del negocio (Caldas, Antioquia, WhatsApp, Instagram).

---

## 7. Configuración de Correo Gratuito con Zoho Mail

Para habilitar el envío real de correos de pedidos:

1. Crea una cuenta gratuita en [Zoho Mail Forever Free](https://www.zoho.com/mail/zohomail-pricing.html) (hasta 5 usuarios gratis).
2. Valida la propiedad de tu dominio agregando el registro TXT indicado por Zoho en tu DNS.
3. Configura los registros **MX**, **SPF** (`v=spf1 include:zoho.com ~all`) y **DKIM** en tu DNS.
4. En Zoho Mail:
   - Ve a **Configuración** → **Cuentas de Correo** → **Acceso SMTP** y asegúrate de que esté habilitado.
   - Si tu cuenta tiene 2FA (doble factor), ve a tu cuenta Zoho → **Seguridad** → **Contraseñas de Aplicación** y genera una para "Florería API".
5. Coloca esa contraseña en la variable `SMTP_PASSWORD` en Coolify y dale **Redeploy**.

---

## 8. Acceso al Panel de Administración

- **URL del Panel**: `https://floreria.molinazdev.lat/admin`
- **Usuario**: `admin`
- **Contraseña inicial**: `AdminDemo2026`

Desde el panel, el dueño de la florería puede:
- Cambiar teléfonos, WhatsApp, horarios, dirección y mapas en la pestaña **⚙️ Ajustes del Negocio** (se refleja instantáneamente en todo el sitio).
- Subir fotos directamente desde su computadora o celular a cada producto.
- Crear y ordenar categorías de flores.
- Ver ventas totales, pedidos del día y productos más populares.
- Exportar la lista de pedidos a un archivo Excel (CSV).
- Notificar o escribir al cliente directamente a su WhatsApp con un solo clic.
- Cambiar su contraseña de administrador.

---

## 9. Copias de Seguridad Automáticas (Backups)

Para programar un respaldo diario automático de la base de datos en tu VPS:

1. Conéctate a tu VPS por SSH:
   ```bash
   ssh tu_usuario@IP_DE_TU_ORACLE_VPS
   ```
2. Dale permisos de ejecución al script:
   ```bash
   chmod +x /ruta/al/proyecto/scripts/backup-mysql.sh
   ```
3. Edita el crontab del servidor:
   ```bash
   crontab -e
   ```
4. Agrega la siguiente línea para ejecutar el respaldo todos los días a las 2:00 AM:
   ```cron
   0 2 * * * DB_PASSWORD="TuClaveDbSegura2026!" /ruta/al/proyecto/scripts/backup-mysql.sh >> /var/log/floreria_backup.log 2>&1
   ```

El script conserva automáticamente los últimos 7 días de respaldos y elimina los más antiguos para no saturar el disco.
