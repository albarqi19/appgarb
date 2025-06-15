# اختبار بسيط
Write-Host "Test API"
$response = Invoke-RestMethod "http://localhost:8000/api/recitation/sessions" -Method GET
Write-Host "Sessions count: $(($response.data.data).count)"
