# اختبار القيم المقبولة لحالة التحضير
$baseUrl = "https://inviting-pleasantly-barnacle.ngrok-free.app/api"
$token = "1|V9lAWGMkBpN8oQLjL6fHJhQrXVjKJHa9HlBuFIGta1bb9e90"

# القيم المختلفة لاختبارها
$statusValues = @("present", "absent", "late", "excused", "مأذون", "معذور", "مستأذن")

# Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
    "ngrok-skip-browser-warning" = "true"
}

Write-Host "🔍 اختبار القيم المقبولة لحالة التحضير..." -ForegroundColor Cyan
Write-Host ""

foreach ($status in $statusValues) {
    Write-Host "اختبار الحالة: $status" -ForegroundColor Yellow
    
    $body = @{
        student_name = "طالب تجريبي"
        date = "2025-06-10"
        status = $status
        period = "العصر"
        notes = "اختبار حالة $status"
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/attendance/record" -Method POST -Headers $headers -Body $body
        Write-Host "✅ نجح: $status" -ForegroundColor Green
        Write-Host "   الاستجابة: $($response.message)" -ForegroundColor Gray
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_.Exception.Response | ConvertFrom-Json -ErrorAction SilentlyContinue
        
        if ($statusCode -eq 422) {
            Write-Host "❌ فشل: $status (422 - قيمة غير مقبولة)" -ForegroundColor Red
            if ($errorResponse.errors.status) {
                Write-Host "   الخطأ: $($errorResponse.errors.status)" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ فشل: $status ($statusCode)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

Write-Host "🏁 انتهى الاختبار" -ForegroundColor Cyan
