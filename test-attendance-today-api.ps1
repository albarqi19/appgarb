# اختبار API الحضور الجديد لليوم الحالي
Write-Host "🧪 اختبار API الحضور الجديد..." -ForegroundColor Green

$API_BASE_URL = "http://localhost:8000/api"
$today = Get-Date -Format "yyyy-MM-dd"

Write-Host "📅 تاريخ اليوم: $today" -ForegroundColor Blue

# بيانات الاختبار
$testCases = @(
    @{ mosqueId = 1; teacherId = 1; description = "مسجد 1 - معلم 1" },
    @{ mosqueId = 2; teacherId = 1; description = "مسجد 2 - معلم 1" }
)

foreach ($testCase in $testCases) {
    Write-Host "`n🔍 $($testCase.description)" -ForegroundColor Cyan
    
    # الـ API الجديد
    $newApiUrl = "$API_BASE_URL/mosques/$($testCase.mosqueId)/attendance-today?teacher_id=$($testCase.teacherId)"
    Write-Host "📡 الرابط الجديد: $newApiUrl" -ForegroundColor Yellow
    
    try {
        # إرسال الطلب
        $headers = @{
            'Accept' = 'application/json'
            'Content-Type' = 'application/json'
            'ngrok-skip-browser-warning' = 'true'
        }
        
        $response = Invoke-RestMethod -Uri $newApiUrl -Method Get -Headers $headers -ErrorAction Stop
        
        Write-Host "✅ استجابة ناجحة!" -ForegroundColor Green
        Write-Host "📊 البيانات المستلمة:" -ForegroundColor White
        $response | ConvertTo-Json -Depth 3 | Write-Host
        
        # تحليل البيانات
        if ($response.success) {
            $attendanceData = $response.data
            if ($attendanceData) {
                $studentsCount = ($attendanceData | Get-Member -MemberType NoteProperty).Count
                Write-Host "👥 عدد الطلاب: $studentsCount" -ForegroundColor Magenta
                
                if ($studentsCount -gt 0) {
                    Write-Host "📝 بيانات الحضور:" -ForegroundColor White
                    $attendanceData.PSObject.Properties | ForEach-Object {
                        Write-Host "  - $($_.Name): $($_.Value)" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "⚠️ لا توجد بيانات حضور لهذا المعلم/المسجد" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "❌ فشل العملية: $($response.message)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "💥 خطأ في الاتصال: $($_.Exception.Message)" -ForegroundColor Red
        
        # محاولة الحصول على تفاصيل أكثر
        if ($_.Exception.Response) {
            Write-Host "📊 رمز الحالة: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n" + ("=" * 50) -ForegroundColor DarkGray
}

Write-Host "`n✅ انتهى الاختبار!" -ForegroundColor Green
