#!/bin/sh
set -e
echo "🌱 Running seed..."
node dist/seed.js 2>/dev/null || echo "⚠️  Seed skipped (already seeded or error)"
echo "🚀 Starting backend..."
exec node dist/main.js
