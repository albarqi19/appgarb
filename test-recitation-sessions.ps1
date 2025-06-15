# Script to test Recitation Sessions API
# تجربة API جلسات التسميع

Write-Host "🕌 اختبار API جلسات التسميع" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Base URL
$baseUrl = "http://localhost/api"

Write-Host "`n1️⃣ اختبار إنشاء جلسة تسميع جديدة..." -ForegroundColor Yellow

# Test data for creating a recitation session
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
} | ConvertTo-Json -Depth 5

Write-Host "البيانات المرسلة:" -ForegroundColor Cyan
Write-Host $sessionData -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/" -Method POST -Body $sessionData -ContentType "application/json"
    Write-Host "`n✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    # Extract session_id for future use
    $sessionId = $response.data.session_id
    Write-Host "`n📝 معرف الجلسة: $sessionId" -ForegroundColor Yellow
    
    # Wait a moment
    Start-Sleep -Seconds 2
    
    Write-Host "`n2️⃣ اختبار إضافة أخطاء للجلسة..." -ForegroundColor Yellow
    
    # Test adding errors to the session
    $errorData = @{
        session_id = $sessionId
        error_type = "نسيان"
        surah_number = 2
        verse_number = 5
        error_description = "نسيان كلمة في الآية الخامسة"
        correction = "الكلمة الصحيحة هي: الله"
    } | ConvertTo-Json -Depth 5
    
    Write-Host "بيانات الخطأ المرسلة:" -ForegroundColor Cyan
    Write-Host $errorData -ForegroundColor White
    
    $errorResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/errors/" -Method POST -Body $errorData -ContentType "application/json"
    Write-Host "`n✅ تم إضافة الخطأ بنجاح!" -ForegroundColor Green
    Write-Host ($errorResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    Write-Host "`n3️⃣ اختبار عرض الجلسة مع الأخطاء..." -ForegroundColor Yellow
    
    # Get the session with errors
    $sessionDetails = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/$sessionId" -Method GET
    Write-Host "`n📋 تفاصيل الجلسة مع الأخطاء:" -ForegroundColor Green
    Write-Host ($sessionDetails | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    Write-Host "`n4️⃣ اختبار عرض جلسات المعلم..." -ForegroundColor Yellow
    
    # Get teacher's sessions
    $teacherSessions = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/?teacher_id=2" -Method GET
    Write-Host "`n📚 جلسات المعلم:" -ForegroundColor Green
    Write-Host ($teacherSessions | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    Write-Host "`n5️⃣ اختبار تحديث الجلسة..." -ForegroundColor Yellow
    
    # Update session
    $updateData = @{
        grade = 9.0
        notes = "تحسن ملحوظ بعد التصحيح"
        has_errors = $true
        correction_notes = "تم تصحيح خطأ النسيان"
    } | ConvertTo-Json -Depth 5
    
    Write-Host "بيانات التحديث:" -ForegroundColor Cyan
    Write-Host $updateData -ForegroundColor White
    
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/$sessionId" -Method PUT -Body $updateData -ContentType "application/json"
    Write-Host "`n✅ تم تحديث الجلسة بنجاح!" -ForegroundColor Green
    Write-Host ($updateResponse | ConvertTo-Json -Depth 5) -ForegroundColor White
    
    Write-Host "`n🎉 تم اختبار جميع عمليات API بنجاح!" -ForegroundColor Green
    Write-Host "معرف الجلسة النهائي: $sessionId" -ForegroundColor Yellow

} catch {
    Write-Host "`n❌ خطأ في الاتصال:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    # Check if server is running
    Write-Host "`n🔍 فحص حالة الخادم..." -ForegroundColor Yellow
    try {
        $healthCheck = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 5
        Write-Host "✅ الخادم يعمل - كود الاستجابة: $($healthCheck.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ الخادم لا يعمل أو غير متاح" -ForegroundColor Red
        Write-Host "تأكد من تشغيل خادم Laravel على http://localhost" -ForegroundColor Yellow
    }
}

Write-Host "`n📝 ملاحظات:" -ForegroundColor Cyan
Write-Host "- تأكد من تشغيل خادم Laravel" -ForegroundColor White
Write-Host "- تحقق من وجود البيانات الأساسية (طلاب، معلمين، حلقات)" -ForegroundColor White
Write-Host "- API التسميع يتطلب معرف جلسة صحيح للأخطاء" -ForegroundColor White
