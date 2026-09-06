#!/usr/bin/env bash
# =====================================================================
# Script de Backup Automático para MySQL — Florería La Carreta
# =====================================================================
# Uso en Crontab (diario a las 2:00 AM):
# 0 2 * * * /ruta/al/proyecto/scripts/backup-mysql.sh >> /var/log/floreria_backup.log 2>&1

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/floreria_lacarreta}"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="${DB_CONTAINER:-floreria_db}"
DB_NAME="floreria_lacarreta_db"
DB_USER="${DB_USER:-floreria_user}"
DB_PASS="${DB_PASSWORD:-FloreriaDbPass2026!Secure}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando copia de seguridad de la base de datos ${DB_NAME}..."

# Ejecutar mysqldump dentro del contenedor docker
docker exec "$CONTAINER_NAME" mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

echo "[$(date)] Backup completado con éxito: ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

# Mantener solo los últimos 7 días de backups
find "$BACKUP_DIR" -type f -name "${DB_NAME}_*.sql.gz" -mtime +7 -delete

echo "[$(date)] Limpieza de backups antiguos (+7 días) finalizada."
