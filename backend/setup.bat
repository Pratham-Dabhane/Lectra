@echo off
echo ====================================
echo Lectra Backend - Setup Script
echo ====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo Error: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Upgrading pip...
python -m pip install --upgrade pip

echo [4/5] Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo [5/5] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
    echo IMPORTANT: Please edit .env file with your credentials
) else (
    echo .env file already exists, skipping...
)

echo.
echo ====================================
echo Setup Complete! 
echo ====================================
echo.
echo Next steps:
echo 1. Edit .env file with your credentials
echo 2. Run: python main.py
echo 3. Open: http://localhost:8000/docs
echo.
echo For detailed documentation, see PHASE_2.md
echo.
pause
