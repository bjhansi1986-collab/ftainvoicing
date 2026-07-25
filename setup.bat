@echo off
REM FTA Invoice Pro - Setup Script

echo Installing FTA Invoice Pro...
echo.

REM Install npm dependencies
echo [1/4] Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install npm dependencies
    exit /b 1
)

echo.
echo [2/4] Generating Prisma client...
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo Error: Failed to generate Prisma client
    exit /b 1
)

echo.
echo [3/4] Creating .env.local file...
if not exist .env.local (
    copy .env.example .env.local
    echo Please configure .env.local with your database URL
) else (
    echo .env.local already exists, skipping...
)

echo.
echo [4/4] Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local with your PostgreSQL connection string
echo 2. Run: npm run prisma:migrate
echo 3. Start dev server: npm run dev
echo 4. Open http://localhost:3000 in your browser
echo.
echo For more information, see README.md
pause
