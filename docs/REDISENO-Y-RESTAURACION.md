# Observatorio personal — rediseño visual

Fecha: 8 de septiembre de 2026.

## Control desde el panel

- **Ajustes → Experiencia visual:** movimiento inmersivo, sutil o sin animaciones; indicador de recorrido; apertura opcional.
- **Ajustes → Apariencia:** los dos colores siguen controlando toda la identidad, incluidas las órbitas. Se conservan los colores que ya estaban guardados.
- **Secciones → Hero:** órbitas de conocimiento, ondas, cuadrícula o sin escena; luminosidad de 0 a 100; velocidad de 0 a 100; frase y tres conceptos editables junto a la escena.
- **Secciones:** se mantienen visibilidad, orden, títulos, texto y todas las distribuciones existentes. El indicador de recorrido se construye a partir de las secciones visibles, no de una lista fija.
- **Proyectos, Media, Trayectoria, Habilidades y Contacto:** conservan sus datos y sus editores actuales.

La presentación alterna un espacio oscuro de geometría paramétrica, el riel de proyectos, una constelación de herramientas y una pausa clara para la reflexión. La escena se carga después del texto, detiene el render al salir de pantalla o esconder la pestaña y limita la resolución. Si no hay WebGL, hay ahorro de datos o se solicita movimiento reducido, queda una composición geométrica estática. No requiere servicios de IA, subidas nuevas ni almacenamiento adicional.

## Copia de seguridad

- Repositorio: `DavisMtz/David-Martinez`.
- Rama anterior: `backup/pre-visual-redesign-2026-09-08`.
- Commit anterior completo: `83dead2b7c36e79214a9cee64d7ea92feda58093`.
- Rama del rediseño: `codex/visual-redesign-2026-09-08`.
- Worker existente: `david-martinez`.
- Versión que estaba en producción antes del rediseño: `5c75eb74-8e38-44af-b9de-d85ff1b0433e`.
- Despliegue original: `761dac64-1780-47cd-8925-c5b6f1009738`.

No se modificaron filas ni se aplicaron migraciones a la base de datos de producción. Los nuevos controles usan valores por defecto hasta que se guardan desde el panel. Los mensajes, archivos, contraseñas y contenidos existentes permanecen en sus servicios actuales.

## Restablecer el aspecto anterior

Desde Cloudflare: **Workers & Pages → david-martinez → Deployments**, selecciona la versión `5c75eb74-8e38-44af-b9de-d85ff1b0433e` y restaura ese despliegue. Esto recupera el código y los recursos estáticos originales sin revertir los textos que hayas editado en el panel.

Alternativa con Wrangler, autenticado en la cuenta correspondiente:

```bash
npx wrangler rollback 5c75eb74-8e38-44af-b9de-d85ff1b0433e --name david-martinez --message "Restaurar diseño anterior"
```

Si Cloudflare ya no conserva esa versión, usa una copia nueva del repositorio, cambia a `backup/pre-visual-redesign-2026-09-08`, instala con `npm ci` y ejecuta `npm run deploy` con las credenciales en el entorno. No apliques migraciones ni restablezcas D1 para un cambio visual.

La rama `main` conserva el estado original; cualquier cambio futuro que la despliegue sustituirá el rediseño hasta integrar la rama nueva.
