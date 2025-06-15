# اختبار APIs المشرف
# Test Supervisor APIs

$API_BASE_URL = "http://localhost:8000/api"
$Headers = @{
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
    'User-Agent' = 'PowerShell-Test'
}

Write-Host "🎯 بدء اختبار APIs المشرف" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# دالة لطباعة النتائج بشكل منسق
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
        }
        catch {
            Write-Host "Raw Response: $($Response.Content)" -ForegroundColor White
        }
    }
    Write-Host "----------------------------------------" -ForegroundColor Gray
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
    # 1. اختبار الوصول إلى API الأساسي
    Write-Host "`n🔍 اختبار 1: فحص الوصول إلى API" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/circles"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers $Headers -UseBasicParsing
        Print-Response -Title "فحص API الأساسي" -Response $response -Method "GET" -Url $url
    }
    catch {
        Print-Error -Title "فحص API الأساسي" -Error $_ -Method "GET" -Url $url
        
        # التحقق من أن الخادم يعمل
        try {
            $baseCheck = Invoke-WebRequest -Uri "http://localhost:8000" -Method GET -UseBasicParsing -TimeoutSec 5
            Write-Host "✅ الخادم يعمل - Status: $($baseCheck.StatusCode)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ الخادم لا يعمل أو غير متاح" -ForegroundColor Red
            Write-Host "تأكد من تشغيل الخادم: php artisan serve" -ForegroundColor Yellow
            exit 1
        }
    }

    # 2. اختبار الحصول على إحصائيات لوحة المعلومات
    Write-Host "`n🔍 اختبار 2: إحصائيات لوحة المعلومات" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/dashboard-stats"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers $Headers -UseBasicParsing
        Print-Response -Title "إحصائيات لوحة المعلومات" -Response $response -Method "GET" -Url $url
    }
    catch {
        Print-Error -Title "إحصائيات لوحة المعلومات" -Error $_ -Method "GET" -Url $url
    }

    # 3. اختبار طلبات النقل
    Write-Host "`n🔍 اختبار 3: طلبات النقل" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/transfer-requests"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers $Headers -UseBasicParsing
        Print-Response -Title "طلبات النقل" -Response $response -Method "GET" -Url $url
    }
    catch {
        Print-Error -Title "طلبات النقل" -Error $_ -Method "GET" -Url $url
    }

    # 4. اختبار تسجيل حضور معلم (POST)
    Write-Host "`n🔍 اختبار 4: تسجيل حضور معلم" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/teacher-attendance"
    
    $attendanceData = @{
        teacher_id = 1
        status = "حاضر"
        attendance_date = (Get-Date -Format "yyyy-MM-dd")
        notes = "حضر في الوقت المحدد - اختبار API"
    } | ConvertTo-Json -Compress

    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers $Headers -Body $attendanceData -UseBasicParsing
        Print-Response -Title "تسجيل حضور معلم" -Response $response -Method "POST" -Url $url
    }
    catch {
        Print-Error -Title "تسجيل حضور معلم" -Error $_ -Method "POST" -Url $url
    }

    # 5. اختبار إنشاء تقييم معلم (POST)
    Write-Host "`n🔍 اختبار 5: إنشاء تقييم معلم" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/teacher-evaluations"
    
    $evaluationData = @{
        teacher_id = 1
        performance_score = 18
        attendance_score = 20
        student_interaction_score = 17
        behavior_cooperation_score = 19
        memorization_recitation_score = 16
        general_evaluation_score = 18
        notes = "تقييم اختبار API - أداء ممتاز"
        evaluation_date = (Get-Date -Format "yyyy-MM-dd")
        evaluation_period = "شهري"
        evaluator_role = "مشرف"
        status = "مسودة"
    } | ConvertTo-Json -Compress

    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers $Headers -Body $evaluationData -UseBasicParsing
        Print-Response -Title "إنشاء تقييم معلم" -Response $response -Method "POST" -Url $url
    }
    catch {
        Print-Error -Title "إنشاء تقييم معلم" -Error $_ -Method "POST" -Url $url
    }

    # 6. اختبار طلب نقل طالب (POST)
    Write-Host "`n🔍 اختبار 6: طلب نقل طالب" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/student-transfer"
    
    $transferData = @{
        student_id = 1
        current_circle_id = 1
        requested_circle_id = 2
        current_circle_group_id = 1
        requested_circle_group_id = 2
        transfer_reason = "رغبة الطالب في تغيير التوقيت - اختبار API"
        notes = "طالب متميز يستحق النقل"
    } | ConvertTo-Json -Compress

    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers $Headers -Body $transferData -UseBasicParsing
        Print-Response -Title "طلب نقل طالب" -Response $response -Method "POST" -Url $url
    }
    catch {
        Print-Error -Title "طلب نقل طالب" -Error $_ -Method "POST" -Url $url
    }

    # 7. اختبار إنشاء تقرير معلم (POST)
    Write-Host "`n🔍 اختبار 7: إنشاء تقرير معلم" -ForegroundColor Blue
    $url = "$API_BASE_URL/supervisors/teacher-report"
    
    $reportData = @{
        teacher_id = 1
        evaluation_score = 8
        performance_notes = "أداء ممتاز في التدريس - اختبار API"
        attendance_notes = "منتظم في الحضور"
        recommendations = "يُنصح بإعطائه مزيد من الحلقات"
    } | ConvertTo-Json -Compress

    try {
        $response = Invoke-WebRequest -Uri $url -Method POST -Headers $Headers -Body $reportData -UseBasicParsing
        Print-Response -Title "إنشاء تقرير معلم" -Response $response -Method "POST" -Url $url
    }
    catch {
        Print-Error -Title "إنشاء تقرير معلم" -Error $_ -Method "POST" -Url $url
    }

    Write-Host "`n🎉 انتهاء الاختبارات!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green

} catch {
    Write-Host "`n❌ خطأ عام في الاختبار:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n📝 ملاحظات:" -ForegroundColor Yellow
Write-Host "1. تأكد من تشغيل الخادم: php artisan serve" -ForegroundColor White
Write-Host "2. APIs المشرف تتطلب مصادقة (Bearer Token)" -ForegroundColor White
Write-Host "3. الحصول على 401 Unauthorized هو أمر طبيعي بدون تسجيل دخول" -ForegroundColor White
Write-Host "4. للاختبار الكامل نحتاج لتسجيل دخول المشرف أولاً" -ForegroundColor White
