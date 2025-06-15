# اختبار مبسط مع معالجة أخطاء أفضل
Write-Host "🔍 اختبار مبسط لـ API التسميع" -ForegroundColor Green

# بيانات أساسية جداً
$sessionData = @{
    student_id = 1
    teacher_id = 1
    start_surah_number = 1
    start_verse = 1
    end_surah_number = 1
    end_verse = 7
    recitation_type = "حفظ"
} | ConvertTo-Json

Write-Host "📤 البيانات المرسلة:" -ForegroundColor Cyan
Write-Host $sessionData

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/recitation/sessions/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sessionData `
        -UseBasicParsing
    
    Write-Host "✅ نجح الطلب!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content -ForegroundColor White
    
} catch {
    Write-Host "❌ فشل الطلب" -ForegroundColor Red
    Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "تفاصيل الخطأ:" -ForegroundColor Red
            Write-Host $errorBody -ForegroundColor White
        } catch {
            Write-Host "لا يمكن قراءة تفاصيل الخطأ" -ForegroundColor Red
        }
    }
}
