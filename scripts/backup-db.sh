#!/usr/bin/env bash
set -euo pipefail

SOURCE_DB="${1:-/home/USERNAME/apps/ftainvoicepro/data/prod.db}"
BACKUP_DIR="${2:-/home/USERNAME/apps/ftainvoicepro/backups}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
TARGET="$BACKUP_DIR/prod-$STAMP.db"

cp "$SOURCE_DB" "$TARGET"
echo "Backup created: $TARGET"
