@echo off
echo Starting Lectra Backend Server...
echo.

REM Check if virtual environment exists
if not exist venv (
    echo Error: Virtual environment not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env exists
if not exist .env (
    echo Error: .env file not found
    echo Please copy .env.example to .env and configure it
    pause
    exit /b 1
)

echo Virtual environment activated
echo Starting FastAPI server...
echo.
echo Server will be available at:
echo - API: http://localhost:8000
echo - Docs: http://localhost:8000/docs
echo - Health: http://localhost:8000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
