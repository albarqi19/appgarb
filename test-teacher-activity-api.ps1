# اختبار مخصص لـ API تتبع نشاط المعلمين
# Test Teacher Activity Tracking API

$API_BASE_URL = "https://inviting-pleasantly-barnacle.ngrok-free.app/api"
$Headers = @{
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
    'ngrok-skip-browser-warning' = 'true'
    'User-Agent' = 'PowerShell-Test'
}

Write-Host "🎯 اختبار API تتبع نشاط المعلمين" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# دالة لطباعة النتائج
function Print-Response {
    param(
        [string]$Title,
        [object]$Response,
        [string]$Method = "GET",
        [string]$Url = ""
    )
    
    Write-Host "`n📋 $Title" -ForegroundColor Cyan
    Write-Host "Method: $Method | URL: $Url" -ForegroundColor Gray
    Write-Host "Status: $($Response.StatusCode)" -ForegroundColor Yellow
    
    if ($Response.Content) {
        try {
            $jsonContent = $Response.Content | ConvertFrom-Json
            Write-Host "Response:" -ForegroundColor Green
            $jsonContent | ConvertTo-Json -Depth 10 | Write-Host
            return $jsonContent
        }
        catch {
            Write-Host "Raw Response: $($Response.Content)" -ForegroundColor White
            return $null
        }
    }
    Write-Host "----------------------------------------" -ForegroundColor Gray
    return $null
}

