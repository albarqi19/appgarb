# اختبار نهائي لـ API التسميع
# Final test for Recitation API

Write-Host "🕌 اختبار API جلسات التسميع" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Check if API is accessible
Write-Host "`n1️⃣ فحص إمكانية الوصول لـ API..." -ForegroundColor Yellow
try {
    $apiCheck = Invoke-RestMethod -Uri "http://localhost:8000/api/recitation/sessions" -Method GET
    Write-Host "✅ API متاح ويعمل" -ForegroundColor Green
    Write-Host "عدد الجلسات الموجودة: $($apiCheck.data.count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ فشل في الوصول لـ API" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Test 2: Simple session creation
Write-Host "`n2️⃣ اختبار إنشاء جلسة بسيطة..." -ForegroundColor Yellow

$sessionData = @{
    student_id = 1
    teacher_id = 1  
    quran_circle_id = 1
    start_surah_number = 1
    start_verse = 1
    end_surah_number = 1
    end_verse = 5
    recitation_type = "حفظ"
    grade = 8.0
    evaluation = "جيد"
} | ConvertTo-Json -Depth 10

Write-Host "البيانات المرسلة:" -ForegroundColor Cyan
Write-Host $sessionData -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/recitation/sessions/" -Method POST -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($sessionData))
    
    Write-Host "✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
    Write-Host "كود الاستجابة: $($response.StatusCode)" -ForegroundColor Cyan
    
    $result = $response.Content | ConvertFrom-Json
    Write-Host "معرف الجلسة: $($result.session_id)" -ForegroundColor Yellow
    
    # Test 3: Add error to session
    if ($result.session_id) {
        Write-Host "`n3️⃣ اختبار إضافة خطأ للجلسة..." -ForegroundColor Yellow
        
        $errorData = @{
            session_id = $result.session_id
            error_type = "نسيان"
            surah_number = 1
            verse_number = 2
            error_description = "نسيان كلمة"
            correction = "الكلمة الصحيحة"
        } | ConvertTo-Json -Depth 10
        
        try {
            $errorResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/recitation/errors/" -Method POST -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($errorData))
            Write-Host "✅ تم إضافة الخطأ بنجاح!" -ForegroundColor Green
        } catch {
            Write-Host "❌ فشل في إضافة الخطأ" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ فشل في إنشاء الجلسة" -ForegroundColor Red
    Write-Host "كود الخطأ: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorDetails = $reader.ReadToEnd()
        Write-Host "تفاصيل الخطأ:" -ForegroundColor Yellow
        Write-Host $errorDetails -ForegroundColor Red
    }
}

Write-Host "`n🎉 انتهى الاختبار" -ForegroundColor Green
