# اختبار duration_minutes باستخدام PowerShell Invoke-RestMethod
# Test duration_minutes using PowerShell Invoke-RestMethod

Write-Host "🧪 اختبار duration_minutes باستخدام PowerShell" -ForegroundColor Green
Write-Host "=" * 50

$baseUrl = "http://localhost:8000/api"

try {
    # خطوة 1: فحص حالة الـ API
    Write-Host "📡 فحص حالة الـ API..." -ForegroundColor Yellow
    
    try {
        $healthCheck = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
        Write-Host "✅ الـ API يعمل" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ الـ API غير متاح. تأكد من تشغيل الخادم على المنفذ 8000" -ForegroundColor Red
        Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    # خطوة 2: إنشاء جلسة جديدة
    Write-Host "`n📝 إنشاء جلسة تسميع جديدة..." -ForegroundColor Yellow
    
    $sessionData = @{
        student_id = 1
        teacher_id = 1
        quran_circle_id = 1
        start_surah_number = 1
        start_verse = 1
        end_surah_number = 1
        end_verse = 5
        recitation_type = "حفظ"
        grade = 8.5
        evaluation = "جيد جداً"
        teacher_notes = "اختبار PowerShell duration_minutes"
    }

    Write-Host "البيانات المرسلة:" -ForegroundColor Cyan
    $sessionData | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions" -Method Post -Body ($sessionData | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "استجابة إنشاء الجلسة:" -ForegroundColor Cyan
    $createResponse | ConvertTo-Json -Depth 3

    if (-not $createResponse.success) {
        throw "فشل في إنشاء الجلسة: $($createResponse.message)"
    }

    $sessionId = $createResponse.data.session_id
    Write-Host "✅ تم إنشاء الجلسة بنجاح. معرف الجلسة: $sessionId" -ForegroundColor Green

    # خطوة 3: تحديث الجلسة مع duration_minutes
    Write-Host "`n📝 تحديث الجلسة مع duration_minutes..." -ForegroundColor Yellow

    $updateData = @{
        grade = 9.0
        evaluation = "ممتاز"
        teacher_notes = "تم التحديث مع مدة 35 دقيقة من PowerShell"
        duration_minutes = 35
    }

    Write-Host "بيانات التحديث:" -ForegroundColor Cyan
    $updateData | ConvertTo-Json

    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/$sessionId" -Method Put -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "استجابة التحديث:" -ForegroundColor Cyan
    $updateResponse | ConvertTo-Json -Depth 3

    # خطوة 4: جلب الجلسة للتأكد من حفظ duration_minutes
    Write-Host "`n📝 جلب الجلسة للتأكد من duration_minutes..." -ForegroundColor Yellow

    $getResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/$sessionId" -Method Get
    
    Write-Host "تفاصيل الجلسة المحدثة:" -ForegroundColor Cyan
    $getResponse | ConvertTo-Json -Depth 3

    # التحقق من النتيجة
    if ($getResponse.duration_minutes) {
        Write-Host "✅ نجح الاختبار! تم حفظ duration_minutes: $($getResponse.duration_minutes) دقيقة" -ForegroundColor Green
    } 
    elseif ($getResponse.PSObject.Properties['duration_minutes']) {
        Write-Host "✅ نجح الاختبار! تم حفظ duration_minutes: $($getResponse.duration_minutes) دقيقة" -ForegroundColor Green
    }
    else {
        Write-Host "❌ فشل الاختبار! لم يتم حفظ duration_minutes" -ForegroundColor Red
        Write-Host "الحقول المتاحة في الاستجابة:" -ForegroundColor Yellow
        $getResponse | Get-Member -MemberType NoteProperty | Select-Object Name | ForEach-Object { Write-Host "  - $($_.Name)" }
    }

}
catch {
    Write-Host "❌ خطأ في الاختبار: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "التفاصيل: $($_.ErrorDetails)" -ForegroundColor Red
}

Write-Host "`n🏁 انتهى الاختبار" -ForegroundColor Green
