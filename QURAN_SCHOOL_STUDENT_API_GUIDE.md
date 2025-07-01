# دليل استخدام APIs إدارة طلاب المدرسة القرآنية

## نظرة عامة

تم إنشاء مجموعة APIs خاصة بإدارة طلاب المدرسة القرآنية والتي تتيح:
- جلب معلومات المدرسة القرآنية مع الحلقات الفرعية النشطة فقط
- إضافة طالب جديد تلقائياً للمدرسة القرآنية (يتم ربطه بالمسجد والمدرسة تلقائياً)
- إدارة الطلاب (عرض، تحديث، إلغاء تفعيل)
- البحث والفلترة المتقدمة

---

## 📋 قائمة الـ APIs

### 1. جلب معلومات المدرسة القرآنية

**Endpoint:** `GET /api/quran-schools/{quranCircleId}/info`

**الوصف:** يجلب معلومات المدرسة القرآنية مع الحلقات الفرعية النشطة فقط

**المعاملات:**
- `quranCircleId` (path parameter): معرف المدرسة القرآنية

**مثال على الاستجابة:**
```json
{
  "success": true,
  "data": {
    "quran_school": {
      "id": 1,
      "name": "مدرسة النور القرآنية",
      "description": "مدرسة لتحفيظ القرآن الكريم",
      "mosque": {
        "id": 1,
        "name": "مسجد النور",
        "location": "حي النموذج"
      }
    },
    "circle_groups": [
      {
        "id": 1,
        "name": "الحلقة الأولى",
        "description": "للمبتدئين",
        "meeting_days": ["الأحد", "الثلاثاء", "الخميس"],
        "teacher": {
          "id": 1,
          "name": "أحمد محمد",
          "phone": "0501234567"
        },
        "students_count": 15
      }
    ],
    "statistics": {
      "total_students": 45,
      "active_students": 42,
      "total_groups": 3
    }
  }
}
```

---

### 2. إضافة طالب جديد

**Endpoint:** `POST /api/quran-schools/{quranCircleId}/students`

**الوصف:** يضيف طالب جديد للمدرسة القرآنية مع ربطه تلقائياً بالمسجد والمدرسة

**المعاملات:**
- `quranCircleId` (path parameter): معرف المدرسة القرآنية

**البيانات المطلوبة:**
```json
{
  "identity_number": "1234567890", // مطلوب، فريد
  "name": "محمد أحمد", // مطلوب
  "phone": "0501234567", // اختياري
  "guardian_name": "أحمد محمد", // مطلوب
  "guardian_phone": "0507654321", // مطلوب
  "birth_date": "2010-01-01", // اختياري
  "nationality": "سعودي", // اختياري
  "education_level": "ابتدائي", // اختياري
  "neighborhood": "حي النموذج", // اختياري
  "circle_group_id": 1, // مطلوب، معرف الحلقة الفرعية
  "enrollment_date": "2024-01-01", // اختياري، افتراضي: اليوم
  "memorization_plan": "حفظ جزء عم", // اختياري
  "review_plan": "مراجعة يومية" // اختياري
}
```

**مثال على الاستجابة:**
```json
{
  "success": true,
  "message": "تم إضافة الطالب بنجاح",
  "data": {
    "student": {
      "id": 100,
      "identity_number": "1234567890",
      "name": "محمد أحمد",
      "phone": "0501234567",
      "guardian_name": "أحمد محمد",
      "guardian_phone": "0507654321",
      "birth_date": "2010-01-01",
      "nationality": "سعودي",
      "education_level": "ابتدائي",
      "neighborhood": "حي النموذج",
      "enrollment_date": "2024-01-01",
      "memorization_plan": "حفظ جزء عم",
      "review_plan": "مراجعة يومية",
      "default_password": "7890", // كلمة المرور الافتراضية (آخر 4 أرقام من الهوية)
      "quran_school": {
        "id": 1,
        "name": "مدرسة النور القرآنية"
      },
      "circle_group": {
        "id": 1,
        "name": "الحلقة الأولى"
      },
      "mosque": {
        "id": 1,
        "name": "مسجد النور"
      }
    }
  }
}
```

---

### 3. جلب قائمة الطلاب

**Endpoint:** `GET /api/quran-schools/{quranCircleId}/students`

**الوصف:** يجلب قائمة طلاب المدرسة القرآنية مع إمكانية الفلترة والبحث

**المعاملات:**
- `quranCircleId` (path parameter): معرف المدرسة القرآنية
- `circle_group_id` (query parameter): فلترة حسب الحلقة الفرعية
- `is_active` (query parameter): فلترة حسب الحالة (true/false)
- `search` (query parameter): البحث بالاسم أو رقم الهوية
- `per_page` (query parameter): عدد النتائج في الصفحة (افتراضي: 15)

**أمثلة على الاستخدام:**
```
GET /api/quran-schools/1/students
GET /api/quran-schools/1/students?circle_group_id=1
GET /api/quran-schools/1/students?is_active=true
GET /api/quran-schools/1/students?search=محمد
GET /api/quran-schools/1/students?circle_group_id=1&is_active=true&per_page=20
```

