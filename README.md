# davidmartinez.logidma.com

Sitio personal de **David Martínez Arredondo** — fundador de Logidma, arquitecto de sistemas y pensador lógico.
Portafolio modular con panel de administración, desplegado en el edge de Cloudflare.

**Producción:** https://davidmartinez.logidma.com · **Panel:** https://davidmartinez.logidma.com/admin

## Arquitectura

| Capa | Tecnología |
| --- | --- |
| Framework | [React Router v8](https://reactrouter.com) en modo framework (SSR + hidratación) |
| Runtime | [Cloudflare Workers](https://developers.cloudflare.com/workers/) vía `@cloudflare/vite-plugin` |
| Datos | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite en el edge) con migraciones en `migrations/` |
| Imágenes | [Cloudinary](https://cloudinary.com) — subida firmada desde el navegador, entrega optimizada (`f_auto,q_auto`) |
| UI | React 19, Tailwind CSS v4, tipografías Syne / Geist / Geist Mono |
| Motion | GSAP 3.15 (ScrollTrigger, SplitText, DrawSVG), Lenis (scroll suave), Three.js + React Three Fiber (hero WebGL) |

```
app/
  routes/site/      → páginas públicas (home modular, detalle de proyecto)
  routes/admin/     → panel (/admin, noindex, protegido con contraseña)
  routes/api/       → contacto y firma de subidas a Cloudinary
  routes/seo/       → robots.txt y sitemap.xml
  components/site/  → nav, footer, cursor, scroll suave, secciones (sections/*)
  components/three/ → escena WebGL «la cuadrícula invisible»
  components/admin/ → primitivas del panel, selector de imágenes, editor de listas
  lib/              → acceso a D1 (db.server.ts), auth, cloudinary, seo, markdown, specs de secciones
workers/app.ts      → entrada del Worker (RouterContextProvider con env/ctx)
migrations/         → 0001 esquema · 0002 contenido inicial
```

### Cómo funciona la modularidad

La página principal se arma desde la tabla `sections`: cada fila tiene un `type` (hero, about, projects,
experience, skills, gallery, marquee, stats, text, contact), un orden, visibilidad y un JSON de contenido.
`app/lib/sections.ts` define los valores por defecto y los campos que el panel muestra para cada tipo;
`app/components/site/sections/index.tsx` mapea cada tipo a su componente. Para crear un tipo nuevo basta con
agregarlo en ambos archivos.

Los proyectos, la trayectoria, las habilidades, la biblioteca de medios, los mensajes de contacto y los
ajustes globales (nombre, bio, redes, SEO, colores de acento) viven en sus propias tablas y se editan desde `/admin`.

## Desarrollo local

```bash
npm install
cp .dev.vars.example .dev.vars      # y rellena los valores
npm run db:migrate:local           # crea la base local con el esquema y el contenido inicial
npm run dev                        # http://localhost:5173
```

Variables (`.dev.vars` en local, `wrangler secret put` en producción):

| Nombre | Uso |
| --- | --- |
| `ADMIN_PASSWORD` | contraseña de arranque del panel `/admin`; una vez cambiada desde Seguridad, deja de usarse |
| `SESSION_SECRET` | clave HMAC para la cookie de sesión (32+ caracteres aleatorios) |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | credenciales de Cloudinary (solo en el servidor) |

`SITE_URL` y `CLOUDINARY_CLOUD_NAME` son variables públicas en `wrangler.jsonc`.

## Despliegue

```bash
npm run typecheck                          # wrangler types + typegen + tsc
npm run db:migrate:remote                  # aplica migraciones pendientes en D1 remoto
npm run deploy                             # build + wrangler deploy (dominio davidmartinez.logidma.com)
```

### Contraseña del panel

`ADMIN_PASSWORD` solo sirve para el **primer acceso**. En cuanto se cambia la contraseña desde
**Panel → Seguridad**, esta se guarda en la base de datos derivada con PBKDF2-SHA256 (sal propia,
100 000 repeticiones) y el secreto original deja de usarse.

Cambiar la contraseña cierra la sesión en los demás equipos, pero no en el que la cambió: cada cookie
lleva la versión vigente y deja de valer cuando esa versión sube.

Si alguna vez pierdes el acceso, basta con borrar la contraseña guardada para volver a la del secreto:

```bash
npx wrangler d1 execute david-martinez --remote --command "DELETE FROM settings WHERE key='admin_auth';"
npx wrangler secret put ADMIN_PASSWORD   # opcional, para fijar una nueva de arranque
```

### Despliegue automático (opcional)

`.github/workflows/deploy.yml` despliega en cada push a `main` cuando el repositorio tiene:

- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- Variable: `DEPLOY_ENABLED=true`

`.github/workflows/ci.yml` corre typecheck y build en cada PR.

## Editar contenido

1. Entra a `/admin` con la contraseña.
2. **Secciones**: reordena, oculta o crea bloques nuevos; cada tipo tiene su formulario (o JSON directo).
3. **Proyectos**: portada, galería, historia en Markdown, stack, enlaces y color de acento por proyecto.
4. **Media**: arrastra imágenes; se suben a Cloudinary (carpeta `portfolio`) y quedan disponibles en cualquier campo de imagen.
5. **Ajustes**: identidad, redes, SEO, disponibilidad y colores de acento (cambian el tema del sitio en vivo).
6. **Seguridad**: cambia la contraseña del panel por una tuya.

## Notas de rendimiento y accesibilidad

- La escena WebGL solo se carga en el cliente cuando hay WebGL disponible y `prefers-reduced-motion` no está activo; en otro caso se muestra un póster con gradientes.
- Todas las animaciones de scroll respetan `prefers-reduced-motion`.
- El cursor personalizado solo aparece con puntero fino (mouse); en táctil se usa el nativo.
- Imágenes con `srcset` y formatos automáticos (AVIF/WebP) desde Cloudinary.
