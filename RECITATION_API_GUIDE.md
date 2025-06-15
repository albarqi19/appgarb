# دليل استخدام API نظام جلسات التسميع والأخطاء

## 📖 المقدمة
هذا الدليل يوضح كيفية استخدام API الخاص بنظام جلسات التسميع وإدارة الأخطاء في مشروع GARB.

## 🌐 معلومات عامة
- **Base URL**: `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **Response Format**: JSON

---

## 📋 1. إنشاء جلسة تسميع جديدة

### **POST** `/recitation/sessions`

### البيانات المطلوبة:
```json
{
    "student_id": 1,
    "teacher_id": 2,
    "quran_circle_id": 1,
    "start_surah_number": 2,
    "start_verse": 1,
    "end_surah_number": 2,
    "end_verse": 5,
    "recitation_type": "مراجعة صغرى",
    "grade": 7.5,
    "evaluation": "جيد جداً",
    "teacher_notes": "جلسة تجريبية عبر API"
}
```

### الحقول الإجبارية:
- **student_id**: معرف الطالب (يجب أن يكون موجود في جدول students)
- **teacher_id**: معرف المعلم (يجب أن يكون موجود في جدول users)
- **quran_circle_id**: معرف الحلقة (يجب أن يكون موجود في جدول quran_circles)
- **evaluation**: التقييم (القيم المقبولة: "ممتاز", "جيد جداً", "جيد", "مقبول", "ضعيف")
- **recitation_type**: نوع التلاوة (القيم المقبولة: "حفظ", "مراجعة صغرى", "مراجعة كبرى", "تثبيت")

### الحقول الاختيارية:
- **start_surah_number**: رقم السورة البداية
- **start_verse**: رقم الآية البداية
- **end_surah_number**: رقم السورة النهاية
- **end_verse**: رقم الآية النهاية
- **grade**: الدرجة (رقم)
- **teacher_notes**: ملاحظات المعلم

### مثال على الاستجابة الناجحة:
```json
{
    "success": true,
    "message": "تم إنشاء جلسة التسميع بنجاح",
    "data": {
        "session_id": "RS-20250609-143022-0001",
        "student_name": "أحمد علي البارقي",
        "teacher_name": "مستخدم العرض التوضيحي",
        "circle_name": "حلقة تجريبية للاختبار",
        "recitation_type": "مراجعة صغرى",
        "evaluation": "جيد جداً",
        "grade": 7.5
    }
}
```

### أخطاء محتملة (HTTP 422):
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "quran_circle_id": ["The quran circle id field is required."],
        "evaluation": ["The evaluation field is required."],
        "recitation_type": ["The selected recitation type is invalid."]
    }
}
```

---

## 📚 2. جلب جلسات التسميع

### **GET** `/recitation/sessions`

### معاملات الاستعلام (Query Parameters):
- **limit**: عدد الجلسات المطلوب جلبها (افتراضي: 5 في الاختبار)
- **student_id**: معرف طالب معين لجلب جلساته فقط

### مثال على الطلب:
```
GET /api/recitation/sessions?limit=5&student_id=1
```

### مثال على الاستجابة:
```json
{
    "success": true,
    "data": {
        "data": [
            {
                "session_id": "RS-20250609-143022-0001",
                "student_name": "أحمد علي البارقي",
                "teacher_name": "مستخدم العرض التوضيحي",
                "circle_name": "حلقة تجريبية للاختبار",
                "recitation_type": "مراجعة صغرى",
                "evaluation": "جيد جداً",
                "grade": 7.5,
                "session_date": "2025-06-09 14:30:22",
                "has_errors": false
            }
        ]
    }
}
```

---

## 🐛 3. إضافة أخطاء التلاوة

### **POST** `/recitation/errors`

### البيانات المطلوبة:
```json
{
    "session_id": "RS-20250609-143022-0001",
    "errors": [
        {
            "surah_number": 2,
            "verse_number": 10,
            "word_text": "يخادعون",
            "error_type": "نطق",
            "correction_note": "نطق الخاء غير صحيح",
            "teacher_note": "تدريب على الحروف الحلقية",
            "is_repeated": false,
            "severity_level": "متوسط"
        }
    ]
}
```

### الحقول الإجبارية:
- **session_id**: معرف الجلسة (يجب أن تكون موجودة)
- **errors**: مصفوفة من الأخطاء

### حقول كل خطأ:
- **surah_number**: رقم السورة
- **verse_number**: رقم الآية
- **word_text**: النص/الكلمة التي بها الخطأ
- **error_type**: نوع الخطأ (القيم المقبولة: "تجويد", "نطق", "ترتيل", "تشكيل")
- **correction_note**: ملاحظة التصحيح
- **severity_level**: مستوى شدة الخطأ (القيم المقبولة: "خفيف", "متوسط", "شديد")
- **is_repeated**: هل الخطأ متكرر (true/false)
- **teacher_note**: ملاحظة المعلم (اختياري)

