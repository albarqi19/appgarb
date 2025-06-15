# اختبار API جلسات التسميع وأخطاء التسميع
# تعيين التشفير للنصوص العربية
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$baseUrl = "http://127.0.0.1:8000/api"

$headers = @{
    "Content-Type" = "application/json; charset=utf-8"
    "Accept" = "application/json"
}

Write-Host "=== اختبار API جلسات التسميع ===" -ForegroundColor Blue

# 1. اختبار إنشاء جلسة تسميع
Write-Host "`n1. اختبار إنشاء جلسة تسميع..." -ForegroundColor Yellow

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
    grade = 8.5
    evaluation = "جيد جداً"
    teacher_notes = "اختبار API"
}

try {
    $jsonData = $sessionData | ConvertTo-Json -Depth 2
    Write-Host "البيانات المرسلة:" -ForegroundColor Cyan
    Write-Host $jsonData
    
    $sessionResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions" -Method POST -Body $jsonData -Headers $headers
    
    if ($sessionResponse.success) {
        Write-Host "`n✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
        Write-Host "معرف الجلسة: $($sessionResponse.session_id)" -ForegroundColor Yellow
        $createdSessionId = $sessionResponse.session_id
        
        # عرض البيانات المرجعة
        Write-Host "`nالبيانات المرجعة:" -ForegroundColor Cyan
        $sessionResponse | ConvertTo-Json -Depth 3
    } else {
        Write-Host "`n❌ فشل إنشاء الجلسة: $($sessionResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ خطأ في إنشاء الجلسة:" -ForegroundColor Red
    Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "تفاصيل الخطأ: $responseBody" -ForegroundColor Yellow
        } catch {
            Write-Host "لا يمكن قراءة تفاصيل الخطأ" -ForegroundColor Yellow
        }
    }
}

# 2. اختبار إضافة أخطاء للجلسة (إذا تم إنشاؤها بنجاح)
if ($createdSessionId) {
    Write-Host "`n2. اختبار إضافة أخطاء للجلسة..." -ForegroundColor Yellow
    
    $errorsData = @{
        session_id = $createdSessionId
        errors = @(
            @{
                surah_number = 1
                verse_number = 1
                error_type = "نطق"
                severity_level = "خفيف"
                word_text = "بِسْمِ"
                correction_note = "تحسين النطق"
            },
            @{
                surah_number = 1
                verse_number = 2
                error_type = "تجويد"
                severity_level = "متوسط"
                teacher_note = "مراجعة أحكام التجويد"
            }
        )
    }
    
    try {
        $errorsJson = $errorsData | ConvertTo-Json -Depth 3
        Write-Host "بيانات الأخطاء المرسلة:" -ForegroundColor Cyan
        Write-Host $errorsJson
        
        $errorsResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/errors" -Method POST -Body $errorsJson -Headers $headers
        
        if ($errorsResponse.success) {
            Write-Host "`n✅ تم إضافة الأخطاء بنجاح!" -ForegroundColor Green
            Write-Host "عدد الأخطاء المضافة: $($errorsResponse.total_errors)" -ForegroundColor Yellow
            
            # عرض الأخطاء المضافة
            Write-Host "`nالأخطاء المضافة:" -ForegroundColor Cyan
            $errorsResponse.data | ForEach-Object {
                Write-Host "- خطأ رقم $($_.id): $($_.error_type) في السورة $($_.surah_number) الآية $($_.verse_number)" -ForegroundColor White
            }
        } else {
            Write-Host "`n❌ فشل إضافة الأخطاء: $($errorsResponse.message)" -ForegroundColor Red
        }
    } catch {
        Write-Host "`n❌ خطأ في إضافة الأخطاء:" -ForegroundColor Red
        Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "تفاصيل الخطأ: $responseBody" -ForegroundColor Yellow
            } catch {
                Write-Host "لا يمكن قراءة تفاصيل الخطأ" -ForegroundColor Yellow
            }
        }
    }
}

# 3. اختبار جلب الجلسات
Write-Host "`n3. اختبار جلب الجلسات..." -ForegroundColor Yellow

try {
    $sessionsResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions" -Method GET -Headers $headers
    
    if ($sessionsResponse.success) {
        Write-Host "`n✅ تم جلب الجلسات بنجاح!" -ForegroundColor Green
        Write-Host "إجمالي الجلسات: $($sessionsResponse.data.total)" -ForegroundColor Yellow
        
        if ($sessionsResponse.data.data.Count -gt 0) {
            Write-Host "`nآخر 3 جلسات:" -ForegroundColor Cyan
            $sessionsResponse.data.data | Select-Object -First 3 | ForEach-Object {
                Write-Host "- الجلسة: $($_.session_id) - الطالب: $($_.student_id) - الدرجة: $($_.grade)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "`n❌ فشل جلب الجلسات: $($sessionsResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ خطأ في جلب الجلسات:" -ForegroundColor Red
    Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. اختبار الإحصائيات العامة
Write-Host "`n4. اختبار الإحصائيات العامة..." -ForegroundColor Yellow

try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions/stats/summary" -Method GET -Headers $headers
    
    if ($statsResponse.success) {
        Write-Host "`n✅ تم جلب الإحصائيات بنجاح!" -ForegroundColor Green
        $stats = $statsResponse.data
        
        Write-Host "`nالإحصائيات العامة:" -ForegroundColor Cyan
        Write-Host "إجمالي الجلسات: $($stats.total_sessions)" -ForegroundColor White
        Write-Host "جلسات بها أخطاء: $($stats.sessions_with_errors)" -ForegroundColor Red
        Write-Host "جلسات بدون أخطاء: $($stats.sessions_without_errors)" -ForegroundColor Green
        Write-Host "معدل الأخطاء: $($stats.error_rate_percentage)%" -ForegroundColor Yellow
        Write-Host "متوسط الدرجات: $($stats.average_grade)/10" -ForegroundColor Magenta
    } else {
        Write-Host "`n❌ فشل جلب الإحصائيات: $($statsResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ خطأ في جلب الإحصائيات:" -ForegroundColor Red
    Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== انتهى الاختبار ===" -ForegroundColor Blue
