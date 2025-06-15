# اختبار سريع لـ duration_minutes باستخدام curl
# Quick test for duration_minutes using curl

Write-Host "🧪 اختبار سريع لـ duration_minutes" -ForegroundColor Green

# إنشاء جلسة جديدة أولاً
Write-Host "📝 إنشاء جلسة..." -ForegroundColor Yellow

$createCommand = @"
curl -X POST "http://localhost:8000/api/recitation/sessions" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
  "student_id": 1,
  "teacher_id": 1,
  "quran_circle_id": 1,
  "start_surah_number": 1,
  "start_verse": 1,
  "end_surah_number": 1,
  "end_verse": 5,
  "recitation_type": "حفظ",
  "grade": 8.5,
  "evaluation": "جيد جداً",
  "teacher_notes": "اختبار duration_minutes"
}'
"@

Write-Host $createCommand -ForegroundColor Cyan

# تنفيذ الأمر
$result = Invoke-Expression $createCommand
Write-Host "النتيجة:" -ForegroundColor Green
$result

# استخراج session_id (يجب تعديله حسب الاستجابة)
Write-Host "`n📝 للمتابعة، استخدم session_id من النتيجة أعلاه واستبدله في الأمر التالي:" -ForegroundColor Yellow

$updateCommand = @"
curl -X PUT "http://localhost:8000/api/recitation/sessions/SESSION_ID_HERE" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
  "grade": 9.0,
  "evaluation": "ممتاز",
  "teacher_notes": "تم التحديث مع مدة 30 دقيقة",
  "duration_minutes": 30
}'
"@

Write-Host $updateCommand -ForegroundColor Cyan
