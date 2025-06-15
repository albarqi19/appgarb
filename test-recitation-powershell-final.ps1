# اختبار شامل لـ API التسميع والأخطاء باستخدام PowerShell
# مبني على نفس منطق ملف PHP المرفق

$API_BASE_URL = "http://localhost:8000/api"

# دوال المساعدة
function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Cyan
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Separator($char = "=", $length = 80) {
    Write-Host ($char * $length) -ForegroundColor White
}

function Write-SubSeparator($char = "-", $length = 50) {
    Write-Host ($char * $length) -ForegroundColor Gray
}

# جلب البيانات الموجودة
function Get-ExistingData {
    Write-Info "📋 جلب البيانات الموجودة من الجلسات..."
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/sessions?limit=5" -Method GET -ContentType "application/json"
        
        if ($response.success -and $response.data.data.Count -gt 0) {
            $session = $response.data.data[0]
            Write-Success "تم العثور على $($response.data.data.Count) جلسة"
            
            return @{
                student_id = $session.student_id
                teacher_id = $session.teacher_id  
                circle_id = $session.quran_circle_id
                sample_session = $session
            }
        } else {
            Write-Warning "لا توجد جلسات محفوظة - سنحتاج لاستخدام قيم افتراضية"
            return @{
                student_id = 1
                teacher_id = 1
                circle_id = 1
                sample_session = $null
            }
        }
    } catch {
        Write-Error "خطأ في جلب البيانات: $($_.Exception.Message)"
        return $null
    }
}

# اختبار إنشاء جلسة جديدة
function Test-CreateSession($basicData) {
    Write-Warning "🗄️ اختبار إنشاء جلسة تلاوة جديدة..."
    Write-SubSeparator
    
    Write-Info "1️⃣ اختبار إنشاء جلسة تلاوة جديدة..."
    
    # إنشاء session_id مثل PHP
    $now = Get-Date
    $dateStr = $now.ToString("yyyyMMdd")
    $timeStr = $now.ToString("HHmmss")
    $sessionId = "RS-$dateStr-$timeStr-TEST"
    
    # نفس البيانات المستخدمة في ملف PHP
    $sessionData = @{
        session_id = $sessionId
        student_id = $basicData.student_id
        teacher_id = $basicData.teacher_id
        quran_circle_id = $basicData.circle_id
        start_surah_number = 1
        start_verse = 1
        end_surah_number = 1
        end_verse = 7
        recitation_type = "حفظ"
        grade = 9.0
        evaluation = "ممتاز"
        teacher_notes = "أداء ممتاز في التلاوة - اختبار API PowerShell"
        has_errors = $false
        session_date = $now.ToString("yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/sessions" -Method POST -ContentType "application/json" -Body $sessionData
        
        if ($response.success) {
            Write-Success "تم إنشاء الجلسة: $sessionId"
            Write-Host "   📚 الطالب ID: $($basicData.student_id)"
            Write-Host "   👨‍🏫 المعلم ID: $($basicData.teacher_id)"
            Write-Host "   🎯 الدرجة: 9.0"
            Write-Host "   📊 التقييم: ممتاز"
            
            return $sessionId
        } else {
            Write-Error "فشل إنشاء الجلسة"
            Write-Host "📄 تفاصيل الاستجابة: $($response | ConvertTo-Json -Depth 3)"
            return $null
        }
    } catch {
        Write-Error "خطأ في إنشاء الجلسة: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "📄 تفاصيل الخطأ: $errorContent"
        }
        return $null
    }
}

# اختبار استرجاع الجلسات
function Test-RetrieveSessions {
    Write-Info "2️⃣ اختبار استرجاع الجلسات..."
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/sessions?limit=5" -Method GET -ContentType "application/json"
        
        if ($response.success) {
            $sessions = $response.data.data
            Write-Host "   📋 عدد الجلسات المسترجعة: $($sessions.Count)"
            
            for ($i = 0; $i -lt $sessions.Count; $i++) {
                $session = $sessions[$i]
                $studentInfo = if ($session.student) { $session.student.name } else { "Student ID: $($session.student_id)" }
                $evaluation = if ($session.evaluation) { $session.evaluation } else { "غير محدد" }
                Write-Host "   $($i + 1). $($session.session_id) - $studentInfo - $evaluation"
            }
            
            return $sessions
        } else {
            Write-Error "فشل استرجاع الجلسات"
            return @()
        }
    } catch {
        Write-Error "خطأ في استرجاع الجلسات: $($_.Exception.Message)"
        return @()
    }
}

