#!/usr/bin/env bash
# ============================================================================
# 🧪 BAQUEANO — MIGRACIONES DESDE CERO (tools/ci/migrations-replay.sh)
# 🎯 POR QUÉ: la revisión de Supabase solo corre en main y fallaba en silencio (013 con ids de
#   departamento que no existen, ALTER POLICY sobre una política ya retirada, extensión http sin
#   crear, alias a lugares que una base nueva no tiene). Esta prueba corre en cada PR.
# ⚙️ CÓMO: levanta la imagen oficial de Postgres de Supabase, completa lo que agregan storage-api y
#   gotrue (tools/ci/supabase-services-stub.sql) y aplica supabase/migrations en orden, cada archivo
#   en una transacción, como lo hace Supabase. Se detiene en el primer fallo.
# 📦 QUÉ: `bash tools/ci/migrations-replay.sh` → «TODAS OK» o el archivo y el error.
# ============================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IMAGE="${SUPABASE_PG_IMAGE:-public.ecr.aws/supabase/postgres:17.6.1.011}"
NAME="bq-migrations-replay-$$"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --name "$NAME" -e POSTGRES_PASSWORD=postgres "$IMAGE" >/dev/null || exit 1
for i in $(seq 1 60); do docker exec "$NAME" pg_isready -U postgres -h 127.0.0.1 >/dev/null 2>&1 && break; sleep 2; done
sleep 6
docker exec -i "$NAME" psql -U supabase_admin -d postgres -h 127.0.0.1 -q -v ON_ERROR_STOP=1 < "$ROOT/tools/ci/supabase-services-stub.sql" || { echo "No se pudo preparar la base"; exit 1; }
n=0
for f in $(ls "$ROOT"/supabase/migrations/*.sql | sort); do
  out=$(docker exec -i "$NAME" psql -U postgres -h 127.0.0.1 -v ON_ERROR_STOP=1 -q -1 -f - < "$f" 2>&1)
  if [ $? -ne 0 ]; then
    echo "❌ FALLA: $(basename "$f")"
    echo "$out" | grep -E "ERROR|DETAIL|LINE|HINT" | head -8
    exit 1
  fi
  n=$((n + 1))
done
echo "✅ TODAS OK: $n migraciones aplicadas desde cero."
