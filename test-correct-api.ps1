# اختبار إنشاء جلسة تسميع مع القيم الصحيحة
Write-Host "=== اختبار API جلسات التسميع مع القيم الصحيحة ===" -ForegroundColor Blue

$baseUrl = "http://127.0.0.1:8000/api"

$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# البيانات الصحيحة بناءً على الدليل
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
    teacher_notes = "اختبار API - أداء جيد"
}

try {
    $jsonData = $sessionData | ConvertTo-Json -Depth 2
    Write-Host "`nالبيانات المرسلة:" -ForegroundColor Cyan
    Write-Host $jsonData
    
    Write-Host "`nإرسال الطلب..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$baseUrl/recitation/sessions" -Method POST -Body $jsonData -Headers $headers
    
    Write-Host "`n✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
    Write-Host "معرف الجلسة: $($response.session_id)" -ForegroundColor Yellow
    Write-Host "الطالب: $($response.data.student_id)" -ForegroundColor White
    Write-Host "الدرجة: $($response.data.grade)" -ForegroundColor White
    Write-Host "التقدير: $($response.data.evaluation)" -ForegroundColor White
    
    # حفظ معرف الجلسة للاختبارات اللاحقة
    $global:CreatedSessionId = $response.session_id
    
} catch {
    Write-Host "`n❌ فشل في إنشاء الجلسة:" -ForegroundColor Red
    Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = [System.IO.StreamReader]::new($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "`nتفاصيل الخطأ من الخادم:" -ForegroundColor Yellow
            Write-Host $responseBody
            
            # محاولة تحليل JSON إذا كان ممكناً
            try {
                $errorData = $responseBody | ConvertFrom-Json
                if ($errorData.errors) {
                    Write-Host "`nأخطاء التحقق:" -ForegroundColor Red
                    $errorData.errors | Get-Member -MemberType NoteProperty | ForEach-Object {
                        $field = $_.Name
                        $errors = $errorData.errors.$field
                        Write-Host "- $field : $($errors -join ', ')" -ForegroundColor Yellow
                    }
                }
            } catch {
                Write-Host "لا يمكن تحليل تفاصيل الخطأ كـ JSON" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "لا يمكن قراءة تفاصيل الخطأ" -ForegroundColor Yellow
        }
    }
}

# 2. اختبار إضافة أخطاء إذا تم إنشاء الجلسة بنجاح
if ($global:CreatedSessionId) {
    Write-Host "`n2. اختبار إضافة أخطاء للجلسة..." -ForegroundColor Yellow
    
    $errorsData = @{
        session_id = $global:CreatedSessionId
        errors = @(
            @{
                surah_number = 1
                verse_number = 1
                error_type = "نطق"
                severity_level = "خفيف"
                word_text = "بسم"
                correction_note = "تحسين النطق"
            }
        )
    }
    
    try {
        $errorsJson = $errorsData | ConvertTo-Json -Depth 3
        Write-Host "`nبيانات الأخطاء:" -ForegroundColor Cyan
        Write-Host $errorsJson
        
        $errorsResponse = Invoke-RestMethod -Uri "$baseUrl/recitation/errors" -Method POST -Body $errorsJson -Headers $headers
        
        Write-Host "`n✅ تم إضافة الأخطاء بنجاح!" -ForegroundColor Green
        Write-Host "عدد الأخطاء: $($errorsResponse.total_errors)" -ForegroundColor Yellow
        
    } catch {
        Write-Host "`n❌ فشل في إضافة الأخطاء:" -ForegroundColor Red
        Write-Host "الخطأ: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = [System.IO.StreamReader]::new($stream)
                $responseBody = $reader.ReadToEnd()
                Write-Host "`nتفاصيل خطأ الأخطاء:" -ForegroundColor Yellow
                Write-Host $responseBody
            } catch {
                Write-Host "لا يمكن قراءة تفاصيل خطأ الأخطاء" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "`n=== انتهى الاختبار ===" -ForegroundColor Blue
