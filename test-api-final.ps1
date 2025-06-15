# اختبار API التسميع النهائي
# Final Recitation API Test

Write-Host "🕌 اختبار API جلسات التسميع" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Yellow

# بيانات اختبار للجلسة
$sessionData = @{
    student_id = 1
    teacher_id = 1
    quran_circle_id = 1
    start_surah_number = 2
    start_verse = 1
    end_surah_number = 2
    end_verse = 5
    recitation_type = "حفظ"
    duration_minutes = 20
    grade = 8.5
    evaluation = "جيد جداً"
    teacher_notes = "أداء جيد في التسميع"
}

function Test-RecitationAPI {
    param(
        [string]$BaseUrl = "http://localhost:8000"
    )
    
    try {
        Write-Host "`n1️⃣ اختبار عرض الجلسات الموجودة..." -ForegroundColor Cyan
        
        # اختبار GET أولاً
        $getResponse = Invoke-RestMethod -Uri "$BaseUrl/api/recitation/sessions" -Method GET -Headers @{"Accept" = "application/json"}
        
        if ($getResponse.success) {
            $sessionsCount = $getResponse.data.data.Count
            Write-Host "✅ تم جلب الجلسات بنجاح! العدد: $sessionsCount" -ForegroundColor Green
            
            if ($sessionsCount -gt 0) {
                $lastSession = $getResponse.data.data[0]
                Write-Host "📋 آخر جلسة: $($lastSession.session_id)" -ForegroundColor Yellow
                Write-Host "   - الطالب: $($lastSession.student.name)" -ForegroundColor Gray
                Write-Host "   - المعلم: $($lastSession.teacher.name)" -ForegroundColor Gray
                Write-Host "   - النوع: $($lastSession.recitation_type)" -ForegroundColor Gray
            }
        }
        
        Write-Host "`n2️⃣ اختبار إنشاء جلسة جديدة..." -ForegroundColor Cyan
        Write-Host "البيانات المرسلة:" -ForegroundColor Yellow
        $sessionData | Format-Table -AutoSize
        
        # تحويل البيانات إلى JSON
        $jsonData = $sessionData | ConvertTo-Json -Depth 5
        
        # إرسال طلب POST
        $headers = @{
            "Content-Type" = "application/json"
            "Accept" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/recitation/sessions/" -Method POST -Headers $headers -Body $jsonData
        
        if ($response.success) {
            Write-Host "✅ تم إنشاء الجلسة بنجاح!" -ForegroundColor Green
            Write-Host "📝 معرف الجلسة: $($response.data.session_id)" -ForegroundColor Magenta
            Write-Host "📊 الدرجة: $($response.data.grade)" -ForegroundColor Yellow
            Write-Host "📋 التقييم: $($response.data.evaluation)" -ForegroundColor Yellow
            
            # اختبار إضافة خطأ للجلسة
            Write-Host "`n3️⃣ اختبار إضافة خطأ للجلسة..." -ForegroundColor Cyan
            
            $errorData = @{
                session_id = $response.data.session_id
                error_type = "نسيان"
                surah_number = 2
                verse_number = 3
                error_description = "نسيان كلمة في الآية الثالثة"
                correction = "الكلمة الصحيحة"
            } | ConvertTo-Json
            
            $errorResponse = Invoke-RestMethod -Uri "$BaseUrl/api/recitation/errors/" -Method POST -Headers $headers -Body $errorData
            
            if ($errorResponse.success) {
                Write-Host "✅ تم إضافة الخطأ بنجاح!" -ForegroundColor Green
                Write-Host "📝 معرف الخطأ: $($errorResponse.data.id)" -ForegroundColor Magenta
            } else {
                Write-Host "❌ فشل في إضافة الخطأ" -ForegroundColor Red
            }
            
            Write-Host "`n🎉 تم اختبار API بنجاح!" -ForegroundColor Green
            return $response.data.session_id
        }
        
    } catch {
        Write-Host "`n❌ خطأ في اختبار API:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        # محاولة الحصول على تفاصيل الخطأ
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "`nتفاصيل الخطأ من الخادم:" -ForegroundColor Yellow
                Write-Host $errorBody -ForegroundColor Red
                
                # محاولة تحليل JSON للأخطاء
                try {
                    $errorJson = $errorBody | ConvertFrom-Json
                    if ($errorJson.errors) {
                        Write-Host "`n📋 أخطاء التحقق:" -ForegroundColor Yellow
                        $errorJson.errors.PSObject.Properties | ForEach-Object {
                            Write-Host "- $($_.Name): $($_.Value -join ', ')" -ForegroundColor Red
                        }
                    }
                } catch {
                    Write-Host "لا يمكن تحليل رسالة الخطأ" -ForegroundColor Gray
                }
                
            } catch {
                Write-Host "لا يمكن قراءة تفاصيل الخطأ" -ForegroundColor Gray
            }
        }
        return $null
    }
}

# تشغيل الاختبار
Write-Host "🚀 بدء اختبار API..." -ForegroundColor Green
$sessionId = Test-RecitationAPI

if ($sessionId) {
    Write-Host "`n✨ نجح الاختبار! معرف الجلسة المُنشأة: $sessionId" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ فشل الاختبار أو لم يتم إنشاء جلسة" -ForegroundColor Yellow
}

Write-Host "`n💡 للمساعدة في حل المشاكل:" -ForegroundColor Cyan
Write-Host "1. تأكد من تشغيل خادم Laravel: php artisan serve" -ForegroundColor Gray
Write-Host "2. تحقق من وجود البيانات الأساسية في قاعدة البيانات" -ForegroundColor Gray
Write-Host "3. راجع ملف routes/api.php" -ForegroundColor Gray
Write-Host "4. تحقق من Controller الخاص بالتسميع" -ForegroundColor Gray

Write-Host "`n🏁 انتهى الاختبار" -ForegroundColor Green
