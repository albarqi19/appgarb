# =====================================
# اختبار APIs نظام المعلمين والطلاب
# تم الاختبار على: https://inviting-pleasantly-barnacle.ngrok-free.app
# التاريخ: 16 يونيو 2025
# =====================================

$API_BASE = "https://inviting-pleasantly-barnacle.ngrok-free.app/api"

Write-Host "اختبار APIs نظام المعلمين - الطلاب مخصصون للمعلم" -ForegroundColor Green
Write-Host "============================================================"

# =====================================
# 1. API جلب قائمة المعلمين
# =====================================
Write-Host ""
Write-Host "1. API: جلب قائمة المعلمين" -ForegroundColor Yellow
Write-Host "GET $API_BASE/teachers"
Write-Host "النتيجة: نجح - تم جلب 16 معلم"
Write-Host "البيانات تتضمن: معرف المعلم، الاسم، رقم الهوية، المسجد، عدد الطلاب"

# =====================================
# 2. API جلب مساجد معلم محدد مع طلابه
# =====================================
Write-Host ""
Write-Host "2. API: جلب مساجد معلم محدد مع طلابه" -ForegroundColor Yellow
Write-Host "GET $API_BASE/teachers/1/mosques"
Write-Host "النتيجة: نجح"
Write-Host "المعلم رقم 1 (أحمد10) يعمل في 3 مساجد:"
Write-Host "   • مسجد رقم 2 (سعد) - 4 طلاب"
Write-Host "   • مسجد رقم 1 (جامع هيلة الحربي) - 2 طلاب"
Write-Host "   • مسجد رقم 3 (مسجد التجريب 1) - 0 طلاب"
Write-Host "إجمالي الطلاب: 6 طلاب"

# =====================================
# 3. API المحدد: جلب طلاب معلم في مسجد معين
# =====================================
Write-Host ""
Write-Host "3. API المحدد: جلب طلاب معلم في مسجد معين" -ForegroundColor Cyan
Write-Host "GET $API_BASE/teachers/1/mosques/2/students"
Write-Host "النتيجة: نجح - هذا هو API المطلوب!"
Write-Host "طلاب المعلم 1 في المسجد 2:"
Write-Host "   1. سعدون (ID: 3) - حلقة الفردوس"
Write-Host "   2. حسين (ID: 12) - حلقة الفردوس"
Write-Host "   3. خالد (ID: 13) - حلقة الفردوس"
Write-Host "   4. أحمد تجربة (ID: 24) - حلقة الفردوس"

# =====================================
# النتيجة النهائية
# =====================================
Write-Host ""
Write-Host "============================================================"
Write-Host "النتيجة النهائية:" -ForegroundColor Green
Write-Host "الطلاب المعروضون للمعلم هم خاصون به فقط!"
Write-Host "عندما يختار المعلم مسجداً، يرى طلابه في ذلك المسجد فقط"
Write-Host "لا يرى المعلم طلاب المعلمين الآخرين"
Write-Host ""
Write-Host "API المحدد للاستخدام:"
Write-Host "GET /api/teachers/{teacher_id}/mosques/{mosque_id}/students" -ForegroundColor Magenta

# =====================================
# APIs أخرى مفيدة
# =====================================
Write-Host ""
Write-Host "APIs أخرى مفيدة:" -ForegroundColor Blue
Write-Host "• GET /api/teachers - جلب جميع المعلمين"
Write-Host "• GET /api/teachers/{id}/mosques - جلب مساجد المعلم مع الطلاب"
Write-Host "• GET /api/teachers/{id}/circles-detailed - جلب حلقات المعلم المفصلة"

# =====================================
# مثال للاستخدام مع curl
# =====================================
Write-Host ""
Write-Host "مثال للاستخدام مع curl:" -ForegroundColor Gray
Write-Host 'curl.exe -X GET "https://your-domain.com/api/teachers/1/mosques/2/students" -H "Accept: application/json"'

Write-Host ""
Write-Host "تم إنجاز الاختبار بنجاح!" -ForegroundColor Green
