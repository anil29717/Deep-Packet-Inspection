@echo off
set BACKUP_DIR=.\backups
set DB_NAME=office_dpi
set DB_USER=root
set DB_PASS=root
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set TIME=%TIME: =0%
set FILENAME=%BACKUP_DIR%\%DB_NAME%_backup_%DATE%_%TIME%.sql

echo Creating backup directory if it does not exist...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Backing up database '%DB_NAME%'...
mysqldump -u%DB_USER% -p%DB_PASS% %DB_NAME% > "%FILENAME%"

if %ERRORLEVEL% == 0 (
    echo Backup completed successfully: %FILENAME%
) else (
    echo Backup failed! Please check MySQL connection and credentials.
)
pause
