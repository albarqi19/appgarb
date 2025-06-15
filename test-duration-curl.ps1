# اختبار إرسال duration_minutes مع curl
# Test duration_minutes with curl

Write-Host "🧪 اختبار إرسال duration_minutes في API التسميع" -ForegroundColor Green
Write-Host "=" * 50

$baseUrl = "http://localhost:8000/api"

# خطوة 1: إنشاء جلسة تسميع جديدة
Write-Host "📝 الخطوة 1: إنشاء جلسة تسميع جديدة..." -ForegroundColor Yellow

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
    teacher_notes = "اختبار إرسال duration_minutes"
} | ConvertTo-Json -Compress

Write-Host "البيانات المرسلة:" -ForegroundColor Cyan
Write-Host $sessionData

$createResponse = curl -X POST "$baseUrl/recitation/sessions" `
    -H "Content-Type: application/json" `
    -H "Accept: application/json" `
    -d $sessionData `
    --silent --show-error

Write-Host "استجابة إنشاء الجلسة:" -ForegroundColor Cyan
$createResponse | ConvertFrom-Json | ConvertTo-Json -Depth 3

$sessionId = ($createResponse | ConvertFrom-Json).data.session_id

if (-not $sessionId) {
    Write-Host "❌ فشل في إنشاء الجلسة!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ تم إنشاء الجلسة بنجاح. معرف الجلسة: $sessionId" -ForegroundColor Green

# خطوة 2: تحديث الجلسة مع duration_minutes
Write-Host "`n📝 الخطوة 2: تحديث الجلسة مع duration_minutes..." -ForegroundColor Yellow

$updateData = @{
    grade = 9.0
    evaluation = "ممتاز"
    teacher_notes = "تم تحديث الجلسة مع مدة 25 دقيقة"
    duration_minutes = 25
} | ConvertTo-Json -Compress

Write-Host "البيانات المرسلة للتحديث:" -ForegroundColor Cyan
Write-Host $updateData

$updateResponse = curl -X PUT "$baseUrl/recitation/sessions/$sessionId" `
    -H "Content-Type: application/json" `
    -H "Accept: application/json" `
    -d $updateData `
    --silent --show-error

Write-Host "استجابة تحديث الجلسة:" -ForegroundColor Cyan
$updateResponse | ConvertFrom-Json | ConvertTo-Json -Depth 3

# خطوة 3: جلب الجلسة للتأكد من حفظ duration_minutes
Write-Host "`n📝 الخطوة 3: جلب الجلسة للتأكد من حفظ duration_minutes..." -ForegroundColor Yellow

$getResponse = curl -X GET "$baseUrl/recitation/sessions/$sessionId" `
    -H "Accept: application/json" `
    --silent --show-error

Write-Host "تفاصيل الجلسة المحدثة:" -ForegroundColor Cyan
$sessionDetails = $getResponse | ConvertFrom-Json
$sessionDetails | ConvertTo-Json -Depth 3

# التحقق من وجود duration_minutes
if ($sessionDetails.duration_minutes) {
    Write-Host "✅ نجح الاختبار! تم حفظ duration_minutes: $($sessionDetails.duration_minutes) دقيقة" -ForegroundColor Green
} else {
    Write-Host "❌ فشل الاختبار! لم يتم حفظ duration_minutes" -ForegroundColor Red
}

Write-Host "`n🏁 انتهى الاختبار" -ForegroundColor Green
