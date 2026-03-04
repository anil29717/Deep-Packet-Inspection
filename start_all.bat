@echo off
echo Starting Office DPI Monitor System...
echo =======================================

echo [1/3] Checking Database...
echo Make sure your MySQL server is running locally on port 3306 with root password 'root'.
echo Create 'office_dpi' schema if it does not exist using database/schema.sql
echo =======================================

echo [2/3] Starting Backend API...
cd api
start cmd /k "npm install && npm run dev"
cd ..

echo [3/3] Starting React Frontend...
cd frontend
start cmd /k "npm install && npm run dev"
cd ..

echo =======================================
echo Initialization Complete.
echo Next Steps:
echo - Access Frontend: http://localhost:5173
echo - Access API: http://localhost:3000
echo - To run Python Collector: cd collector ^&^& ..\venv\Scripts\python main.py
echo =======================================
pause
