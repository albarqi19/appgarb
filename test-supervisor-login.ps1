# اختبار تسجيل دخول المشرف والحصول على Token
# Test Supervisor Login and Get Token

$API_BASE_URL = "http://localhost:8000/api"
$Headers = @{
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
    'User-Agent' = 'PowerShell-Test'
}

Write-Host "🔐 اختبار تسجيل دخول المشرف" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

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
    # 1. فحص وجود الخادم
    Write-Host "`n🔍 فحص الخادم..." -ForegroundColor Blue
    try {
        $baseCheck = Invoke-WebRequest -Uri "http://localhost:8000" -Method GET -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ الخادم يعمل - Status: $($baseCheck.StatusCode)" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ الخادم لا يعمل أو غير متاح" -ForegroundColor Red
        Write-Host "تأكد من تشغيل الخادم: php artisan serve" -ForegroundColor Yellow
        exit 1
    }

    # 2. اختبار تسجيل دخول المشرف
    Write-Host "`n🔐 محاولة تسجيل دخول المشرف..." -ForegroundColor Blue
    
    # بيانات تسجيل دخول تجريبية للمشرف
    $supervisorCredentials = @(
        @{ identity_number = "1234567890"; password = "password123" },
        @{ identity_number = "1234567890"; password = "123456" },
        @{ identity_number = "1234567890"; password = "admin123" },
        @{ identity_number = "1074554779"; password = "123456" },
        @{ identity_number = "1111111111"; password = "supervisor123" },
        @{ identity_number = "2222222222"; password = "admin123" }
    )
    
    $token = $null
    $loginSuccess = $false
    
    foreach ($credential in $supervisorCredentials) {
        Write-Host "`n🔄 محاولة تسجيل دخول برقم هوية: $($credential.identity_number)" -ForegroundColor Yellow
        
        $url = "$API_BASE_URL/auth/supervisor/login"
        $loginData = $credential | ConvertTo-Json -Compress
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method POST -Headers $Headers -Body $loginData -UseBasicParsing
            $loginResult = Print-Response -Title "تسجيل دخول المشرف" -Response $response -Method "POST" -Url $url
            
            if ($loginResult -and $loginResult.success -and $loginResult.data.token) {
                $token = $loginResult.data.token
                $loginSuccess = $true
                Write-Host "✅ نجح تسجيل الدخول! Token: $($token.Substring(0, 20))..." -ForegroundColor Green
                break
            }
        }
        catch {
            Print-Error -Title "تسجيل دخول المشرف" -Error $_ -Method "POST" -Url $url
        }
    }
    
    if (-not $loginSuccess) {
        Write-Host "`n❌ فشل في تسجيل دخول المشرف بجميع البيانات المجربة" -ForegroundColor Red
        Write-Host "📝 سنجرب الآن الوصول إلى APIs بدون Token (متوقع 401)" -ForegroundColor Yellow
    }

    # 3. اختبار APIs بالـ Token (إن وجد)
    if ($token) {
        Write-Host "`n🎯 اختبار APIs المشرف بالـ Token" -ForegroundColor Green
        $AuthHeaders = $Headers.Clone()
        $AuthHeaders['Authorization'] = "Bearer $token"
        
        # اختبار الحصول على الحلقات
        Write-Host "`n📚 اختبار: الحصول على الحلقات المشرف عليها" -ForegroundColor Blue
        $url = "$API_BASE_URL/supervisors/circles"
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
            Print-Response -Title "الحلقات المشرف عليها" -Response $response -Method "GET" -Url $url
        }
        catch {
            Print-Error -Title "الحلقات المشرف عليها" -Error $_ -Method "GET" -Url $url
        }
        
        # اختبار إحصائيات لوحة المعلومات
        Write-Host "`n📊 اختبار: إحصائيات لوحة المعلومات" -ForegroundColor Blue
        $url = "$API_BASE_URL/supervisors/dashboard-stats"
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
            Print-Response -Title "إحصائيات لوحة المعلومات" -Response $response -Method "GET" -Url $url
        }
        catch {
            Print-Error -Title "إحصائيات لوحة المعلومات" -Error $_ -Method "GET" -Url $url
        }
        
        # اختبار طلبات النقل
        Write-Host "`n🔄 اختبار: طلبات النقل" -ForegroundColor Blue
        $url = "$API_BASE_URL/supervisors/transfer-requests"
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
            Print-Response -Title "طلبات النقل" -Response $response -Method "GET" -Url $url
        }
        catch {
            Print-Error -Title "طلبات النقل" -Error $_ -Method "GET" -Url $url
        }
        
        # اختبار API تتبع نشاط المعلمين اليومي
        Write-Host "`n🎯 اختبار: تتبع نشاط المعلمين اليومي" -ForegroundColor Blue
        $supervisorId = 1 # معرف المشرف
        $date = Get-Date -Format "yyyy-MM-dd"
        $url = "$API_BASE_URL/supervisors/teachers-daily-activity?supervisor_id=$supervisorId&date=$date"
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
            $activityResult = Print-Response -Title "تتبع نشاط المعلمين اليومي" -Response $response -Method "GET" -Url $url
            
            # عرض ملخص النتائج بشكل مفصل
            if ($activityResult -and $activityResult.success -and $activityResult.data) {
                $summary = $activityResult.data.summary
                Write-Host "`n📊 ملخص نشاط المعلمين:" -ForegroundColor Cyan
                Write-Host "   إجمالي المعلمين: $($summary.total_teachers)" -ForegroundColor White
                Write-Host "   المعلمين النشطين: $($summary.active_teachers)" -ForegroundColor Green
                Write-Host "   سجلوا الحضور: $($summary.attendance_recorded)" -ForegroundColor Yellow
                Write-Host "   سجلوا التسميع: $($summary.recitation_recorded)" -ForegroundColor Blue
                Write-Host "   معدل الإنجاز: $($summary.completion_rate)%" -ForegroundColor Magenta
                Write-Host "   معدل التحضير: $($summary.attendance_percentage)%" -ForegroundColor Green
                Write-Host "   معدل التسميع: $($summary.recitation_percentage)%" -ForegroundColor Blue
                
                if ($activityResult.data.teachers_activity -and $activityResult.data.teachers_activity.Count -gt 0) {
                    Write-Host "`n👥 تفاصيل المعلمين (أول 5 معلمين):" -ForegroundColor Cyan
                    $teachers = $activityResult.data.teachers_activity | Select-Object -First 5
                    foreach ($teacher in $teachers) {
                        $activity = $teacher.daily_activity
                        Write-Host "   📚 $($teacher.teacher_name)" -ForegroundColor White
                        Write-Host "      الحلقة: $($teacher.circle.name)" -ForegroundColor Gray
                        Write-Host "      الحالة: $($activity.activity_status)" -ForegroundColor $(
                            if ($activity.status_color -eq "green") { "Green" }
                            elseif ($activity.status_color -eq "orange") { "Yellow" }
                            else { "Red" }
                        )
                        Write-Host "      الطلاب: $($activity.students_count) | الحضور: $($activity.attendance_percentage)% | التسميع: $($activity.recitation_percentage)%" -ForegroundColor Gray
                        Write-Host "      ملخص: $($activity.details.completion_summary)" -ForegroundColor DarkGray
                        Write-Host ""
                    }
                }
            }
        }
        catch {
            Print-Error -Title "تتبع نشاط المعلمين اليومي" -Error $_ -Method "GET" -Url $url
        }
        
        # اختبار API إحصائيات المعلمين حسب الفترة
        Write-Host "`n📈 اختبار: إحصائيات المعلمين (آخر 7 أيام)" -ForegroundColor Blue
        $startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
        $endDate = Get-Date -Format "yyyy-MM-dd"
        $url = "$API_BASE_URL/supervisors/teachers-activity-statistics?supervisor_id=$supervisorId&start_date=$startDate&end_date=$endDate"
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -Headers $AuthHeaders -UseBasicParsing
            $statsResult = Print-Response -Title "إحصائيات المعلمين" -Response $response -Method "GET" -Url $url
            
            # عرض ملخص الإحصائيات
            if ($statsResult -and $statsResult.success -and $statsResult.data) {
                Write-Host "`n📊 إحصائيات الفترة ($startDate إلى $endDate):" -ForegroundColor Cyan
                Write-Host "   الفترة: $($statsResult.data.period_summary.days_count) أيام" -ForegroundColor White
                Write-Host "   متوسط المعلمين النشطين يومياً: $($statsResult.data.period_summary.average_active_teachers)" -ForegroundColor Green
                Write-Host "   متوسط معدل الإنجاز: $($statsResult.data.period_summary.average_completion_rate)%" -ForegroundColor Magenta
            }
        }
        catch {
            Print-Error -Title "إحصائيات المعلمين" -Error $_ -Method "GET" -Url $url
        }
    } else {
        Write-Host "`n🔍 اختبار APIs بدون Token (متوقع 401 Unauthorized)" -ForegroundColor Yellow
        
        # اختبار بدون Token
        $testUrls = @(
            "$API_BASE_URL/supervisors/circles",
            "$API_BASE_URL/supervisors/dashboard-stats",
            "$API_BASE_URL/supervisors/transfer-requests"
        )
        
        foreach ($url in $testUrls) {
            $endpoint = $url.Replace("$API_BASE_URL/supervisors/", "")
            Write-Host "`n🔍 اختبار: $endpoint" -ForegroundColor Blue
            try {
                $response = Invoke-WebRequest -Uri $url -Method GET -Headers $Headers -UseBasicParsing
                Print-Response -Title $endpoint -Response $response -Method "GET" -Url $url
            }
            catch {
                Print-Error -Title $endpoint -Error $_ -Method "GET" -Url $url
            }
        }
    }

    Write-Host "`n🎉 انتهاء الاختبار!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green

} catch {
    Write-Host "`n❌ خطأ عام في الاختبار:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📝 ملاحظات:" -ForegroundColor Yellow
Write-Host "1. إذا فشل تسجيل الدخول، تحقق من وجود بيانات مشرف في قاعدة البيانات" -ForegroundColor White
Write-Host "2. APIs المشرف تتطلب دور 'supervisor' في قاعدة البيانات" -ForegroundColor White
Write-Host "3. التحقق من جدول users وجدول model_has_roles" -ForegroundColor White
Write-Host "4. قد تحتاج لإنشاء مشرف جديد في قاعدة البيانات أولاً" -ForegroundColor White
