#!/bin/sh
set -e

echo "[entrypoint] applying database migrations ..."
npx prisma migrate deploy

echo "[entrypoint] starting Study Q&A (csmju-study-qa)"
exec "$@"
