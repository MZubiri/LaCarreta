# 🌸 Tasks — Florería La Carreta

## Fase 1 — Correcciones Críticas
- [x] 1.1 Reemplazar todos los teléfonos/WhatsApp placeholder → +573206468689
- [x] 1.2 Quitar credenciales expuestas del admin + fallback hardcodeado
- [x] 1.3 Actualizar datos de contacto (dirección, IG, email, Maps)
- [x] 1.4 Eliminar 8 archivos residuales del template Vite
- [x] 1.5 Fix MXN → COP en autocompletado + import formatCOP
- [x] 1.6 Fix build script en package.json → "vite build"
- [x] 1.7 Generar favicon/logo personalizado (rosa + rueda de carreta)
- [x] 1.8 Agregar robots.txt y sitemap.xml (floreria.molinazdev.lat)
- [x] 1.9 Agregar Open Graph tags + Twitter Cards + canonical URL
- [x] 1.10 Crear página 404 (NotFound.jsx)
- [x] 1.11 Crear página Términos y Condiciones (Terms.jsx)
- [x] 1.12 Crear página Política de Privacidad (Privacy.jsx) - Ley 1581/2012
- [x] 1.13 Agregar links legales al Footer
- [x] 1.14 Registrar nuevas rutas en App.jsx (/terminos, /privacidad, 404 catch-all)
- [x] 1.15 Quitar link público al /admin del Footer
- [x] 1.16 Verificar build exitoso ✅

## Fase 2 — Backend ASP.NET Core Completo
- [x] 2.1 Autenticación JWT real (con AdminDemo2026 y endpoints de login/cambio de clave)
- [x] 2.2 Modelo SiteSettings + Controller (GET público y PUT con JWT)
- [x] 2.3 Subida de imágenes (UploadController con validaciones de formato/tamaño)
- [x] 2.4 CRUD completo Productos (featured, isActive, ocasiones, toggle-active)
- [x] 2.5 Gestión completa Pedidos (filtros por estado/búsqueda, notificaciones por email)
- [x] 2.6 Categorías dinámicas (Category model + CategoriesController)
- [x] 2.7 Dashboard métricas (DashboardController con ventas totales, top productos, estados)
- [x] 2.8 Notificaciones email (MailKit con plantillas HTML para admin y cliente)
- [x] 2.9 Endpoint contacto (ContactController para mensajes desde el formulario web)
- [x] 2.10 Actualizar DbContext + Seeder (DbInitializer con 12 productos, ajustes y admin)

## Fase 3 — Panel Admin Autoadministrable
- [x] 3.1 Pestaña Ajustes del negocio (teléfono, WhatsApp, dirección, horario, maps, etc.)
- [x] 3.2 Upload de imágenes en productos (subida directa al servidor con preview)
- [x] 3.3 Gestión de categorías (crear, editar, ordenar, activar/desactivar)
- [x] 3.4 Filtros y búsqueda de pedidos (por estado, cliente, teléfono, código)
- [x] 3.5 Exportar pedidos CSV (descarga Excel con codificación UTF-8 BOM)

## Fase 4 — Frontend conectado al Backend
- [x] 4.1 SiteSettingsContext (datos dinámicos sincronizados en todo el sitio)
- [x] 4.2 API service con JWT + env vars (VITE_API_URL, Bearer tokens)
- [x] 4.3 Catálogo desde BD (Catalog.jsx y Home.jsx consumiendo API)
- [x] 4.4 Formularios funcionales (Contact.jsx y Cart.jsx registran pedidos reales en BD)
- [x] 4.5 Loading skeletons + notificaciones Toast amigables
- [x] 4.6 Página 404 conectada al router con diseño de marca

## Fase 5 — Despliegue (Coolify + GitHub)
- [x] 5.1 Dockerfile / docker-compose para Coolify (multi-contenedor MySQL, API, Web/Nginx)
- [x] 5.2 Variables de entorno (.env.example con configuración documentada)
- [x] 5.3 SSL + dominio floreria.molinazdev.lat (configuración Traefik/Coolify)
- [x] 5.4 Configurar Zoho Mail (guía paso a paso en DEPLOY_COOLIFY.md)
- [x] 5.5 Backups MySQL (scripts/backup-mysql.sh con retención de 7 días y cron)
