import https from 'https';

// محاكاة الاستجابة من API
const mockApiResponse = {
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 7,
        "status": "غائب",
        "student": {
          "id": 3,
          "name": "سعدون"
        }
      },
      {
        "id": 6,
        "status": "متأخر",
        "student": {
          "id": 2,
          "name": "خالد حسن"
        }
      },
      {
        "id": 5,
        "status": "غائب",
        "student": {
          "id": 1,
          "name": "أحمد علي البارقي"
        }
      }
    ]
  }
};

// تحويل حالة الحضور من الإنجليزية إلى العربية
const convertStatusToArabic = (englishStatus) => {
  const cleanStatus = englishStatus?.toString().toLowerCase().trim();
  
  switch (cleanStatus) {
    case 'present': return 'حاضر';
    case 'absent': return 'غائب';
    case 'late': return 'متأخر';
    case 'excused': return 'مستأذن';
    case 'حاضر': return 'حاضر';
    case 'غائب': return 'غائب';
    case 'متأخر': return 'متأخر';
    case 'مستأذن': return 'مستأذن';
    default: 
      console.warn(`حالة غير معروفة: ${englishStatus}`);
      return 'حاضر';
  }
};

// محاكاة معالجة البيانات
function parseAttendanceData(data) {
  console.log('البيانات المستلمة:', JSON.stringify(data, null, 2));
  
  const attendanceMap = {};
  let records = null;
  
  // البحث عن البيانات في هيكل مختلف
  if (data.attendance_records && Array.isArray(data.attendance_records)) {
    records = data.attendance_records;
  } else if (data.البيانات && Array.isArray(data.البيانات)) {
    records = data.البيانات;
  } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
    // Laravel pagination response format
    records = data.data.data;
  } else if (data.data && Array.isArray(data.data)) {
    records = data.data;
  } else if (Array.isArray(data)) {
    records = data;
  }
  
  console.log('السجلات المستخرجة:', records);
  console.log('عدد السجلات:', records ? records.length : 0);
  
  if (records && Array.isArray(records)) {
    records.forEach((record, index) => {
      console.log(`معالجة سجل ${index + 1}:`, record);
      if (record && typeof record === 'object') {
        // التعامل مع أسماء مختلفة للحقول
        let studentName = record.student_name || record.name || record.اسم_الطالب;
        
        // إذا لم نجد الاسم مباشرة، ابحث في record.student
        if (!studentName && record.student && typeof record.student === 'object') {
          studentName = record.student.name || record.student.اسم || record.student.student_name;
        }
        
        const status = record.status || record.الحالة || record.attendance_status;
        
        if (studentName && status) {
          attendanceMap[studentName] = convertStatusToArabic(status);
          console.log(`✅ تم تحديد حضور ${studentName}: ${status} -> ${attendanceMap[studentName]}`);
        } else {
          console.warn('❌ لم يتم العثور على اسم الطالب أو الحالة في السجل:', record);
        }
      }
    });
  } else {
    console.warn('⚠️ تنسيق البيانات غير مدعوم:', data);
  }
  
  console.log('\n=== النتيجة النهائية ===');
  console.log('خريطة الحضور:', attendanceMap);
  console.log('عدد الطلاب:', Object.keys(attendanceMap).length);
  
  return attendanceMap;
}

// اختبار المعالجة
console.log('=== اختبار معالجة بيانات الحضور ===\n');
parseAttendanceData(mockApiResponse);

// اختبار مع API حقيقي
console.log('\n=== اختبار مع API حقيقي ===\n');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: `/api/attendance/records?date=${new Date().toISOString().split('T')[0]}`,
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  },
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('استجابة API:');
      parseAttendanceData(parsed);
    } catch (e) {
      console.log('فشل في تحليل JSON:', e.message);
      console.log('البيانات الخام:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('خطأ في الطلب:', e.message);
});

req.end();
