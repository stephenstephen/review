#!/bin/sh

echo " Attente de PostgreSQL sur $DB_HOST:$DB_PORT..."

while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "✅ PostgreSQL est prêt. Démarrage de l'application..."

npm run start:dev
