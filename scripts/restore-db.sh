#!/usr/bin/env bash
set -euo pipefail

BACKUP_DB="${1:-}"
TARGET_DB="${2:-/home/USERNAME/apps/ftainvoicepro/data/prod.db}"

if [ -z "$BACKUP_DB" ]; then
  echo "Usage: ./scripts/restore-db.sh /path/to/backup.db [target_db_path]"
  exit 1
fi

cp "$BACKUP_DB" "$TARGET_DB"
echo "Database restored to: $TARGET_DB"