# اختبار إضافة الأخطاء
function Test-ErrorManagement($sessionId) {
    Write-Warning "🐛 اختبار إدارة أخطاء التلاوة..."
    Write-SubSeparator
    
    if (-not $sessionId) {
        Write-Error "❌ لا يوجد session_id لإضافة الأخطاء"
        return $false
    }
    
    Write-Host "🔍 استخدام الجلسة: $sessionId"
    
    Write-Info "1️⃣ اختبار إضافة أخطاء متنوعة..."
    
    # نفس الأخطاء من ملف PHP بالضبط
    $errors = @(
        @{
            surah_number = 1
            verse_number = 2
            word_text = "الرحمن"
            error_type = "تجويد"
            correction_note = "عدم مد الألف في `"الرحمن`""
            teacher_note = "يحتاج مراجعة أحكام المد"
            is_repeated = $true
            severity_level = "متوسط"
        },
        @{
            surah_number = 1
            verse_number = 3
            word_text = "مالك"
            error_type = "نطق"
            correction_note = "نطق الكاف غير واضح"
            teacher_note = "تدريب على مخارج الحروف"
            is_repeated = $false
            severity_level = "خفيف"
        },
        @{
            surah_number = 1
            verse_number = 4
            word_text = "الدين"
            error_type = "ترتيل"
            correction_note = "سرعة في القراءة"
            teacher_note = "التأني في الترتيل"
            is_repeated = $true
            severity_level = "شديد"
        },
        @{
            surah_number = 1
            verse_number = 6
            word_text = "الصراط"
            error_type = "تشكيل"
            correction_note = "خطأ في تشكيل الصاد"
            teacher_note = "مراجعة التشكيل"
            is_repeated = $false
            severity_level = "متوسط"
        }
    )
    
    $errorData = @{
        session_id = $sessionId
        errors = $errors
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/errors" -Method POST -ContentType "application/json" -Body $errorData
        
        if ($response.success) {
            foreach ($error in $errors) {
                Write-Success "تم إضافة خطأ $($error.error_type) في سورة $($error.surah_number) آية $($error.verse_number)"
            }
            
            # اختبار استرجاع الأخطاء
            Start-Sleep -Seconds 1
            Write-Info "2️⃣ اختبار استرجاع أخطاء الجلسة..."
            
            $errorsResponse = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/errors?session_id=$sessionId" -Method GET -ContentType "application/json"
            
            if ($errorsResponse.success) {
                $sessionErrors = $errorsResponse.data.data
                Write-Host "   📋 عدد الأخطاء: $($sessionErrors.Count)"
                
                # عرض الأخطاء في جدول مثل PHP
                Show-ErrorsTable $sessionErrors
                
                # إحصائيات الأخطاء
                Write-Info "3️⃣ إحصائيات أخطاء الجلسة..."
                $errorStats = Get-ErrorStats $sessionErrors
                Show-ErrorStats $errorStats
                
                return $true
            } else {
                Write-Error "فشل استرجاع الأخطاء"
                return $false
            }
        } else {
            Write-Error "فشل إضافة الأخطاء"
            Write-Host "📄 تفاصيل الاستجابة: $($response | ConvertTo-Json -Depth 3)"
            return $false
        }
    } catch {
        Write-Error "خطأ في إدارة الأخطاء: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "📄 تفاصيل الخطأ: $errorContent"
        }
        return $false
    }
}

# عرض الأخطاء في جدول (مثل PHP)
function Show-ErrorsTable($errors) {
    if ($errors.Count -eq 0) {
        Write-Host "   📋 لا توجد أخطاء في هذه الجلسة"
        return
    }
    
    Write-Host "   +-----------------------------------------------------------------------------------------------+"
    Write-Host "   | سورة | آية | الكلمة     | نوع الخطأ | شدة الخطأ | متكرر | ملاحظة التصحيح                          |"
    Write-Host "   +-----------------------------------------------------------------------------------------------+"
    
    foreach ($error in $errors) {
        $repeated = if ($error.is_repeated) { "نعم" } else { "لا" }
        $surah = $error.surah_number.ToString().PadRight(4)
        $verse = $error.verse_number.ToString().PadRight(3)
        $word = if ($error.word_text) { $error.word_text.Substring(0, [Math]::Min(10, $error.word_text.Length)).PadRight(10) } else { "".PadRight(10) }
        $errorType = if ($error.error_type) { $error.error_type.Substring(0, [Math]::Min(9, $error.error_type.Length)).PadRight(9) } else { "".PadRight(9) }
        $severity = if ($error.severity_level) { $error.severity_level.Substring(0, [Math]::Min(8, $error.severity_level.Length)).PadRight(8) } else { "".PadRight(8) }
        $repeatedPad = $repeated.PadRight(4)
        $correction = if ($error.correction_note) { $error.correction_note.Substring(0, [Math]::Min(40, $error.correction_note.Length)).PadRight(40) } else { "".PadRight(40) }
        
        Write-Host "   | $surah | $verse | $word | $errorType | $severity | $repeatedPad | $correction |"
    }
    
    Write-Host "   +-----------------------------------------------------------------------------------------------+"
}

# حساب إحصائيات الأخطاء
function Get-ErrorStats($errors) {
    if ($errors.Count -eq 0) {
        return @{}
    }
    
    $byType = @{}
    $bySeverity = @{}
    $repeated = 0
    $nonRepeated = 0
    
    foreach ($error in $errors) {
        # حسب النوع
        if ($error.error_type) {
            if ($byType.ContainsKey($error.error_type)) {
                $byType[$error.error_type]++
            } else {
                $byType[$error.error_type] = 1
            }
        }
        
        # حسب الشدة
        if ($error.severity_level) {
            if ($bySeverity.ContainsKey($error.severity_level)) {
                $bySeverity[$error.severity_level]++
            } else {
                $bySeverity[$error.severity_level] = 1
            }
        }
        
        # المتكرر/غير المتكرر
        if ($error.is_repeated) {
            $repeated++
        } else {
            $nonRepeated++
        }
    }
    
    return @{
        total = $errors.Count
        by_type = $byType
        by_severity = $bySeverity
        repeated = $repeated
        non_repeated = $nonRepeated
    }
}

# عرض إحصائيات الأخطاء (مثل PHP)
function Show-ErrorStats($stats) {
    if ($stats.Count -eq 0) {
        Write-Host "   📊 لا توجد أخطاء لحساب الإحصائيات"
        return
    }
    
    Write-Host "   📊 إجمالي الأخطاء: $($stats.total)"
    
    Write-Host "   🔸 حسب النوع:"
    foreach ($type in $stats.by_type.Keys) {
        Write-Host "      - $type`: $($stats.by_type[$type]) أخطاء"
    }
    
    Write-Host "   🎯 حسب الشدة:"
    foreach ($severity in $stats.by_severity.Keys) {
        Write-Host "      - $severity`: $($stats.by_severity[$severity]) أخطاء"
    }
    
    Write-Host "   🔄 الأخطاء المتكررة: $($stats.repeated)"
    Write-Host "   ✨ الأخطاء غير المتكررة: $($stats.non_repeated)"
}

# عرض الإحصائيات العامة
function Show-GeneralStats {
    Write-Warning "📊 عرض الإحصائيات العامة..."
    Write-SubSeparator
    
    try {
        # جلب جميع الجلسات
        $sessionsResponse = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/sessions" -Method GET -ContentType "application/json"
        
        if ($sessionsResponse.success) {
            $allSessions = $sessionsResponse.data.data
            
            Write-Info "📈 الإحصائيات العامة:"
            Write-Host "   📚 إجمالي الجلسات: $($allSessions.Count)"
            
            # إحصائيات أنواع التلاوة
            $recitationTypes = @{}
            foreach ($session in $allSessions) {
                if ($session.recitation_type) {
                    if ($recitationTypes.ContainsKey($session.recitation_type)) {
                        $recitationTypes[$session.recitation_type]++
                    } else {
                        $recitationTypes[$session.recitation_type] = 1
                    }
                }
            }
            
            Write-Info "📖 إحصائيات أنواع التلاوة:"
            foreach ($type in $recitationTypes.Keys) {
                Write-Host "   🔹 $type`: $($recitationTypes[$type]) جلسة"
            }
            
            # إحصائيات التقييمات
            $evaluations = @{}
            foreach ($session in $allSessions) {
                if ($session.evaluation) {
                    if ($evaluations.ContainsKey($session.evaluation)) {
                        $evaluations[$session.evaluation]++
                    } else {
                        $evaluations[$session.evaluation] = 1
                    }
                }
            }
            
            Write-Info "🏆 إحصائيات التقييمات:"
            $sortedEvaluations = $evaluations.GetEnumerator() | Sort-Object Value -Descending
            foreach ($eval in $sortedEvaluations) {
                Write-Host "   🌟 $($eval.Key): $($eval.Value) جلسة"
            }
            
            # أحدث الجلسات
            Write-Info "🕒 أحدث 5 جلسات:"
            $recentSessions = $allSessions | Select-Object -First 5
            
            for ($i = 0; $i -lt $recentSessions.Count; $i++) {
                $session = $recentSessions[$i]
                $hasErrors = if ($session.has_errors) { "⚠️" } else { "✅" }
                $studentInfo = if ($session.student) { $session.student.name } else { "Student ID: $($session.student_id)" }
                $evaluation = if ($session.evaluation) { $session.evaluation } else { "غير محدد" }
                Write-Host "   $($i + 1). $($session.session_id) - $studentInfo - $evaluation $hasErrors"
            }
        }
        
        # جلب إحصائيات الأخطاء
        try {
            $errorsResponse = Invoke-RestMethod -Uri "$API_BASE_URL/recitation/errors" -Method GET -ContentType "application/json"
            
            if ($errorsResponse.success) {
                $allErrors = $errorsResponse.data.data
                Write-Host "   🐛 إجمالي الأخطاء: $($allErrors.Count)"
                
                if ($allErrors.Count -gt 0) {
                    # إحصائيات أنواع الأخطاء
                    $errorTypes = @{}
                    foreach ($error in $allErrors) {
                        if ($error.error_type) {
                            if ($errorTypes.ContainsKey($error.error_type)) {
                                $errorTypes[$error.error_type]++
                            } else {
                                $errorTypes[$error.error_type] = 1
                            }
                        }
                    }
                    
                    Write-Info "🐛 إحصائيات أنواع الأخطاء:"
                    $sortedErrorTypes = $errorTypes.GetEnumerator() | Sort-Object Value -Descending
                    foreach ($errorType in $sortedErrorTypes) {
                        Write-Host "   🔸 $($errorType.Key): $($errorType.Value) خطأ"
                    }
                    
                    # إحصائيات شدة الأخطاء
                    $severityLevels = @{}
                    foreach ($error in $allErrors) {
                        if ($error.severity_level) {
                            if ($severityLevels.ContainsKey($error.severity_level)) {
                                $severityLevels[$error.severity_level]++
                            } else {
                                $severityLevels[$error.severity_level] = 1
                            }
                        }
                    }
                    
                    Write-Info "⚡ إحصائيات شدة الأخطاء:"
                    foreach ($severity in $severityLevels.Keys) {
                        Write-Host "   🎯 $severity`: $($severityLevels[$severity]) خطأ"
                    }
                }
            }
        } catch {
            Write-Host "   📝 لا توجد أخطاء أو لا يمكن الوصول لـ API الأخطاء"
        }
        
    } catch {
        Write-Error "خطأ في عرض الإحصائيات: $($_.Exception.Message)"
    }
}

# الدالة الرئيسية (مشابهة لـ PHP)
function Start-ComprehensiveTest {
    Write-Host "🚀 بدء الاختبار الشامل لنظام جلسات التلاوة والأخطاء..." -ForegroundColor Magenta
    Write-Separator
    
    try {
        # 1. جلب البيانات الموجودة
        $basicData = Get-ExistingData
        if (-not $basicData) {
            Write-Error "❌ فشل في الحصول على البيانات الأساسية"
            return
        }
        
        Start-Sleep -Seconds 1
        
        # 2. اختبار إنشاء جلسة جديدة
        $sessionId = Test-CreateSession $basicData
        
        Start-Sleep -Seconds 1
        
        # 3. اختبار استرجاع الجلسات
        Test-RetrieveSessions
        
        Start-Sleep -Seconds 1
        
        # 4. اختبار إدارة الأخطاء (إذا تم إنشاء الجلسة بنجاح)
        if ($sessionId) {
            Test-ErrorManagement $sessionId
            Start-Sleep -Seconds 1
        }
        
        # 5. عرض الإحصائيات العامة
        Show-GeneralStats
        
        Write-Host "`n🎉 انتهى الاختبار الشامل بنجاح!" -ForegroundColor Green
        
    } catch {
        Write-Error "خطأ عام في الاختبار: $($_.Exception.Message)"
        Write-Host $_.Exception.StackTrace
    }
}

# تشغيل الاختبار
Write-Host "🔥 بدء تشغيل ملف اختبار PowerShell..." -ForegroundColor Yellow
Start-ComprehensiveTest
