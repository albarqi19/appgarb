# اختبار API التحضير باستخدام PowerShell

$apiUrl = "http://127.0.0.1:8000/api/attendance/record"

$testData = @{
    teacherId = 1
    date = (Get-Date).ToString("yyyy-MM-dd")
    time = (Get-Date).ToString("HH:mm:ss")
    students = @(
        @{
            studentId = 1
            status = "حاضر"
            notes = "طالب مجتهد"
        },
        @{
            studentId = 2
            status = "متأخر"
            notes = "تأخر 10 دقائق"
        },
        @{
            studentId = 3
            status = "غائب"
            notes = ""
        }
    )
}

$jsonData = $testData | ConvertTo-Json -Depth 10

Write-Host "بيانات الاختبار:"
Write-Host $jsonData

Write-Host "`n اختبار API..."

try {
    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $jsonData -ContentType "application/json" -Headers @{"Accept"="application/json"}
    
    Write-Host "حالة الاستجابة: $($response.StatusCode)"
    Write-Host "محتوى الاستجابة:"
    Write-Host $response.Content
    
} catch {
    Write-Host "خطأ في الطلب:"
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "محتوى الخطأ:"
        Write-Host $responseBody
    }
}
