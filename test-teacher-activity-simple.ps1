# Test Teacher Activity API - Simple Version
$API_BASE_URL = "https://inviting-pleasantly-barnacle.ngrok-free.app/api"
$Headers = @{
    'Content-Type' = 'application/json'
    'Accept' = 'application/json'
    'ngrok-skip-browser-warning' = 'true'
}

Write-Host "Testing Teacher Activity API" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

# Try login first
$credentials = @(
    @{ identity_number = "1234567890"; password = "password123" },
    @{ identity_number = "1234567890"; password = "123456" },
    @{ identity_number = "1234567890"; password = "admin123" }
)

$token = $null
$supervisorId = 1

foreach ($cred in $credentials) {
    Write-Host "Trying login with ID: $($cred.identity_number)" -ForegroundColor Yellow
    
    try {
        $loginData = $cred | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/auth/supervisor/login" -Method POST -Headers $Headers -Body $loginData
        
        if ($response.success -and $response.data.token) {
            $token = $response.data.token
            $supervisorId = $response.data.user.id
            Write-Host "Login successful! Supervisor ID: $supervisorId" -ForegroundColor Green
            break
        }
    }
    catch {
        Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test API with or without token
$testHeaders = $Headers.Clone()
if ($token) {
    $testHeaders['Authorization'] = "Bearer $token"
    Write-Host "Testing with authentication" -ForegroundColor Green
} else {
    Write-Host "Testing without authentication (expecting 401)" -ForegroundColor Yellow
}

# Test 1: Daily Activity
Write-Host "`nTesting Daily Teacher Activity API..." -ForegroundColor Blue
$date = Get-Date -Format "yyyy-MM-dd"
$url = "$API_BASE_URL/supervisors/teachers-daily-activity?supervisor_id=$supervisorId&date=$date"

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Headers $testHeaders
    
    if ($response.success) {
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Date: $($response.data.date)" -ForegroundColor White
        Write-Host "Supervisor: $($response.data.supervisor.name)" -ForegroundColor White
        
        $summary = $response.data.summary
        Write-Host "`nSummary:" -ForegroundColor Cyan
        Write-Host "  Total Teachers: $($summary.total_teachers)" -ForegroundColor White
        Write-Host "  Active Teachers: $($summary.active_teachers)" -ForegroundColor Green
        Write-Host "  Attendance Recorded: $($summary.attendance_recorded)" -ForegroundColor Yellow
        Write-Host "  Recitation Recorded: $($summary.recitation_recorded)" -ForegroundColor Blue
        Write-Host "  Completion Rate: $($summary.completion_rate)%" -ForegroundColor Magenta
        Write-Host "  Attendance Rate: $($summary.attendance_percentage)%" -ForegroundColor Green
        Write-Host "  Recitation Rate: $($summary.recitation_percentage)%" -ForegroundColor Blue
        
        if ($response.data.teachers_activity.Count -gt 0) {
            Write-Host "`nFirst 3 Teachers:" -ForegroundColor Cyan
            $response.data.teachers_activity | Select-Object -First 3 | ForEach-Object {
                $teacher = $_
                $activity = $teacher.daily_activity
                Write-Host "  Teacher: $($teacher.teacher_name)" -ForegroundColor White
                Write-Host "    Circle: $($teacher.circle.name)" -ForegroundColor Gray
                Write-Host "    Status: $($activity.activity_status)" -ForegroundColor White
                Write-Host "    Students: $($activity.students_count)" -ForegroundColor Gray
                Write-Host "    Attendance: $($activity.attendance_percentage)%" -ForegroundColor Gray
                Write-Host "    Recitation: $($activity.recitation_percentage)%" -ForegroundColor Gray
                Write-Host "    Summary: $($activity.details.completion_summary)" -ForegroundColor DarkGray
                Write-Host ""
            }
        }
    }
}
catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 2: Statistics
Write-Host "`nTesting Teacher Activity Statistics API..." -ForegroundColor Blue
$startDate = (Get-Date).AddDays(-7).ToString("yyyy-MM-dd")
$endDate = Get-Date -Format "yyyy-MM-dd"
$statsUrl = "$API_BASE_URL/supervisors/teachers-activity-statistics?supervisor_id=$supervisorId&start_date=$startDate&end_date=$endDate"

try {
    $statsResponse = Invoke-RestMethod -Uri $statsUrl -Method GET -Headers $testHeaders
    
    if ($statsResponse.success) {
        Write-Host "Statistics SUCCESS!" -ForegroundColor Green
        Write-Host "Period: $startDate to $endDate" -ForegroundColor White
        
        if ($statsResponse.data.period_summary) {
            $periodSummary = $statsResponse.data.period_summary
            Write-Host "`nPeriod Summary:" -ForegroundColor Cyan
            Write-Host "  Days: $($periodSummary.days_count)" -ForegroundColor White
            Write-Host "  Avg Active Teachers: $($periodSummary.average_active_teachers)" -ForegroundColor Green
            Write-Host "  Avg Completion Rate: $($periodSummary.average_completion_rate)%" -ForegroundColor Magenta
        }
    }
}
catch {
    Write-Host "Statistics Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`nTest Complete!" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
