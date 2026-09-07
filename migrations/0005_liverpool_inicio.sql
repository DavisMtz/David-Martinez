-- Fecha de inicio en Liverpool, confirmada por David: 6 de febrero de 2024.
-- La línea de tiempo muestra mes y año, así que se guarda con esa precisión.
UPDATE experiences
SET start_date = '2024-02',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'exp_sistemas' AND organization = 'Liverpool';
