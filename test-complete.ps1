# Lectra - Complete Testing Script
# Tests all Phase 4 components

param(
    [string]$FileUrl = "",
    [string]$UserId = ""
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔═══════════════════════════════════════════╗
║   Lectra Phase 4 - Complete Test Suite   ║
╚═══════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Configuration
$BackendUrl = "http://localhost:8000"
$FrontendUrl = "http://localhost:3000"

# Test 1: Backend Health
Write-Host "`n[1/6] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BackendUrl/api/health" -Method GET -TimeoutSec 5
    if ($health.status -eq "healthy") {
        Write-Host "  ✓ Backend is healthy" -ForegroundColor Green
        Write-Host "    • Pinecone: $($health.pinecone_connected)" -ForegroundColor Gray
    } else {
        throw "Backend unhealthy"
    }
} catch {
    Write-Host "  ✗ Backend failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Run: cd backend; .venv\Scripts\Activate.ps1; python main.py" -ForegroundColor Yellow
    exit 1
}

# Test 2: Groq Connection
Write-Host "`n[2/6] Testing Groq API..." -ForegroundColor Yellow
try {
    $groq = Invoke-RestMethod -Uri "$BackendUrl/api/ask/health" -Method GET -TimeoutSec 5
    if ($groq.status -eq "healthy" -and $groq.groq_connected) {
        Write-Host "  ✓ Groq API connected" -ForegroundColor Green
        Write-Host "    • Model: $($groq.model_name)" -ForegroundColor Gray
    } else {
        throw "Groq not connected"
    }
} catch {
    Write-Host "  ✗ Groq failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Check GROQ_API_KEY in backend/.env" -ForegroundColor Yellow
}

# Test 3: Frontend Accessibility
Write-Host "`n[3/6] Testing Frontend..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri $FrontendUrl -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($frontend.StatusCode -eq 200) {
        Write-Host "  ✓ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Frontend failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "    Run: npm run dev" -ForegroundColor Yellow
}

# Test 4: Document Ingestion (if file URL and user ID provided)
if ($FileUrl -and $UserId) {
    Write-Host "`n[4/6] Testing Document Ingestion..." -ForegroundColor Yellow
    try {
        $ingestBody = @{
            file_url = $FileUrl
            user_id = $UserId
        } | ConvertTo-Json

        $ingest = Invoke-RestMethod -Uri "$BackendUrl/api/ingest" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $ingestBody `
            -TimeoutSec 60

        Write-Host "  ✓ Document ingested successfully" -ForegroundColor Green
        Write-Host "    • File: $($ingest.file_name)" -ForegroundColor Gray
        Write-Host "    • Chunks: $($ingest.chunks_created)" -ForegroundColor Gray
        Write-Host "    • Vectors: $($ingest.vectors_stored)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ Ingestion failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "    Details: $errorBody" -ForegroundColor Yellow
        }
    }

    # Test 5: Question Answering
    Write-Host "`n[5/6] Testing Question Answering..." -ForegroundColor Yellow
    try {
        $askBody = @{
            query = "What is this document about?"
            user_id = $UserId
        } | ConvertTo-Json

        $answer = Invoke-RestMethod -Uri "$BackendUrl/api/ask" `
            -Method POST `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $askBody `
            -TimeoutSec 30

        Write-Host "  ✓ Got answer from RAG system" -ForegroundColor Green
        Write-Host "    • Answer: $($answer.answer.Substring(0, [Math]::Min(100, $answer.answer.Length)))..." -ForegroundColor Gray
        Write-Host "    • References: $($answer.references.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ Question answering failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n[4/6] Skipping Document Ingestion (no file URL/user ID)" -ForegroundColor Gray
    Write-Host "`n[5/6] Skipping Question Answering (no file URL/user ID)" -ForegroundColor Gray
}

# Test 6: CORS Configuration
Write-Host "`n[6/6] Testing CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
    }
    $cors = Invoke-WebRequest -Uri "$BackendUrl/api/ask" `
        -Method OPTIONS `
        -Headers $headers `
        -UseBasicParsing `
        -TimeoutSec 5
    
    if ($cors.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "  ✓ CORS configured correctly" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ CORS test inconclusive" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan

if ($FileUrl -and $UserId) {
    Write-Host @"

✓ All core tests completed!

Next Steps:
1. Open http://localhost:3000/auth and login
2. Go to http://localhost:3000/chat
3. Ask: "What is this document about?"
4. Verify you get relevant answers with sources

"@ -ForegroundColor Green
} else {
    Write-Host @"

⚠ Partial testing completed.

To run full tests, provide file URL and user ID:
.\test-complete.ps1 -FileUrl "https://..." -UserId "uuid..."

Or use the helper:
.\test-ingest.ps1

"@ -ForegroundColor Yellow
}
