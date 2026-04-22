#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

echo "Running Prisma migrations..."
#
# This project uses a mix of migrations and `db push` (simple schema sync).
# 1) Apply migrations (safe for prod-style deploys)
# 2) Sync any schema drift (adds new columns/models without writing migrations)
npx prisma migrate deploy || true
npx prisma db push

echo "Starting Next.js..."
npm run start
