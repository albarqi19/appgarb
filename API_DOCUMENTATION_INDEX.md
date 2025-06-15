# API Documentation Index - فهرس التوثيق

## Available Documentation Files | الملفات المتاحة

### Arabic Documentation | التوثيق العربي
1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - التوثيق الشامل للنظام
2. **[TEACHER_MULTI_MOSQUE_API_DOCUMENTATION.md](./TEACHER_MULTI_MOSQUE_API_DOCUMENTATION.md)** - توثيق نظام المعلمين متعدد المساجد
3. **[MOSQUE_API_DOCUMENTATION.md](./MOSQUE_API_DOCUMENTATION.md)** - توثيق API المساجد

### English Documentation | التوثيق الإنجليزي
1. **[API_DOCUMENTATION_EN.md](./API_DOCUMENTATION_EN.md)** - Comprehensive System Documentation
2. **[TEACHER_MULTI_MOSQUE_API_DOCUMENTATION_EN.md](./TEACHER_MULTI_MOSQUE_API_DOCUMENTATION_EN.md)** - Multi-Mosque Teacher System Documentation
3. **[MOSQUE_API_DOCUMENTATION_EN.md](./MOSQUE_API_DOCUMENTATION_EN.md)** - Mosque API Documentation

---

## Quick Reference | مرجع سريع

### Main API Endpoints | نقاط النهاية الرئيسية

#### Teachers | المعلمين
- `GET /api/teachers` - List all teachers | قائمة المعلمين
- `GET /api/teachers/{id}` - Teacher details | تفاصيل المعلم
- `GET /api/teachers/{id}/mosques` - Teacher's mosques | مساجد المعلم
- `GET /api/teachers/{id}/circles` - Teacher's circles | حلقات المعلم
- `GET /api/teachers/{id}/students` - Teacher's students | طلاب المعلم

#### Students | الطلاب
- `GET /api/students` - List all students | قائمة الطلاب
- `GET /api/students/{id}` - Student details | تفاصيل الطالب
- `GET /api/students/{id}/attendance` - Student attendance | حضور الطالب
- `GET /api/students/{id}/memorization` - Memorization progress | تقدم الحفظ

#### Mosques | المساجد
- `GET /api/mosques` - List all mosques | قائمة المساجد
- `GET /api/mosques/{id}` - Mosque details | تفاصيل المسجد
- `GET /api/mosques/{id}/teachers` - Mosque teachers | معلمو المسجد
- `GET /api/mosques/{id}/students` - Mosque students | طلاب المسجد
- `GET /api/mosques/{id}/circles` - Mosque circles | حلقات المسجد

#### Circles | الحلقات
- `GET /api/circles` - List all circles | قائمة الحلقات
- `GET /api/circles/{id}` - Circle details | تفاصيل الحلقة
- `GET /api/circles/{id}/students` - Circle students | طلاب الحلقة

#### Attendance | الحضور
- `POST /api/attendance` - Record attendance | تسجيل الحضور
- `POST /api/attendance/bulk` - Bulk attendance | التحضير الجماعي
- `GET /api/attendance/today` - Today's attendance | حضور اليوم

#### Authentication | المصادقة
- `POST /api/auth/teacher/login` - Teacher login | دخول المعلم
- `POST /api/auth/student/login` - Student login | دخول الطالب
- `POST /api/auth/logout` - Logout | تسجيل الخروج

---

## Translation Notes | ملاحظات الترجمة

### Field Mapping | تخطيط الحقول
| Arabic | English |
|--------|---------|
| نجح | success |
| رسالة | message |
| البيانات | data |
| الاسم | name |
| المعلم | teacher |
| الطالب | student |
| المسجد | mosque |
| الحلقة | circle |
| الحضور | attendance |
| الغياب | absence |
| متأخر | late |
| مستأذن | excused |
| حاضر | present |
| غائب | absent |

### Status Values | قيم الحالة
| Arabic | English |
|--------|---------|
| حاضر | present |
| غائب | absent |
| متأخر | late |
| مستأذن | excused |
| نشط | active |
| غير نشط | inactive |

### Response Format | تنسيق الاستجابة

#### Arabic Format
```json
{
    "نجح": true,
    "رسالة": "تم جلب البيانات بنجاح",
    "البيانات": {}
}
```

#### English Format
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": {}
}
```

---

## Usage Examples | أمثلة الاستخدام

### JavaScript/TypeScript
```javascript
// Arabic API response
const arabicResponse = await fetch('/api/teachers');
const arabicData = await arabicResponse.json();
console.log(arabicData.البيانات); // Arabic field

// Using the mapping for English
const teachers = arabicData.البيانات; // Arabic API
const englishFormat = {
    success: arabicData.نجح,
    message: arabicData.رسالة,
    data: teachers
};
```

### PHP
```php
// Arabic API response
$response = file_get_contents('/api/teachers');
$data = json_decode($response, true);

// Access Arabic fields
$teachers = $data['البيانات'];
$success = $data['نجح'];
$message = $data['رسالة'];
```

### Python
```python
import requests

# Arabic API response
response = requests.get('/api/teachers')
data = response.json()

# Access Arabic fields
teachers = data['البيانات']
success = data['نجح']
message = data['رسالة']
```

---

## Integration Guide | دليل التكامل

### 1. Setup Authentication | إعداد المصادقة
```bash
# Login to get token
curl -X POST "/api/auth/teacher/login" \
  -H "Content-Type: application/json" \
  -d '{"identity_number": "1234567890", "password": "password"}'
```

### 2. Make Authenticated Requests | الطلبات المصادقة
```bash
# Use token in subsequent requests
curl -H "Authorization: Bearer YOUR_TOKEN" "/api/teachers"
```

### 3. Handle Responses | معالجة الاستجابات
```javascript
const response = await fetch('/api/teachers', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

const data = await response.json();

if (data.نجح) { // success in Arabic
    console.log('Success:', data.البيانات); // data in Arabic
} else {
    console.error('Error:', data.رسالة); // message in Arabic
}
```

---

## Support | الدعم

### Arabic Support | الدعم العربي
- استخدم الملفات العربية للحصول على توثيق مفصل باللغة العربية
- جميع استجابات API باللغة العربية
- الحقول والرسائل باللغة العربية

### English Support | الدعم الإنجليزي
- Use English files for detailed documentation in English
- Field mapping provided for translation
- Examples available in both languages

### Contact | التواصل
- **Issues**: Create an issue in the repository
- **Documentation**: Refer to the specific documentation files
- **Development Team**: Contact for technical support

---

## Version Information | معلومات الإصدار

- **Current Version**: 1.0.0
- **Last Updated**: June 8, 2025
- **API Version**: v1
- **Languages**: Arabic (Primary), English (Translation)
