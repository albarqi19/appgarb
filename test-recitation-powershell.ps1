# اختبار API التسميع باستخدام PowerShell
# Test Recitation API using PowerShell

Write-Host "🕌 اختبار API جلسات التسميع" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Yellow

$baseUrl = "http://localhost:8000"
$apiUrl = "$baseUrl/api"

# اختبار الاتصال بالخادم أولاً
Write-Host "`n🔍 اختبار الاتصال بالخادم..." -ForegroundColor Cyan

try {
    $serverTest = Invoke-RestMethod -Uri $baseUrl -Method GET -TimeoutSec 5
    Write-Host "✅ الخادم يعمل على: $baseUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ لا يمكن الوصول للخادم على: $baseUrl" -ForegroundColor Red
    Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# بيانات جلسة التسميع
$sessionData = @{
    student_id = 1
    teacher_id = 2
    quran_circle_id = 3
    start_surah_number = 2
    start_verse = 1
    end_surah_number = 2
    end_verse = 10
    recitation_type = "حفظ"
    duration_minutes = 30
    grade = 8.5
    evaluation = "جيد جداً"
    teacher_notes = "أداء ممتاز في التسميع"
} | ConvertTo-Json

Write-Host "`n1️⃣ اختبار إنشاء جلسة تسميع جديدة..." -ForegroundColor Cyan
Write-Host "البيانات المرسلة:" -ForegroundColor Yellow
Write-Host $sessionData -ForegroundColor White

try {
    # إنشاء جلسة التسميع
    $headers = @{
        'Content-Type' = 'application/json'
        'Accept' = 'application/json'
    }
    
    $sessionResponse = Invoke-RestMethod -Uri "$apiUrl/recitation/sessions/" -Method POST -Body $sessionData -Headers $headers
    
    Write-Host "`n✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
    Write-Host "الاستجابة:" -ForegroundColor Yellow
    $sessionResponse | ConvertTo-Json -Depth 5 | Write-Host
    
    # استخراج معرف الجلسة
    $sessionId = $null
    if ($sessionResponse.data.session_id) {
        $sessionId = $sessionResponse.data.session_id
    } elseif ($sessionResponse.session_id) {
        $sessionId = $sessionResponse.session_id
    }
    
    if ($sessionId) {
        Write-Host "`n📝 معرف الجلسة: $sessionId" -ForegroundColor Magenta
        
        # اختبار إضافة أخطاء للجلسة
        Write-Host "`n2️⃣ اختبار إضافة أخطاء للجلسة..." -ForegroundColor Cyan
        
        $errorData = @{
            session_id = $sessionId
            error_type = "نسيان"
            surah_number = 2
            verse_number = 5
            error_description = "نسيان كلمة في الآية الخامسة"
            correction = "الكلمة الصحيحة هي: الله"
        } | ConvertTo-Json
        
        Write-Host "بيانات الخطأ:" -ForegroundColor Yellow
        Write-Host $errorData -ForegroundColor White
        
        try {
            $errorResponse = Invoke-RestMethod -Uri "$apiUrl/recitation/errors/" -Method POST -Body $errorData -Headers $headers
            
            Write-Host "`n✅ تم إضافة الخطأ بنجاح!" -ForegroundColor Green
            Write-Host "الاستجابة:" -ForegroundColor Yellow
            $errorResponse | ConvertTo-Json -Depth 5 | Write-Host
            
        } catch {
            Write-Host "`n❌ فشل في إضافة الخطأ" -ForegroundColor Red
            Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # اختبار عرض تفاصيل الجلسة
        Write-Host "`n3️⃣ اختبار عرض تفاصيل الجلسة..." -ForegroundColor Cyan
        
        try {
            $detailsResponse = Invoke-RestMethod -Uri "$apiUrl/recitation/sessions/$sessionId" -Method GET -Headers @{'Accept' = 'application/json'}
            
            Write-Host "`n📋 تفاصيل الجلسة:" -ForegroundColor Green
            $detailsResponse | ConvertTo-Json -Depth 5 | Write-Host
            
        } catch {
            Write-Host "`n❌ فشل في عرض تفاصيل الجلسة" -ForegroundColor Red
            Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # اختبار عرض جميع الجلسات
        Write-Host "`n4️⃣ اختبار عرض جميع جلسات التسميع..." -ForegroundColor Cyan
        
        try {
            $allSessionsResponse = Invoke-RestMethod -Uri "$apiUrl/recitation/sessions/" -Method GET -Headers @{'Accept' = 'application/json'}
            
            Write-Host "`n📋 جميع الجلسات:" -ForegroundColor Green
            $allSessionsResponse | ConvertTo-Json -Depth 3 | Write-Host
            
        } catch {
            Write-Host "`n❌ فشل في عرض جميع الجلسات" -ForegroundColor Red
            Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n🎉 تم اختبار API بنجاح!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ خطأ في الاتصال بـ API" -ForegroundColor Red
    Write-Host "خطأ: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host "`n💡 اقتراحات لحل المشكلة:" -ForegroundColor Yellow
    Write-Host "1. تأكد من تشغيل خادم Laravel: php artisan serve" -ForegroundColor White
    Write-Host "2. تحقق من إعدادات قاعدة البيانات" -ForegroundColor White
    Write-Host "3. تأكد من وجود البيانات الأساسية (طلاب، معلمين، حلقات)" -ForegroundColor White
    Write-Host "4. تحقق من routes/api.php" -ForegroundColor White
    Write-Host "5. تحقق من CORS settings" -ForegroundColor White
}
