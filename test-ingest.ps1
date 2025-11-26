# Test Document Ingestion
# Run this after uploading a file through the frontend

# Step 1: Get your values
Write-Host "=== Lectra Document Ingestion Test ===" -ForegroundColor Cyan
Write-Host ""

# You need to provide these:
$fileUrl = Read-Host "Enter the Supabase file URL (from Storage)"
$userId = Read-Host "Enter your User ID (UUID from Auth)"

# Step 2: Test backend health
Write-Host "`nTesting backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET
    Write-Host "✓ Backend is healthy" -ForegroundColor Green
    Write-Host "  Pinecone connected: $($health.pinecone_connected)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host "  Start it with: cd backend; .venv\Scripts\Activate.ps1; python main.py" -ForegroundColor Yellow
    exit 1
}

# Step 3: Test Groq connection
Write-Host "`nTesting Groq connection..." -ForegroundColor Yellow
try {
    $groq = Invoke-RestMethod -Uri "http://localhost:8000/api/ask/health" -Method GET
    Write-Host "✓ Groq is connected" -ForegroundColor Green
    Write-Host "  Model: $($groq.model_name)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Groq connection failed!" -ForegroundColor Red
    Write-Host "  Check GROQ_API_KEY in backend/.env" -ForegroundColor Yellow
}

# Step 4: Ingest document
Write-Host "`nIngesting document..." -ForegroundColor Yellow
Write-Host "  File URL: $fileUrl" -ForegroundColor Gray
Write-Host "  User ID: $userId" -ForegroundColor Gray

try {
    $body = @{
        file_url = $fileUrl
        user_id = $userId
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/ingest" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body

    Write-Host "`n✓ Document ingested successfully!" -ForegroundColor Green
    Write-Host "  File: $($response.file_name)" -ForegroundColor Gray
    Write-Host "  Chunks created: $($response.chunks_created)" -ForegroundColor Gray
    Write-Host "  Vectors stored: $($response.vectors_stored)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "You can now ask questions at: http://localhost:3000/chat" -ForegroundColor Cyan

} catch {
    Write-Host "`n✗ Ingestion failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "  Details: $errorBody" -ForegroundColor Yellow
    }
}

Write-Host ""
