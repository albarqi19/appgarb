# 🎯 API تتبع المعلم من حضور الطالب وتسميعه

## 📋 الوصف
هذا API يقوم بتتبع نشاط المعلم اليومي من ناحية:
- ✅ **تسجيل حضور الطلاب**
- ✅ **تسجيل جلسات التسميع**
- ✅ **حساب النسب والإحصائيات**
- ✅ **تحديد حالة النشاط**

## 🔗 URL الـ API

### 1. نشاط المعلمين اليومي
```
GET /api/supervisors/teachers-daily-activity
```

### 2. إحصائيات المعلمين حسب الفترة
```
GET /api/supervisors/teachers-activity-statistics
```

## 📊 المعاملات (Parameters)

### للنشاط اليومي:
- `supervisor_id` (مطلوب): معرف المشرف
- `date` (اختياري): التاريخ بصيغة Y-m-d (افتراضي: اليوم)

### للإحصائيات:
- `supervisor_id` (مطلوب): معرف المشرف  
- `start_date` (اختياري): تاريخ البداية (افتراضي: قبل 7 أيام)
- `end_date` (اختياري): تاريخ النهاية (افتراضي: اليوم)

## 📝 أمثلة الاستخدام

### 1. جلب نشاط المعلمين اليوم:
```bash
curl -X GET "http://127.0.0.1:8000/api/supervisors/teachers-daily-activity?supervisor_id=1&date=2025-07-01" \
  -H "Accept: application/json"
```

### 2. جلب نشاط المعلمين لتاريخ محدد:
```bash
curl -X GET "http://127.0.0.1:8000/api/supervisors/teachers-daily-activity?supervisor_id=1&date=2025-06-30" \
  -H "Accept: application/json"
```

### 3. جلب إحصائيات الأسبوع الماضي:
```bash
curl -X GET "http://127.0.0.1:8000/api/supervisors/teachers-activity-statistics?supervisor_id=1&start_date=2025-06-24&end_date=2025-07-01" \
  -H "Accept: application/json"
```

## 📤 مثال على الاستجابة

```json
{
  "success": true,
  "data": {
    "date": "2025-07-01",
    "supervisor": {
      "id": 1,
      "name": "أحمد المشرف"
    },
    "teachers_activity": [
      {
        "teacher_id": 1,
        "teacher_name": "أحمد10",
        "phone": "0501234567",
        "job_title": "معلم",
        "circle": {
          "id": 7,
          "name": "حلقة الإمام علي"
        },
        "mosque": {
          "id": 1,
          "name": "مسجد النور"
        },
        "daily_activity": {
          "has_activity": true,
          "attendance_recorded": true,
          "recitation_recorded": true,
          "students_count": 25,
          "attendance_count": 20,
          "recitation_sessions_count": 3,
          "recited_students_count": 15,
          "attendance_percentage": 80.0,
          "recitation_percentage": 60.0,
          "activity_status": "نشط - مكتمل",
          "status_color": "green",
          "details": {
            "attendance_status": "تم التحضير",
            "recitation_status": "تم التسميع (60%)",
            "completion_summary": "مكتمل - حضور: 80%، تسميع: 60%"
          }
        }
      }
    ],
    "summary": {
      "total_teachers": 5,
      "active_teachers": 3,
      "attendance_recorded": 4,
      "recitation_recorded": 3,
      "completion_rate": 70.0,
      "attendance_percentage": 80.0,
      "recitation_percentage": 60.0
    }
  }
}
```

## 🎯 حالات النشاط

| الحالة | الوصف | اللون |
|--------|--------|--------|
| `نشط - مكتمل` | سجل الحضور والتسميع | 🟢 أخضر |
| `نشط - جزئي` | سجل إما الحضور أو التسميع | 🟡 برتقالي |
| `غير نشط` | لم يسجل أي نشاط | 🔴 أحمر |

## 📊 البيانات المحسوبة

### للمعلم الواحد:
- **students_count**: عدد الطلاب المسؤول عنهم
- **attendance_count**: عدد الطلاب الذين تم تسجيل حضورهم
- **recitation_sessions_count**: عدد جلسات التسميع
- **recited_students_count**: عدد الطلاب الذين تم تسميعهم
- **attendance_percentage**: نسبة الحضور
- **recitation_percentage**: نسبة التسميع

### للملخص العام:
- **total_teachers**: إجمالي المعلمين
- **active_teachers**: المعلمين النشطين
- **completion_rate**: معدل الإنجاز الإجمالي
- **attendance_percentage**: متوسط نسبة التحضير
- **recitation_percentage**: متوسط نسبة التسميع

## 🔄 كيفية عمل الـ API

1. **يحدد المعلمين**: بناءً على الحلقات المشرف عليها
2. **يفحص الحضور**: من جدول `attendances` للتاريخ المحدد
3. **يفحص التسميع**: من جدول `recitation_sessions` للتاريخ المحدد
4. **يحسب النسب**: بناءً على عدد الطلاب في كل حلقة
5. **يحدد الحالة**: حسب وجود النشاط من عدمه

## 📍 الموقع في الكود
- **الملف**: `app/Http/Controllers/Api/SupervisorController.php`
- **الدالة الرئيسية**: `getTeacherDailyActivity()`
- **الدالة المساعدة**: `getTeacherActivityForDate()`
- **الـ Routes**: `routes/api.php` (السطر 371-372)
