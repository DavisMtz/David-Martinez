-- Contenido tomado del manuscrito «?» — Universo, psicología y filosofía metafísica
-- (David Martínez Arredondo, 2022). Las citas son textuales; solo se corrigieron
-- tildes y puntuación. Se omiten deliberadamente los nombres de terceros, las notas
-- personales y los pasajes sobre salud mental que aparecen en el manuscrito.

-- 1) Sección nueva de citas, entre Filosofía y Contacto.
INSERT OR IGNORE INTO sections (id, type, eyebrow, title, subtitle, content, sort_order, visible) VALUES
('citas', 'quotes', 'Escritura', 'Lo que pienso, escrito.', 'Fragmentos de un manuscrito que escribí en 2022, cuando la pregunta por cómo funciona el todo todavía no se llamaba Logidma.', json('{
  "layout": "stack",
  "items": [
    {
      "text": "El problema es que usamos algo que no sabemos cómo funciona: la mente.",
      "origin": "La mente"
    },
    {
      "text": "Debemos comprender que es diferente saber y entender.",
      "origin": "¿Por qué es difícil entender la filosofía?"
    },
    {
      "text": "Tu lógica no es universal y aplicable en todo: todos tienen su propia lógica.",
      "origin": "¿Qué es lógica?"
    },
    {
      "text": "Todo lo que es imperfecto es una perfección vista desde otro ángulo.",
      "origin": "El universo es perfecto pero imperfecto"
    },
    {
      "text": "Nosotros pensamos por lo que nos compone, y lo que nos compone piensa por nosotros.",
      "origin": "El universo es infinito y finito a la vez"
    },
    {
      "text": "Cada mente es un enigma esperando ser resuelto.",
      "origin": "Las personas son muy cerradas"
    },
    {
      "text": "Damos por hecho cosas que no sabemos cómo llegaron a ser lo que son, en el porqué son lo que son.",
      "origin": "El universo quiere ser descubierto"
    }
  ],
  "source": {
    "title": "«?»",
    "subtitle": "Universo, psicología y filosofía metafísica",
    "year": "2022",
    "note": "Manuscrito propio de unas 25 000 palabras, sin editar ni registrar. Nació de querer entender la teoría de la relatividad y terminó siendo un método: enfocarse, dudar y desarrollar cada pensamiento hasta el fondo. Ese mismo método es el que hoy aplico a los sistemas que construyo.",
    "url": ""
  }
}'), 85, 1);

-- 2) La sección Filosofía pasa a llevar sus propias palabras en vez de una frase escrita para el sitio.
UPDATE sections
SET content = json('{
  "body": "**Todo es cuestión de ser crítico**, de cuestionar qué es lo real, de tener la curiosidad si lo que ves es lo real, de dudar de todo, de buscar las respuestas propias.",
  "align": "center",
  "size": "xl"
}'),
    subtitle = NULL,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'filosofia';

-- 3) La biografía incorpora el origen real de su forma de pensar.
UPDATE sections
SET content = json_set(
      content,
      '$.body',
      'Todo empezó por querer entender la teoría de la relatividad de Einstein. Me puse a leer, a ver documentales y a escuchar podcasts, y en el camino descubrí algo que casi nadie usa: **el enfoque**. Empecé a escribir lo que me llegaba a la mente y ahí desarrollé el pensamiento abstracto. En 2022 eso se convirtió en un manuscrito de filosofía y metafísica.

La misma pregunta que abría ese libro —*cómo funciona y se compone el todo*— es la que abre cada proyecto que tomo. Si un sistema se puede entender, se puede diseñar mejor.

Hoy soy fundador y CEO de **Logidma** (antes DavarCore), un estudio que nace en Morelia para *sistematizar la lógica*: portales centralizados, CRMs automatizados, integraciones con Google Workspace y Apps Script, e inteligencia artificial aplicada a procesos reales. Diseño la cuadrícula invisible donde antes había fricción manual.

En paralelo construyo productos propios sobre Cloudflare Workers y D1 —Veo, Cuponera Morelia, un, Atarax, RetoGymFit— y sigo hablando de filosofía, percepción y realidad en YouTube, TikTok y Twitch.'
    ),
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'sobre-mi';

-- 4) El manuscrito entra en la trayectoria, antes de la etapa de creador de contenido.
INSERT OR IGNORE INTO experiences (id, kind, organization, role, location, start_date, end_date, description, highlights, url, sort_order, visible) VALUES
('exp_libro', 'community', 'Obra propia', 'Autor de «?» — Universo, psicología y filosofía metafísica', 'Morelia, Michoacán', '2022', '2022',
'Manuscrito de unas 25 000 palabras sobre cosmología, psique y metafísica, escrito a partir de investigación propia: libros, foros, documentales, podcasts, conversaciones y observación.',
json('["Sostiene una distinción que sigo usando a diario: saber no es lo mismo que entender.", "De ahí sale el método con el que abordo cualquier sistema: enfocarse, dudar y desarrollar cada pensamiento hasta el fondo.", "Inédito y sin editar; su continuación, centrada en metafísica, quedó anunciada en el propio texto."]'),
NULL, 25, 1);

-- 5) Dos habilidades que el manuscrito respalda.
INSERT OR IGNORE INTO skills (id, name, category, level, sort_order, visible) VALUES
('skl_abstracto', 'Pensamiento abstracto', 'tools', 5, 25, 1),
('skl_escritura', 'Escritura de fondo', 'tools', 4, 35, 1);