**مثال على الاستجابة:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 100,
        "identity_number": "1234567890",
        "name": "محمد أحمد",
        "phone": "0501234567",
        "guardian_name": "أحمد محمد",
        "guardian_phone": "0507654321",
        "enrollment_date": "2024-01-01",
        "circle_group_id": 1,
        "is_active": true,
        "education_level": "ابتدائي",
        "memorization_plan": "حفظ جزء عم",
        "circle_group": {
          "id": 1,
          "name": "الحلقة الأولى",
          "teacher": {
            "id": 1,
            "name": "أحمد محمد"
          }
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 45,
      "last_page": 3
    }
  }
}
```

---

### 4. تحديث معلومات طالب

**Endpoint:** `PUT /api/quran-schools/{quranCircleId}/students/{studentId}`

**الوصف:** يحدث معلومات طالب موجود في المدرسة القرآنية

**المعاملات:**
- `quranCircleId` (path parameter): معرف المدرسة القرآنية
- `studentId` (path parameter): معرف الطالب

**البيانات القابلة للتحديث:**
```json
{
  "name": "محمد أحمد المحدث", // اختياري
  "phone": "0509876543", // اختياري
  "guardian_name": "أحمد محمد", // اختياري
  "guardian_phone": "0507654321", // اختياري
  "birth_date": "2010-01-01", // اختياري
  "nationality": "سعودي", // اختياري
  "education_level": "متوسط", // اختياري
  "neighborhood": "حي الأمل", // اختياري
  "circle_group_id": 2, // اختياري، تغيير الحلقة الفرعية
  "memorization_plan": "حفظ جزء عم + تبارك", // اختياري
  "review_plan": "مراجعة يومية", // اختياري
  "is_active": false // اختياري، تفعيل/إلغاء تفعيل
}
```

---

### 5. إلغاء تفعيل طالب

**Endpoint:** `DELETE /api/quran-schools/{quranCircleId}/students/{studentId}`

**الوصف:** يلغي تفعيل الطالب (حذف منطقي) دون حذف بياناته فعلياً

**المعاملات:**
- `quranCircleId` (path parameter): معرف المدرسة القرآنية
- `studentId` (path parameter): معرف الطالب

**مثال على الاستجابة:**
```json
{
  "success": true,
  "message": "تم إلغاء تفعيل الطالب بنجاح"
}
```

---

## 🔧 الميزات الخاصة

### 1. الربط التلقائي
- عند إضافة طالب، يتم ربطه تلقائياً بالمسجد والمدرسة القرآنية
- لا حاجة لتحديد `mosque_id` أو `quran_circle_id` يدوياً

### 2. كلمة المرور الافتراضية
- يتم إنشاء كلمة مرور افتراضية من آخر 4 أرقام من رقم الهوية
- الطالب مطالب بتغيير كلمة المرور عند أول تسجيل دخول

### 3. التحقق من الصحة
- فحص شامل لجميع البيانات المدخلة
- التأكد من عدم تكرار رقم الهوية
- التحقق من وجود الحلقة الفرعية وأنها نشطة وتنتمي للمدرسة

### 4. الحماية والأمان
- فحص الصلاحيات للتأكد من انتماء الطالب للمدرسة المحددة
- حذف منطقي بدلاً من الحذف الفعلي للبيانات

---

## 🧪 اختبار الـ APIs

### اختبار PHP:
```bash
php test_quran_school_student_api.php
```

### اختبار PowerShell:
```powershell
.\test_quran_school_api.ps1
```

---

## 📱 استخدام في الواجهة الأمامية

### مثال بـ JavaScript/Axios:

```javascript
// جلب معلومات المدرسة القرآنية
const getQuranSchoolInfo = async (quranSchoolId) => {
  const response = await axios.get(`/api/quran-schools/${quranSchoolId}/info`);
  return response.data;
};

// إضافة طالب جديد
const addStudent = async (quranSchoolId, studentData) => {
  const response = await axios.post(`/api/quran-schools/${quranSchoolId}/students`, studentData);
  return response.data;
};

// جلب قائمة الطلاب مع الفلترة
const getStudents = async (quranSchoolId, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await axios.get(`/api/quran-schools/${quranSchoolId}/students?${params}`);
  return response.data;
};

// تحديث طالب
const updateStudent = async (quranSchoolId, studentId, updateData) => {
  const response = await axios.put(`/api/quran-schools/${quranSchoolId}/students/${studentId}`, updateData);
  return response.data;
};

// إلغاء تفعيل طالب
const deactivateStudent = async (quranSchoolId, studentId) => {
  const response = await axios.delete(`/api/quran-schools/${quranSchoolId}/students/${studentId}`);
  return response.data;
};
```

---

## 🎯 حالات الاستخدام

### 1. واجهة إدارة المدرسة القرآنية:
1. استدعاء `/api/quran-schools/{id}/info` لعرض معلومات المدرسة والحلقات الفرعية
2. عرض نموذج إضافة طالب مع قائمة الحلقات الفرعية المتاحة
3. عند إرسال النموذج، استدعاء `POST /api/quran-schools/{id}/students`

### 2. واجهة عرض الطلاب:
1. استدعاء `GET /api/quran-schools/{id}/students` لعرض قائمة الطلاب
2. إضافة فلاتر للحلقة الفرعية والحالة
3. إضافة مربع بحث لإيجاد طلاب محددين

### 3. واجهة تعديل الطالب:
1. استدعاء `PUT /api/quran-schools/{id}/students/{studentId}` لتحديث البيانات
2. السماح بنقل الطالب بين الحلقات الفرعية داخل نفس المدرسة

---

## ✅ المميزات المحققة

1. **API موحد للمدرسة القرآنية** ✅
2. **ربط تلقائي بالمسجد والمدرسة** ✅  
3. **عرض الحلقات الفرعية النشطة فقط** ✅
4. **إدارة شاملة للطلاب** ✅
5. **فلترة وبحث متقدم** ✅
6. **حماية وتحقق من الصحة** ✅
7. **اختبارات شاملة** ✅

الـ APIs جاهزة للاستخدام ويمكن ربطها بالواجهة الأمامية مباشرة!
