#!/bin/bash
BACKUP_DIR="./backups"
DB_NAME="office_dpi"
DB_USER="root"
DB_PASS="root"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/${DB_NAME}_backup_${DATE}.sql"

echo "Creating backup directory if it does not exist..."
mkdir -p "$BACKUP_DIR"

echo "Backing up database '$DB_NAME'..."
mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$FILENAME"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $FILENAME"
else
    echo "Backup failed! Please check MySQL connection and credentials."
fi
