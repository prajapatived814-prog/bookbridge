@echo off
echo ================================================
echo  BookBridge Django Backend - Setup Script
echo ================================================
echo.

REM Step 1: Create virtual environment if not exists
IF NOT EXIST "venv" (
    echo [1/5] Creating Python virtual environment...
    python -m venv venv
) ELSE (
    echo [1/5] Virtual environment already exists. Skipping.
)

REM Step 2: Activate virtual environment
echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

REM Step 3: Install dependencies
echo [3/5] Installing requirements...
pip install -r requirements.txt

REM Step 4: Run migrations
echo [4/5] Running Django migrations...
python manage.py migrate

REM Step 5: Create superuser if not exists (optional)
echo [5/5] Setup complete!
echo.
echo ================================================
echo  Starting Django server on http://localhost:8000
echo  API Docs: http://localhost:8000/api/docs/
echo  Admin:    http://localhost:8000/admin/
echo.
echo  To create an admin account, run:
echo    python manage.py createsuperuser
echo ================================================
echo.
python manage.py runserver 8000