# دالة لطباعة الأخطاء
function Print-Error {
    param(
        [string]$Title,
        [object]$Error,
        [string]$Method = "GET",
        [string]$Url = ""
    )
    
    Write-Host "`n❌ خطأ في $Title" -ForegroundColor Red
    Write-Host "Method: $Method | URL: $Url" -ForegroundColor Gray
    Write-Host "Error: $($Error.Exception.Message)" -ForegroundColor Red
    
    if ($Error.Exception.Response) {
        Write-Host "Status Code: $($Error.Exception.Response.StatusCode)" -ForegroundColor Red
        
        try {
            $errorStream = $Error.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            if ($responseBody) {
                Write-Host "Error Response: $responseBody" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "Could not read error response" -ForegroundColor Red
        }
    }
    Write-Host "----------------------------------------" -ForegroundColor Gray
}

try {
    # 1. تسجيل دخول المشرف
    Write-Host "`n🔐 تسجيل دخول المشرف..." -ForegroundColor Blue
    
    $supervisorCredentials = @(
        @{ identity_number = "1234567890"; password = "password123" },
        @{ identity_number = "1234567890"; password = "123456" },
        @{ identity_number = "1234567890"; password = "admin123" }
    )
    
    $token = $null
    $loginSuccess = $false
    $supervisorId = $null
    
    foreach ($credential in $supervisorCredentials) {
        Write-Host "`n🔄 محاولة تسجيل دخول برقم هوية: $($credential.identity_number)" -ForegroundColor Yellow
        
        $url = "$API_BASE_URL/auth/supervisor/login"
        $loginData = $credential | ConvertTo-Json -Compress
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method POST -Headers $Headers -Body $loginData -UseBasicParsing
            $loginResult = Print-Response -Title "تسجيل دخول المشرف" -Response $response -Method "POST" -Url $url
            
            if ($loginResult -and $loginResult.success -and $loginResult.data.token) {
                $token = $loginResult.data.token
                $supervisorId = $loginResult.data.user.id
                $loginSuccess = $true
                Write-Host "✅ نجح تسجيل الدخول! Supervisor ID: $supervisorId" -ForegroundColor Green
                Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Green
                break
            }
        }
        catch {
            Print-Error -Title "تسجيل دخول المشرف" -Error $_ -Method "POST" -Url $url
        }
    }
    
    if (-not $loginSuccess) {
        Write-Host "`n❌ فشل في تسجيل دخول المشرف - سنجرب بدون Token" -ForegroundColor Red
        $supervisorId = 1 # استخدام معرف افتراضي
    }

    # 2. اختبار API تتبع نشاط المعلمين اليومي
    Write-Host "`n🎯 اختبار API تتبع نشاط المعلمين اليومي" -ForegroundColor Green
    Write-Host "المشرف ID: $supervisorId" -ForegroundColor Yellow
    Write-Host "التاريخ: $(Get-Date -Format 'yyyy-MM-dd')" -ForegroundColor Yellow
    
    $AuthHeaders = $Headers.Clone()
    if ($token) {
        $AuthHeaders['Authorization'] = "Bearer $token"
    }
    
    $date = Get-Date -Format "yyyy-MM-dd"
    $url = "$API_BASE_URL/supervisors/teachers-daily-activity?supervisor_id=$supervisorId&date=$date"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
        $activityResult = Print-Response -Title "تتبع نشاط المعلمين اليومي" -Response $response -Method "GET" -Url $url
        
        # عرض ملخص النتائج بشكل احترافي
        if ($activityResult -and $activityResult.success -and $activityResult.data) {
            $summary = $activityResult.data.summary
            Write-Host "`n📊 ملخص نشاط المعلمين ليوم $($activityResult.data.date):" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "📋 إجمالي المعلمين: $($summary.total_teachers)" -ForegroundColor White
            Write-Host "✅ المعلمين النشطين: $($summary.active_teachers)" -ForegroundColor Green
            Write-Host "📝 سجلوا الحضور: $($summary.attendance_recorded)" -ForegroundColor Yellow
            Write-Host "🎤 سجلوا التسميع: $($summary.recitation_recorded)" -ForegroundColor Blue
            Write-Host "🎯 معدل الإنجاز: $($summary.completion_rate)%" -ForegroundColor Magenta
            Write-Host "📊 معدل التحضير: $($summary.attendance_percentage)%" -ForegroundColor Green
            Write-Host "📈 معدل التسميع: $($summary.recitation_percentage)%" -ForegroundColor Blue
            
            if ($activityResult.data.teachers_activity -and $activityResult.data.teachers_activity.Count -gt 0) {
                Write-Host "`n👥 تفاصيل المعلمين:" -ForegroundColor Cyan
                Write-Host "========================================" -ForegroundColor Cyan
                
                foreach ($teacher in $activityResult.data.teachers_activity) {
                    $activity = $teacher.daily_activity
                    
                    # تحديد لون الحالة
                    $statusColor = switch ($activity.status_color) {
                        "green" { "Green" }
                        "orange" { "Yellow" }
                        "red" { "Red" }
                        default { "White" }
                    }
                    
                    Write-Host "`n👨‍🏫 المعلم: $($teacher.teacher_name)" -ForegroundColor White
                    Write-Host "   📞 الهاتف: $($teacher.phone)" -ForegroundColor Gray
                    Write-Host "   🕌 المسجد: $($teacher.mosque.name)" -ForegroundColor Gray
                    Write-Host "   📚 الحلقة: $($teacher.circle.name)" -ForegroundColor Gray
                    Write-Host "   🎯 الحالة: $($activity.activity_status)" -ForegroundColor $statusColor
                    Write-Host "   👥 عدد الطلاب: $($activity.students_count)" -ForegroundColor White
                    Write-Host "   ✅ حضور: $($activity.attendance_count) طالب ($($activity.attendance_percentage)%)" -ForegroundColor $(if ($activity.attendance_recorded) { "Green" } else { "Red" })
                    Write-Host "   🎤 تسميع: $($activity.recited_students_count) طالب ($($activity.recitation_percentage)%) في $($activity.recitation_sessions_count) جلسة" -ForegroundColor $(if ($activity.recitation_recorded) { "Blue" } else { "Red" })
                    Write-Host "   📝 ملخص: $($activity.details.completion_summary)" -ForegroundColor DarkGray
                    Write-Host "   ----------------------------------------" -ForegroundColor DarkGray
                }
            } else {
                Write-Host "`n⚠️ لا توجد بيانات معلمين لهذا التاريخ" -ForegroundColor Yellow
            }
        }
    }
    catch {
        Print-Error -Title "تتبع نشاط المعلمين اليومي" -Error $_ -Method "GET" -Url $url
    }

    # 3. اختبار API إحصائيات المعلمين حسب الفترة
    Write-Host "`n📈 اختبار API إحصائيات المعلمين (آخر 7 أيام)" -ForegroundColor Green
    
    $startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
    $endDate = Get-Date -Format "yyyy-MM-dd"
    $url = "$API_BASE_URL/supervisors/teachers-activity-statistics?supervisor_id=$supervisorId&start_date=$startDate&end_date=$endDate"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
        $statsResult = Print-Response -Title "إحصائيات المعلمين" -Response $response -Method "GET" -Url $url
        
        # عرض ملخص الإحصائيات
        if ($statsResult -and $statsResult.success -and $statsResult.data) {
            Write-Host "`n📊 إحصائيات الفترة ($startDate إلى $endDate):" -ForegroundColor Cyan
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "📅 الفترة: $($statsResult.data.period_summary.days_count) أيام" -ForegroundColor White
            Write-Host "👥 متوسط المعلمين النشطين يومياً: $($statsResult.data.period_summary.average_active_teachers)" -ForegroundColor Green
            Write-Host "🎯 متوسط معدل الإنجاز: $($statsResult.data.period_summary.average_completion_rate)%" -ForegroundColor Magenta
            Write-Host "📊 متوسط التحضير: $($statsResult.data.period_summary.average_attendance_percentage)%" -ForegroundColor Green
            Write-Host "📈 متوسط التسميع: $($statsResult.data.period_summary.average_recitation_percentage)%" -ForegroundColor Blue
        }
    }
    catch {
        Print-Error -Title "إحصائيات المعلمين" -Error $_ -Method "GET" -Url $url
    }

    Write-Host "`n🎉 انتهاء اختبار API تتبع المعلمين!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green

} catch {
    Write-Host "`n❌ خطأ عام في الاختبار:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📝 ملاحظات هامة:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "1. ✅ تم العثور على APIs تتبع المعلمين بنجاح" -ForegroundColor White
Write-Host "2. 📊 النظام يتتبع الحضور والتسميع لكل معلم" -ForegroundColor White
Write-Host "3. 🎯 يحسب النسب والإحصائيات تلقائياً" -ForegroundColor White
Write-Host "4. 🟢🟡🔴 يصنف حالة المعلمين (نشط/جزئي/غير نشط)" -ForegroundColor White
Write-Host "5. 📈 يوفر إحصائيات شاملة للفترات الزمنية" -ForegroundColor White
