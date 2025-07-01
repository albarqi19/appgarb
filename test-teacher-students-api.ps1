# اختبار APIs جلب طلاب المعلم - Power Shell Script
# Test Teacher Students APIs

# إعدادات الاختبار
$API_BASE = "http://localhost:8000/api"
$TEACHER_ID = 1  # معرف المعلم للاختبار
$MOSQUE_ID = 1   # معرف المسجد للاختبار

Write-Host "🧪 اختبار APIs جلب طلاب المعلم" -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Yellow

# الدالة لاختبار API
function Test-API {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Url,
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    Write-Host "`n🔍 $Description" -ForegroundColor Cyan
    Write-Host "GET $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -Headers @{
            "Accept" = "application/json"
            "Content-Type" = "application/json"
        }
        
        Write-Host "✅ نجح الطلب: Status 200" -ForegroundColor Green
        
        # تحليل البيانات
        $students = @()
        
        # محاولة استخراج البيانات من تنسيقات مختلفة
        if ($response.البيانات) {
            $students = $response.البيانات
        } elseif ($response.data) {
            $students = $response.data
        } elseif ($response.students) {
            $students = $response.students
        } elseif ($response -is [array]) {
            $students = $response
        }
        
        # عرض النتائج
        if ($students -is [array]) {
            Write-Host "👥 عدد الطلاب: $($students.Count)" -ForegroundColor Yellow
            
            if ($students.Count -gt 0) {
                Write-Host "`n📋 أول 3 طلاب:" -ForegroundColor White
                for ($i = 0; $i -lt [Math]::Min(3, $students.Count); $i++) {
                    $student = $students[$i]
                    $name = if ($student.الاسم) { $student.الاسم } elseif ($student.name) { $student.name } else { "غير محدد" }
                    $studentId = if ($student.رقم_الطالب) { $student.رقم_الطالب } elseif ($student.student_number) { $student.student_number } else { $student.id }
                    Write-Host "   $($i+1). $name - ID: $studentId" -ForegroundColor White
                }
            }
        } else {
            Write-Host "⚠️ تنسيق البيانات غير متوقع" -ForegroundColor Yellow
        }
        
        # عرض البيانات الكاملة للتحليل
        Write-Host "`n📊 البيانات الكاملة (JSON):" -ForegroundColor Gray
        $jsonOutput = $response | ConvertTo-Json -Depth 3
        Write-Host $jsonOutput.Substring(0, [Math]::Min(500, $jsonOutput.Length)) -ForegroundColor DarkGray
        if ($jsonOutput.Length -gt 500) {
            Write-Host "... (تم اختصار البيانات)" -ForegroundColor DarkGray
        }
        
    } catch {
        Write-Host "❌ فشل الطلب: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

# اختبار APIs مختلفة
Write-Host "`n1️⃣ API المخصص لطلاب المعلم في مسجد محدد" -ForegroundColor Magenta
Test-API -Url "$API_BASE/teachers/$TEACHER_ID/mosques/$MOSQUE_ID/students" -Description "طلاب المعلم $TEACHER_ID في المسجد $MOSQUE_ID"

Write-Host "`n2️⃣ API جميع مساجد المعلم (يحتاج تصفية)" -ForegroundColor Magenta  
Test-API -Url "$API_BASE/teachers/$TEACHER_ID/mosques" -Description "جميع مساجد المعلم $TEACHER_ID"

Write-Host "`n3️⃣ API حلقات المعلم المفصلة (يحتاج تصفية)" -ForegroundColor Magenta
Test-API -Url "$API_BASE/teachers/$TEACHER_ID/circles-detailed" -Description "حلقات المعلم $TEACHER_ID المفصلة"

Write-Host "`n4️⃣ API جميع طلاب المعلم" -ForegroundColor Magenta
Test-API -Url "$API_BASE/teachers/$TEACHER_ID/students" -Description "جميع طلاب المعلم $TEACHER_ID"

Write-Host "`n" + "="*50 -ForegroundColor Yellow
Write-Host "🎯 ملخص APIs المتاحة لجلب طلاب المعلم:" -ForegroundColor Green
Write-Host ""
Write-Host "✅ API مباشر (الأفضل):" -ForegroundColor Cyan
Write-Host "   GET /api/teachers/{teacher_id}/mosques/{mosque_id}/students" -ForegroundColor White
Write-Host "   - يجلب طلاب المعلم في مسجد محدد مباشرة" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ API شامل (يحتاج تصفية):" -ForegroundColor Cyan  
Write-Host "   GET /api/teachers/{teacher_id}/mosques" -ForegroundColor White
Write-Host "   - يجلب جميع مساجد المعلم مع طلابه" -ForegroundColor Gray
Write-Host "   - تحتاج لتصفية البيانات حسب المسجد المطلوب" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ API مفصل (يحتاج تصفية):" -ForegroundColor Cyan
Write-Host "   GET /api/teachers/{teacher_id}/circles-detailed" -ForegroundColor White  
Write-Host "   - يجلب جميع حلقات المعلم مع تفاصيل الطلاب" -ForegroundColor Gray
Write-Host "   - تحتاج لتصفية البيانات حسب المسجد المطلوب" -ForegroundColor Gray

Write-Host ""
Write-Host "📝 للاختبار مع معلم مختلف، عدل المتغيرات في أعلى الملف:" -ForegroundColor Yellow
Write-Host "   `$TEACHER_ID = رقم_المعلم" -ForegroundColor White
Write-Host "   `$MOSQUE_ID = رقم_المسجد" -ForegroundColor White
Write-Host ""
