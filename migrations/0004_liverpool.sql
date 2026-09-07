-- El puesto actual en Liverpool. La entrada «Entornos corporativos» era una
-- inferencia a partir de los repositorios públicos (Ventel, LVP); ahora se
-- nombra con precisión y recoge tanto el puesto como las herramientas internas
-- que David construyó por iniciativa propia para su propio equipo.

UPDATE experiences
SET kind         = 'work',
    organization = 'Liverpool',
    role         = 'Asesor de ventas por teléfono e internet',
    location     = 'Morelia, Michoacán',
    description  = 'Atención y venta a clientes por teléfono y canales digitales en el equipo de Ventel. Con el proceso a la vista todos los días, empecé a construir por cuenta propia las herramientas que le faltaban al equipo.',
    highlights   = json('[
      "Portal interno, calendario y tablero de anuncios y tareas para el equipo.",
      "Sistema de cotizaciones y plantillas HTML para agilizar la respuesta al cliente.",
      "Tableros de KPIs y un medidor de productividad para seguir el desempeño.",
      "Todo sobre Google Workspace y Apps Script, el mismo enfoque que hoy aplico en Logidma."
    ]'),
    sort_order   = 15,
    updated_at   = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'exp_sistemas';

-- Si la fila no existiera (base creada desde cero con otro orden), se crea.
INSERT OR IGNORE INTO experiences (id, kind, organization, role, location, start_date, end_date, description, highlights, url, sort_order, visible) VALUES
('exp_sistemas', 'work', 'Liverpool', 'Asesor de ventas por teléfono e internet', 'Morelia, Michoacán', NULL, NULL,
'Atención y venta a clientes por teléfono y canales digitales en el equipo de Ventel. Con el proceso a la vista todos los días, empecé a construir por cuenta propia las herramientas que le faltaban al equipo.',
json('[
  "Portal interno, calendario y tablero de anuncios y tareas para el equipo.",
  "Sistema de cotizaciones y plantillas HTML para agilizar la respuesta al cliente.",
  "Tableros de KPIs y un medidor de productividad para seguir el desempeño.",
  "Todo sobre Google Workspace y Apps Script, el mismo enfoque que hoy aplico en Logidma."
]'),
NULL, 15, 1);
