# اختبار API التسميع الحقيقي
# Test Real Recitation API

Write-Host "🕌 اختبار إنشاء جلسة تسميع حقيقية" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Yellow

# بيانات إنشاء الجلسة الحقيقية
$sessionData = @{
    student_id = 1
    teacher_id = 1
    quran_circle_id = 1
    start_surah_number = 1
    start_verse = 1
    end_surah_number = 1
    end_verse = 7
    recitation_type = "حفظ"
    duration_minutes = 15
    grade = 9.50
    evaluation = "ممتاز"
    teacher_notes = "حفظ ممتاز لسورة الفاتحة"
} | ConvertTo-Json -Depth 5

Write-Host "📤 إرسال بيانات الجلسة:" -ForegroundColor Cyan
Write-Host $sessionData -ForegroundColor Gray

try {
    # إنشاء جلسة تسميع جديدة
    Write-Host "`n1️⃣ إنشاء جلسة تسميع..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/sessions/" `
        -Method POST `
        -ContentType "application/json" `
        -Body $sessionData
    
    Write-Host "✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
    Write-Host "📋 استجابة الخادم:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    
    # استخراج معرف الجلسة
    $sessionId = $response.data.session_id
    Write-Host "`n📝 معرف الجلسة: $sessionId" -ForegroundColor Magenta
    
    if ($sessionId) {
        # اختبار تحديث الجلسة
        Write-Host "`n2️⃣ تحديث الجلسة..." -ForegroundColor Yellow
        
        $updateData = @{
            grade = 8.50
            evaluation = "جيد جداً"
            teacher_notes = "تم تحديث الملاحظات - $(Get-Date -Format 'HH:mm:ss')"
        } | ConvertTo-Json -Depth 5
        
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/sessions/$sessionId" `
            -Method PUT `
            -ContentType "application/json" `
            -Body $updateData
        
        Write-Host "✅ تم تحديث الجلسة بنجاح!" -ForegroundColor Green
        Write-Host "📋 استجابة التحديث:" -ForegroundColor Cyan
        $updateResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
        
        # اختبار عرض تفاصيل الجلسة
        Write-Host "`n3️⃣ عرض تفاصيل الجلسة..." -ForegroundColor Yellow
        
        $detailsResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/sessions/$sessionId" `
            -Method GET `
            -ContentType "application/json"
        
        Write-Host "✅ تم جلب التفاصيل بنجاح!" -ForegroundColor Green
        Write-Host "📋 تفاصيل الجلسة:" -ForegroundColor Cyan
        $detailsResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
        
        # اختبار إضافة خطأ للجلسة
        Write-Host "`n4️⃣ إضافة خطأ للجلسة..." -ForegroundColor Yellow
        
        $errorData = @{
            session_id = $sessionId
            error_type = "نسيان"
            surah_number = 1
            verse_number = 3
            error_description = "نسيان كلمة في آية مَالِكِ يَوْمِ الدِّينِ"
            correction = "الكلمة المنسية: مَالِكِ"
        } | ConvertTo-Json -Depth 5
        
        $errorResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/errors/" `
            -Method POST `
            -ContentType "application/json" `
            -Body $errorData
        
        Write-Host "✅ تم إضافة الخطأ بنجاح!" -ForegroundColor Green
        Write-Host "📋 استجابة إضافة الخطأ:" -ForegroundColor Cyan
        $errorResponse | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor White
    }
    
    Write-Host "`n🎉 تم اختبار API بنجاح!" -ForegroundColor Green
    Write-Host "✨ جميع العمليات تمت بنجاح!" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ خطأ في الاختبار:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "`n📋 تفاصيل الخطأ من الخادم:" -ForegroundColor Yellow
        $errorDetails = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorDetails)
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody -ForegroundColor Red
    }
}

Write-Host "`n✅ انتهى الاختبار" -ForegroundColor Green
