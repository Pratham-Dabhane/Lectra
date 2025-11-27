# ============================================
# Phase 5 Setup Script
# Automates database migration for Supabase
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Phase 5: Memory & History Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if migration file exists
$migrationFile = "backend\database\migration_phase5.sql"
if (!(Test-Path $migrationFile)) {
    Write-Host "❌ Error: Migration file not found at $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Migration file found" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "📋 Setup Instructions:" -ForegroundColor Yellow
Write-Host "1. Open your Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to SQL Editor → New Query" -ForegroundColor White
Write-Host "4. Copy the SQL migration content (will be copied to clipboard)" -ForegroundColor White
Write-Host "5. Paste into SQL Editor and click 'Run'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Ready to copy migration SQL to clipboard? (y/n)"

if ($continue -ne "y") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

# Read migration file and copy to clipboard
try {
    $sqlContent = Get-Content $migrationFile -Raw
    Set-Clipboard -Value $sqlContent
    Write-Host "✓ Migration SQL copied to clipboard!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Go to Supabase SQL Editor" -ForegroundColor White
    Write-Host "2. Press Ctrl+V to paste the migration" -ForegroundColor White
    Write-Host "3. Click 'Run' or press Ctrl+Enter" -ForegroundColor White
    Write-Host "4. Verify tables created: chats, user_preferences, user_memory" -ForegroundColor White
    Write-Host ""
    Write-Host "After migration completes, restart your backend:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Cyan
    Write-Host "  ..\.venv\Scripts\python.exe -m uvicorn main:app --reload" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✨ Phase 5 will be ready to use!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error copying to clipboard: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can manually open the file here:" -ForegroundColor Yellow
    Write-Host "  $migrationFile" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Read PHASE_5_MEMORY.md for details" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