### مثال على الاستجابة الناجحة:
```json
{
    "success": true,
    "message": "تم إضافة الأخطاء بنجاح",
    "total_errors": 1,
    "session_updated": true
}
```

---

## 📊 4. جلب أخطاء جلسة معينة

ملاحظة: هذا الـ endpoint غير مُختبر في ملف الاختبار، لكن يمكن أن يكون متاحاً.

### **GET** `/recitation/sessions/{session_id}/errors`

### مثال على الطلب:
```
GET /api/recitation/sessions/RS-20250609-143022-0001/errors
```

### مثال على الاستجابة:
```json
{
    "success": true,
    "data": {
        "session_id": "RS-20250609-143022-0001",
        "total_errors": 4,
        "errors_by_type": {
            "تجويد": 1,
            "نطق": 1,
            "ترتيل": 1,
            "تشكيل": 1
        },
        "errors_by_severity": {
            "متوسط": 2,
            "خفيف": 1,
            "شديد": 1
        },
        "repeated_errors": 2,
        "errors": [
            {
                "surah_number": 1,
                "verse_number": 2,
                "word_text": "الرحمن",
                "error_type": "تجويد",
                "correction_note": "عدم مد الألف في الرحمن",
                "severity_level": "متوسط",
                "is_repeated": true
            }
        ]
    }
}
```

---

## 🔍 5. أمثلة عملية

### إنشاء جلسة تسميع بـ cURL:
```bash
curl -X POST http://localhost:8000/api/recitation/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "teacher_id": 2,
    "quran_circle_id": 1,
    "start_surah_number": 2,
    "start_verse": 1,
    "end_surah_number": 2,
    "end_verse": 5,
    "recitation_type": "مراجعة صغرى",
    "grade": 7.5,
    "evaluation": "جيد جداً",
    "teacher_notes": "جلسة تجريبية عبر API"
  }'
```

### إضافة أخطاء بـ cURL:
```bash
curl -X POST http://localhost:8000/api/recitation/errors \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "RS-20250609-143022-0001",
    "errors": [
      {
        "surah_number": 2,
        "verse_number": 10,
        "word_text": "يخادعون",
        "error_type": "نطق",
        "correction_note": "نطق الخاء غير صحيح",
        "teacher_note": "تدريب على الحروف الحلقية",
        "is_repeated": false,
        "severity_level": "متوسط"
      }
    ]
  }'
```

---

## ⚠️ ملاحظات مهمة

### 1. القيم المقبولة:

**أنواع التلاوة (recitation_type):**
- حفظ
- مراجعة صغرى  
- مراجعة كبرى
- تثبيت

**التقييمات (evaluation):**
- ممتاز
- جيد جداً
- جيد
- مقبول
- ضعيف

**أنواع الأخطاء (error_type):**
- تجويد
- نطق
- ترتيل
- تشكيل

**مستويات شدة الخطأ (severity_level):**
- خفيف
- متوسط
- شديد

### 2. معرفات الجلسات:
- تتبع النمط: `RS-YYYYMMDD-HHMMSS-NNNN`
- مثال: `RS-20250609-143022-0001`

### 3. معالجة الأخطاء:
- كود 422: بيانات غير صالحة أو ناقصة
- كود 404: الجلسة غير موجودة
- كود 500: خطأ في الخادم

### 4. أفضل الممارسات:
- تأكد من وجود الطالب والمعلم والحلقة قبل إنشاء الجلسة
- استخدم القيم المحددة بدقة للحقول المقيدة
- أضف الأخطاء فور حدوثها للحفاظ على دقة البيانات
- استخدم معاملات التصفية في جلب الجلسات لتحسين الأداء

---

## 🧪 اختبار API

يمكنك استخدام الأمر التالي لاختبار جميع وظائف API:

```bash
php artisan test:recitation-complete --api
```

هذا الأمر سيقوم بـ:
- اختبار إنشاء جلسة جديدة
- اختبار جلب الجلسات  
- اختبار إضافة الأخطاء
- عرض النتائج والأخطاء إن وجدت

---

## 📞 الدعم

إذا واجهت أي مشاكل، يمكنك:
1. تشغيل الاختبار الشامل: `php artisan test:recitation-complete`
2. فحص ملفات السجل في `storage/logs/`
3. التأكد من صحة البيانات المرسلة
4. التحقق من حالة قاعدة البيانات

---

## ⚠️ تنبيه مهم

هذا الدليل مُستخرج مباشرة من ملف الاختبار `TestRecitationSessionsAndErrors.php` والذي يعمل بنجاح. 
جميع الـ endpoints والبيانات المذكورة هنا مُختبرة ومؤكدة الصحة.

**الـ endpoints المختبرة فعلياً:**
- ✅ `POST /recitation/sessions` - إنشاء جلسة
- ✅ `GET /recitation/sessions` - جلب الجلسات  
- ✅ `POST /recitation/errors` - إضافة أخطاء

**الـ endpoints غير المختبرة (قد تكون متاحة):**
- ❓ `GET /recitation/sessions/{session_id}/errors` - جلب أخطاء جلسة معينة
