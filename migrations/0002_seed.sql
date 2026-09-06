-- Contenido inicial del portafolio. Todo es editable desde /admin.
-- Se usa INSERT OR IGNORE para que la migración sea idempotente y no pise ediciones posteriores.

INSERT OR IGNORE INTO settings (key, value) VALUES ('site', json('{
  "name": "David Martínez Arredondo",
  "shortName": "DM",
  "headline": "Diseño la cuadrícula invisible.",
  "tagline": "Fundador de Logidma · Arquitecto de sistemas · Pensador lógico",
  "bio": "Autodidacta, filósofo metafísico y lógico. Fundé **Logidma** para sistematizar la lógica: portales, CRMs, automatizaciones y productos que quitan la fricción manual a negocios reales, desde Morelia para donde haga falta.",
  "location": "Morelia, Michoacán, México",
  "coordinates": "19.7683° N, 101.1894° W",
  "email": "contacto@logidma.com",
  "phone": "+52 443 101 4385",
  "availability": "open",
  "availabilityText": "Disponible para nuevos proyectos",
  "avatar": "portfolio/avatar",
  "ogImage": "",
  "seoTitle": "David Martínez Arredondo — Fundador de Logidma · Arquitecto de sistemas en Morelia",
  "seoDescription": "Portafolio personal de David Martínez Arredondo: productos digitales, automatizaciones y sistemas construidos desde Morelia con Cloudflare Workers, React, Google Workspace y Apps Script.",
  "keywords": ["David Martínez Arredondo", "Logidma", "Morelia", "desarrollador", "arquitecto de sistemas", "Cloudflare Workers", "React", "Apps Script", "Google Workspace", "automatización", "filosofía"],
  "socials": [
    {"label": "GitHub", "url": "https://github.com/DavisMtz", "handle": "@DavisMtz"},
    {"label": "LinkedIn", "url": "https://www.linkedin.com/in/david-martinez-arredondo-86b4182bb", "handle": "david-martinez-arredondo"},
    {"label": "Instagram", "url": "https://www.instagram.com/davidmartinezarredondo", "handle": "@davidmartinezarredondo"},
    {"label": "X", "url": "https://x.com/PensadorLogico_", "handle": "@PensadorLogico_"},
    {"label": "TikTok", "url": "https://www.tiktok.com/@filosofiadavica", "handle": "@filosofiadavica"},
    {"label": "Twitch", "url": "https://www.twitch.tv/filosofomtz", "handle": "filosofomtz"},
    {"label": "Facebook", "url": "https://www.facebook.com/davis.martinesad", "handle": "davis.martinesad"},
    {"label": "Reddit", "url": "https://www.reddit.com/user/Open-Agency-4437/", "handle": "u/Open-Agency-4437"},
    {"label": "Logidma", "url": "https://logidma.com", "handle": "logidma.com"}
  ],
  "footerNote": "Diseñado y construido en Morelia. Corre en el edge de Cloudflare.",
  "resumeUrl": "",
  "accent": "#38e0ff",
  "accent2": "#7c8cff",
  "locale": "es-MX"
}'));

-- ---------- Secciones ----------
INSERT OR IGNORE INTO sections (id, type, eyebrow, title, subtitle, content, sort_order, visible) VALUES
('hero', 'hero', NULL, NULL, NULL, json('{
  "headline": "Diseño la\n*cuadrícula*\ninvisible.",
  "sub": "Soy David Martínez Arredondo: fundador de Logidma, arquitecto de sistemas y pensador lógico. Construyo portales, automatizaciones y productos que convierten la fricción manual en flujos que simplemente funcionan.",
  "ctaPrimary": {"label": "Ver proyectos", "url": "#proyectos"},
  "ctaSecondary": {"label": "Hablemos", "url": "#contacto"},
  "scene": "lattice",
  "ticker": ["Morelia, MX", "Logidma", "Cloudflare Workers", "React", "Apps Script", "IA aplicada", "Lógica"],
  "showAvailability": true
}'), 10, 1),

('marquee', 'marquee', NULL, NULL, NULL, json('{
  "items": ["La lógica, sistematizada", "Diseño · Métodos · Agilidad", "¿Cómo funciona y se compone el todo?", "Morelia → mundo"],
  "speed": 42
}'), 20, 1),

('sobre-mi', 'about', 'Sobre mí', 'Autodidacta, lógico, constructor.', NULL, json('{
  "body": "Empecé preguntándome **cómo funciona y se compone el todo**. Esa pregunta me llevó de la filosofía y la lógica al código: si un sistema se puede entender, se puede diseñar mejor.\n\nHoy soy fundador y CEO de **Logidma** (antes DavarCore), un estudio que nace en Morelia para *sistematizar la lógica*: portales centralizados, CRMs automatizados, integraciones con Google Workspace y Apps Script, e inteligencia artificial aplicada a procesos reales. Diseño la cuadrícula invisible donde antes había fricción manual.\n\nEn paralelo construyo productos propios sobre Cloudflare Workers y D1 —Veo, Cuponera Morelia, un, Atarax, RetoGymFit— y hablo de filosofía, percepción y realidad en TikTok, X y Twitch. Analítico por naturaleza, amante de cualquier forma de expresión humana o universal.",
  "image": "portfolio/avatar",
  "facts": [
    {"label": "Base", "value": "Morelia, Michoacán"},
    {"label": "Rol", "value": "Fundador & CEO · Logidma"},
    {"label": "Enfoque", "value": "Sistemas, automatización, producto"},
    {"label": "Stack", "value": "Cloudflare · React · Apps Script · IA"},
    {"label": "Respuesta", "value": "En menos de 72 horas"}
  ],
  "badges": ["Autodidacta", "Lógica", "Metafísica", "Sistemas", "Producto", "Morelia"]
}'), 30, 1),

('proyectos', 'projects', 'Proyectos', 'Cosas que existen porque las construí.', 'Productos propios y sistemas para negocios reales. Cada uno resuelve una fricción concreta.', json('{
  "layout": "rail",
  "limit": 8,
  "onlyFeatured": false,
  "showAllLink": false
}'), 40, 1),

('cifras', 'stats', 'En números', NULL, NULL, json('{
  "items": [
    {"value": "8", "suffix": "", "label": "Productos en marcha"},
    {"value": "39", "suffix": "+", "label": "Repositorios públicos"},
    {"value": "72", "suffix": "h", "label": "Tiempo máximo de respuesta"},
    {"value": "100", "suffix": "%", "label": "Desplegado en el edge"}
  ]
}'), 50, 1),

('trayectoria', 'experience', 'Trayectoria', 'De la fricción manual al sistema.', NULL, json('{
  "kinds": ["work", "education", "award", "community"]
}'), 60, 1),

('habilidades', 'skills', 'Habilidades', 'Un sistema de herramientas.', 'Lo que uso para pensar, diseñar y construir. El tamaño indica cuánto lo uso.', json('{
  "layout": "constellation"
}'), 70, 1),

('filosofia', 'text', 'Filosofía', NULL, NULL, json('{
  "body": "**¿Cómo funciona y se compone el todo?** Esa pregunta es el origen de todo lo que construyo: entender un sistema hasta el fondo y después diseñar la estructura invisible que lo hace funcionar sin fricción.",
  "align": "center",
  "size": "xl"
}'), 80, 1),

('contacto', 'contact', 'Contacto', 'Hablemos.', '¿Tienes un proceso que duele, un producto por lanzar o una idea que necesita lógica? Escríbeme y te respondo en menos de 72 horas.', json('{
  "body": "¿Tienes un proceso que duele, un producto por lanzar o una idea que necesita lógica? Escríbeme.",
  "showForm": true,
  "links": []
}'), 90, 1);

-- ---------- Proyectos ----------
INSERT OR IGNORE INTO projects (id, slug, title, tagline, description, role, year, status, url, repo_url, tags, stack, cover_image, gallery, accent, featured, sort_order, visible) VALUES
('prj_logidma', 'logidma', 'Logidma', 'La lógica, sistematizada. Estudio de sistemas internos, automatización y blindaje legal TI.',
'## El problema

Las empresas acumulan fricción invisible: hojas de cálculo que nadie entiende, procesos que dependen de una persona, portales dispersos y contratos de tecnología sin blindaje.

## La solución

**Logidma** (LOGI = lógica · DMA = Diseño, Métodos, Agilidad) diseña la cuadrícula invisible: portales centralizados, CRMs automatizados, integraciones con Google Workspace y Apps Script, e implementaciones de IA (chatbots, RAG, análisis de documentos) con respaldo legal —contratos, NDAs y propiedad intelectual— gracias a un equipo técnico + legal.

## Cómo trabajamos

- Diagnóstico gratuito de 30 minutos.
- Respuesta máxima en 72 horas.
- Entregables que el equipo del cliente puede operar sin nosotros.

Logidma.com es también el hub de productos propios: **ULIX**, el espacio donde viven las herramientas (sin menús que recorrer), y **Maflu**, el lienzo de mapas mentales.',
'Fundador, estrategia, diseño y desarrollo', '2026', 'live', 'https://logidma.com', NULL,
json('["Estudio", "Automatización", "Google Workspace", "IA aplicada"]'),
json('["Next.js", "Cloudflare", "Firebase", "Apps Script", "Python"]'),
'portfolio/projects/logidma', json('[]'), '#2f7bff', 1, 10, 1),

('prj_veo', 'veo', 'Veo', 'Streaming sin rastreo. Un reproductor de video con modo discreto de lectura.',
'## Qué es

**Veo** es un front-end de video centrado en la privacidad: reproduce contenido de YouTube sin cookies de rastreo, con historial, suscripciones y guardados que viven solo en tu navegador.

## Detalles que importan

- Modo discreto de lectura y reproducción en ventana flotante (PiP).
- Limpieza automática de parámetros de rastreo en los enlaces.
- Transcripciones, búsqueda en Wikipedia y reproducción automática del siguiente video.
- Es una PWA: se instala como app y funciona en móvil.

## Stack

HTML estático + GSAP para la interfaz, desplegado en Cloudflare Workers, con proxies a instancias de youtube-nocookie e Invidious.',
'Diseño, producto y desarrollo', '2026', 'live', 'https://veo.logidma.com', NULL,
json('["Producto", "Privacidad", "PWA", "Video"]'),
json('["HTML", "JavaScript", "GSAP", "Cloudflare Workers"]'),
'portfolio/projects/veo', json('[]'), '#10b981', 1, 20, 1),

('prj_cuponera', 'cuponera-morelia', 'Cuponera Morelia', 'El motor de ahorro e impulso al comercio local. Orgullosamente de Morelia.',
'## Qué es

Una plataforma de cupones para el comercio local de Morelia con dos caras: quien **busca ofertas** las encuentra, las guarda y las canjea en mostrador; quien **tiene un negocio** publica promociones y mide resultados.

## Por qué

Los negocios de barrio compiten contra plataformas que se quedan con el margen. Cuponera Morelia les da una herramienta simple, sin comisiones abusivas, para atraer clientes de su propia ciudad.

## Stack

Cloudflare Workers + D1 como base de datos en el edge, con onboarding por rol, autenticación y panel para negocios.',
'Producto, diseño y desarrollo', '2026', 'building', 'https://cuponeramorelia.logidma.com', NULL,
json('["Producto", "Comercio local", "Marketplace"]'),
json('["Cloudflare Workers", "D1", "HTML", "JavaScript"]'),
'portfolio/projects/cuponera-morelia', json('[]'), '#954052', 1, 30, 1),

('prj_un', 'un', 'un', 'Invitaciones, casetas y taquilla con un solo pase. Un mismo pase, tres puertas.',
'## Qué es

**un** genera un pase QR único que funciona como invitación personalizada para cada invitado, como acceso temporal a casetas de fraccionamientos (visitas que caducan solas) y como boleto para venta de taquilla.

## Detalles

- Portadas, logos, recintos y galerías por evento, servidos desde Cloudinary.
- Gratis para empezar; pensado para organizadores, fraccionamientos y venues.

## Stack

Vite + GSAP en el front, Cloudflare Workers y D1 detrás, Cloudinary para medios.',
'Producto, diseño y desarrollo', '2026', 'building', 'https://un.logidma.com', NULL,
json('["Producto", "Eventos", "QR", "Acceso"]'),
json('["Vite", "GSAP", "Cloudflare Workers", "D1", "Cloudinary"]'),
'portfolio/projects/un', json('[]'), '#e5e7eb', 1, 40, 1),

('prj_atarax', 'atarax', 'Atarax', 'Descubre Villas del Pedregal y Morelia: negocios, servicios y eventos hiperlocales.',
'## Qué es

Un directorio hiperlocal para explorar negocios, servicios y eventos por lista o mapa, con acceso sin contraseña (Google o enlace mágico) y la opción de agregar lugares desde la comunidad.

## Por qué

Lo que pasa a tres calles de tu casa no aparece en los grandes mapas. Atarax empieza por Villas del Pedregal y crece con Morelia.

## Stack

Módulos ES nativos, Cloudflare Workers y D1, autenticación passwordless.',
'Producto, diseño y desarrollo', '2026', 'building', 'https://atarax.logidma.com', NULL,
json('["Producto", "Hiperlocal", "Directorio", "Mapas"]'),
json('["JavaScript", "Cloudflare Workers", "D1"]'),
'portfolio/projects/atarax', json('[]'), '#f0728f', 1, 50, 1),

('prj_retogymfit', 'retogymfit', 'RetoGymFit', 'Reto Gym 2026 — Más fuerte que ayer. Registra entrenamientos, defiende tu racha y compite por el bote.',
'## Qué es

Una app para retos de gimnasio en equipo: cada participante registra sus entrenamientos, mantiene su racha y compite por el bote con su equipo. Con vistas previas para compartir cada avance en redes.

## Arquitectura

- App React (Vite) en Firebase Hosting.
- Workers dedicados en Cloudflare para autenticación, medios e imágenes Open Graph por publicación.
- D1 como base de datos y KV para códigos de recuperación.

## Stack

React, Firebase, GSAP, Cloudflare Workers, D1, KV.',
'Producto, diseño y desarrollo', '2026', 'live', 'https://retogymfit.web.app', NULL,
json('["Producto", "Fitness", "Comunidad", "Gamificación"]'),
json('["React", "Vite", "Firebase", "Cloudflare Workers", "D1", "KV"]'),
'portfolio/projects/retogymfit', json('[]'), '#c6ff3d', 1, 60, 1),

('prj_maflu', 'maflu', 'Maflu', 'Lienzo para construir mapas mentales y diagramas de flujo. Se guarda en tu navegador.',
'## Qué es

**Maflu** vive dentro de ULIX, el espacio de herramientas de Logidma. Es un lienzo para mapas mentales y diagramas de flujo que se guarda en tu navegador, se comparte por enlace y se exporta a PNG, PDF o JSON.

## Filosofía

Sin cuentas, sin menús que recorrer: abres, piensas, exportas.',
'Diseño y desarrollo', '2026', 'live', 'https://logidma.com/ulix/maflu', NULL,
json('["Herramienta", "Productividad", "Diagramas"]'),
json('["JavaScript", "Canvas", "Next.js"]'),
'portfolio/projects/maflu', json('[]'), '#3b82f6', 0, 70, 1),

('prj_rutador', 'rutador', 'Rutador', 'Herramienta interna protegida con llave: se pide una vez y queda guardada un año.',
'## Qué es

Una herramienta interna de Logidma, protegida con llave de acceso, desplegada en Cloudflare Workers. Los detalles son privados; el patrón —llave única, sesión de un año, interfaz mínima— se reutiliza en otros proyectos del estudio.',
'Diseño y desarrollo', '2026', 'live', 'https://rutador.logidma.com', NULL,
json('["Interno", "Herramienta"]'),
json('["Cloudflare Workers", "JavaScript"]'),
'portfolio/projects/rutador', json('[]'), '#3d5afe', 0, 80, 1);

-- ---------- Trayectoria ----------
INSERT OR IGNORE INTO experiences (id, kind, organization, role, location, start_date, end_date, description, highlights, url, sort_order, visible) VALUES
('exp_logidma', 'work', 'Logidma', 'Fundador & CEO', 'Morelia, Michoacán', '2026', NULL,
'Estudio de sistemas internos, automatización e IA aplicada, con respaldo legal en TI. Antes operaba como **DavarCore**.',
json('["Portales centralizados, CRMs automatizados y flujos en Google Workspace + Apps Script.", "Implementaciones de IA: chatbots, RAG, análisis de documentos e integración de APIs de LLM.", "Equipo técnico + legal: contratos, NDAs y propiedad intelectual para proyectos de tecnología.", "Productos propios: Veo, Cuponera Morelia, un, Atarax, RetoGymFit, Maflu."]'),
'https://logidma.com', 10, 1),

('exp_sistemas', 'work', 'Entornos corporativos', 'Arquitecto de sistemas internos', 'Morelia, Michoacán', NULL, NULL,
'Diseño y construcción de herramientas internas para equipos de ventas y operaciones: portales, calendarios, tableros de anuncios y tareas, sistemas de cotización y medidores de productividad.',
json('["Ingeniería HTML y Apps Script sobre Google Workspace.", "Tableros de KPIs y automatización de reportes.", "CRMs a la medida, incluido uno para el sector inmobiliario."]'),
NULL, 20, 1),

('exp_creador', 'community', 'DavarCore · @filosofiadavica', 'Creador de contenido de filosofía', 'TikTok · X · Twitch', '2020', NULL,
'Reflexiones sobre percepción, realidad y lógica en formato corto. Conversaciones profundas y gameplays tranquilos en Twitch.',
json('["Más de 1,100 seguidores y 26 mil «me gusta» en TikTok.", "Pregunta guía: ¿Realidad?"]'),
'https://www.tiktok.com/@filosofiadavica', 30, 1),

('exp_autodidacta', 'education', 'Formación autodidacta', 'Filosofía, lógica y sistemas', NULL, NULL, NULL,
'Metafísica, lógica formal, diseño de sistemas y desarrollo de software, aprendidos por cuenta propia y aplicados en productos reales.',
json('[]'), NULL, 40, 1);

-- ---------- Habilidades ----------
INSERT OR IGNORE INTO skills (id, name, category, level, sort_order, visible) VALUES
('skl_react', 'React', 'frontend', 5, 10, 1),
('skl_ts', 'TypeScript', 'frontend', 4, 20, 1),
('skl_js', 'JavaScript', 'frontend', 5, 30, 1),
('skl_html', 'HTML & CSS', 'frontend', 5, 40, 1),
('skl_vite', 'Vite', 'frontend', 4, 50, 1),
('skl_gsap', 'GSAP', 'frontend', 4, 60, 1),
('skl_next', 'Next.js', 'frontend', 3, 70, 1),
('skl_pwa', 'PWA', 'frontend', 3, 80, 1),
('skl_node', 'Node.js', 'backend', 4, 10, 1),
('skl_python', 'Python', 'backend', 4, 20, 1),
('skl_appsscript', 'Apps Script', 'backend', 5, 30, 1),
('skl_api', 'APIs REST', 'backend', 5, 40, 1),
('skl_sql', 'SQL', 'backend', 4, 50, 1),
('skl_workers', 'Cloudflare Workers', 'cloud', 5, 10, 1),
('skl_d1', 'D1', 'cloud', 4, 20, 1),
('skl_firebase', 'Firebase', 'cloud', 4, 30, 1),
('skl_workspace', 'Google Workspace', 'cloud', 5, 40, 1),
('skl_cloudinary', 'Cloudinary', 'cloud', 3, 50, 1),
('skl_auto', 'Automatización', 'data', 5, 10, 1),
('skl_kpi', 'KPIs y tableros', 'data', 4, 20, 1),
('skl_llm', 'LLMs y RAG', 'data', 4, 30, 1),
('skl_ui', 'UI editorial', 'design', 4, 10, 1),
('skl_brand', 'Identidad de producto', 'design', 4, 20, 1),
('skl_motion', 'Motion', 'design', 3, 30, 1),
('skl_producto', 'Estrategia de producto', 'product', 4, 10, 1),
('skl_sistemas', 'Sistemas internos', 'product', 5, 20, 1),
('skl_legal', 'Contratos y NDAs de TI', 'product', 3, 30, 1),
('skl_git', 'Git & GitHub', 'tools', 4, 10, 1),
('skl_wrangler', 'Wrangler', 'tools', 4, 20, 1),
('skl_logica', 'Lógica formal', 'tools', 5, 30, 1);

-- ---------- Media ----------
INSERT OR IGNORE INTO media (id, public_id, url, width, height, format, bytes, resource_type, alt) VALUES
('med_logidma', 'portfolio/projects/logidma', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/logidma.png', 1200, 630, 'png', 125742, 'image', 'Logidma'),
('med_veo', 'portfolio/projects/veo', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/veo.png', 1280, 800, 'png', 328697, 'image', 'Veo'),
('med_un', 'portfolio/projects/un', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/un.png', 1200, 630, 'png', 348422, 'image', 'un'),
('med_atarax', 'portfolio/projects/atarax', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/atarax.png', 1200, 630, 'png', 63222, 'image', 'Atarax'),
('med_retogymfit', 'portfolio/projects/retogymfit', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/retogymfit.png', 512, 512, 'png', 91097, 'image', 'RetoGymFit'),
('med_cuponera', 'portfolio/projects/cuponera-morelia', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/cuponera-morelia.png', 1600, 1000, 'png', 263641, 'image', 'Cuponera Morelia'),
('med_maflu', 'portfolio/projects/maflu', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/maflu.png', 1600, 1000, 'png', 263127, 'image', 'Maflu'),
('med_rutador', 'portfolio/projects/rutador', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/projects/rutador.png', 1600, 1000, 'png', 266185, 'image', 'Rutador'),
('med_avatar', 'portfolio/avatar', 'https://res.cloudinary.com/srz5sh9l/image/upload/portfolio/avatar.jpg', 1080, 1080, 'jpg', 101185, 'image', 'David Martínez Arredondo');
