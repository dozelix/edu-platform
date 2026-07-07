#!/usr/bin/env bash
set -euo pipefail

echo "=== Seed de EduPlatform via Docker ==="

# Esperar a que MongoDB esté saludable
echo "Esperando a MongoDB..."
until docker exec eduplatform-db mongosh --quiet --eval 'db.runCommand({ping:1}).ok' 2>/dev/null; do
  printf "."
  sleep 1
done
echo " MongoDB listo."

# Ejecutar seed desde el volumen montado
echo "Cargando seed de datos..."
docker exec -i eduplatform-db mongosh eduplatform < seeds/eduplatform.volume.seed.js

echo "=== Seed completado ==="
