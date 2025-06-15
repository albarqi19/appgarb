# اختبار القيم المقبولة لحالة الحضور في API
$API_BASE = "https://inviting-pleasantly-barnacle.ngrok-free.app/api"
$token = "2|mB4h7iBUhNgKWZ3rGBebg8A9qkBBHa1XBSR2Md6Z47e07a2b"

# Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "Accept" = "application/json"
    "ngrok-skip-browser-warning" = "true"
}

# قائمة القيم للاختبار
$statusValues = @("حاضر", "غائب", "متأخر", "مستأذن", "present", "absent", "late", "excused", "مأذون", "معذور")

Write-Host "🧪 اختبار القيم المقبولة لحالة الحضور..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

foreach ($status in $statusValues) {
    Write-Host "🔍 اختبار القيمة: '$status'" -ForegroundColor Yellow
    
    $body = @{
        student_name = "طالب اختبار"
        date = "2025-06-10"
        status = $status
        period = "العصر"
        notes = "اختبار API"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/attendance/record" -Method POST -Headers $headers -Body $body -ErrorAction SilentlyContinue
        Write-Host "  ✅ مقبولة - الاستجابة: $($response.message)" -ForegroundColor Green
    }
    catch {
        $errorDetails = $_.Exception.Response
        if ($errorDetails) {
            $statusCode = $errorDetails.StatusCode
            $responseText = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
            
            if ($statusCode -eq 422) {
                Write-Host "  ❌ مرفوضة (422) - التحقق فشل" -ForegroundColor Red
                if ($responseText.errors.status) {
                    Write-Host "    📋 خطأ الحالة: $($responseText.errors.status)" -ForegroundColor DarkRed
                }
            } else {
                Write-Host "  ⚠️  خطأ ($statusCode): $($responseText.message)" -ForegroundColor DarkYellow
            }
        } else {
            Write-Host "  💥 خطأ شبكة: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Milliseconds 500  # تأخير بسيط لتجنب إرهاق الخادم
}

Write-Host ""
Write-Host "✨ انتهى الاختبار!" -ForegroundColor Cyan
