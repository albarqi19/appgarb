# إنشاء جلسة تسميع جديدة - اختبار نهائي
Write-Host "🎯 إنشاء جلسة تسميع جديدة" -ForegroundColor Green

# بيانات صحيحة مطابقة للنمط الموجود
$sessionData = @{
    student_id = 1
    teacher_id = 1
    quran_circle_id = 1
    start_surah_number = 2
    start_verse = 1
    end_surah_number = 2
    end_verse = 5
    recitation_type = "مراجعة صغرى"
    duration_minutes = 20
    grade = 8.75
    evaluation = "جيد جداً"
    teacher_notes = "مراجعة ممتازة لسورة البقرة"
}

$jsonData = $sessionData | ConvertTo-Json -Depth 5

Write-Host "📤 البيانات المرسلة:" -ForegroundColor Cyan
Write-Host $jsonData -ForegroundColor White

try {
    # إرسال الطلب
    $headers = @{
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/sessions/" `
        -Method POST `
        -Headers $headers `
        -Body $jsonData
    
    Write-Host "`n✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
    Write-Host "🎉 استجابة الخادم:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    # استخراج معرف الجلسة الجديدة
    $newSessionId = $response.data.session_id
    Write-Host "`n📝 معرف الجلسة الجديدة: $newSessionId" -ForegroundColor Magenta
    
    # اختبار إضافة خطأ للجلسة الجديدة
    if ($newSessionId) {
        Write-Host "`n📝 إضافة خطأ للجلسة الجديدة..." -ForegroundColor Yellow
        
        $errorData = @{
            session_id = $newSessionId
            error_type = "إبدال"
            surah_number = 2
            verse_number = 3
            error_description = "إبدال كلمة في الآية الثالثة"
            correction = "التصحيح: الكلمة الصحيحة"
        } | ConvertTo-Json
        
        $errorResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/errors/" `
            -Method POST `
            -Headers $headers `
            -Body $errorData
        
        Write-Host "✅ تم إضافة الخطأ بنجاح!" -ForegroundColor Green
        Write-Host "📋 استجابة إضافة الخطأ:" -ForegroundColor Cyan
        $errorResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    }
    
} catch {
    Write-Host "`n❌ فشل في إنشاء الجلسة!" -ForegroundColor Red
    Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
    
    # محاولة الحصول على تفاصيل الخطأ
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "`nتفاصيل الخطأ من الخادم:" -ForegroundColor Red
            Write-Host $errorBody -ForegroundColor White
        } catch {
            Write-Host "لا يمكن قراءة تفاصيل الخطأ" -ForegroundColor Red
        }
    }
}

Write-Host "`n🏁 انتهى الاختبار" -ForegroundColor Green
