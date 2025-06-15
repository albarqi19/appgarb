// اختبار API الحضور الجديد لليوم الحالي
console.log('🧪 اختبار API الحضور الجديد...');

const API_BASE_URL = 'http://localhost:8000/api';
const today = new Date().toISOString().split('T')[0];

// بيانات الاختبار
const testCases = [
  { mosqueId: 1, teacherId: 1, description: 'مسجد 1 - معلم 1' },
  { mosqueId: 2, teacherId: 1, description: 'مسجد 2 - معلم 1' }
];

console.log(`📅 تاريخ اليوم: ${today}`);
console.log('🎯 اختبار Endpoints:');

// اختبار كل حالة
for (const testCase of testCases) {
  console.log(`\n🔍 ${testCase.description}`);
  
  // الـ API الجديد
  const newApiUrl = `${API_BASE_URL}/mosques/${testCase.mosqueId}/attendance-today?teacher_id=${testCase.teacherId}`;
  console.log(`📡 الرابط الجديد: ${newApiUrl}`);
  
  try {
    const response = await fetch(newApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    console.log(`📊 حالة الاستجابة: ${response.status}`);
    console.log(`📋 نوع المحتوى: ${response.headers.get('content-type')}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ استجابة ناجحة:', JSON.stringify(data, null, 2));
      
      // تحليل البيانات
      if (data.success) {
        const attendanceData = data.data || data.attendance || data;
        const studentsCount = Object.keys(attendanceData).length;
        console.log(`👥 عدد الطلاب: ${studentsCount}`);
        
        if (studentsCount > 0) {
          console.log('📝 بيانات الحضور:');
          Object.entries(attendanceData).forEach(([studentName, status]) => {
            console.log(`  - ${studentName}: ${status}`);
          });
        } else {
          console.log('⚠️ لا توجد بيانات حضور لهذا المعلم/المسجد');
        }
      } else {
        console.log('❌ فشل العملية:', data.message || 'رسالة غير محددة');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ خطأ في الاستجابة:', errorText);
    }
    
  } catch (error) {
    console.error('💥 خطأ في الاتصال:', error.message);
  }
  
  // مقارنة مع API القديم
  console.log('\n🔄 مقارنة مع API القديم...');
  const oldApiUrl = `${API_BASE_URL}/attendance/records?date=${today}&teacher_id=${testCase.teacherId}&mosque_id=${testCase.mosqueId}`;
  
  try {
    const oldResponse = await fetch(oldApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (oldResponse.ok) {
      const oldData = await oldResponse.json();
      
      // حساب عدد السجلات الصالحة
      let validRecords = 0;
      const records = oldData.attendance_records || oldData.data || [];
      
      if (Array.isArray(records)) {
        validRecords = records.filter(record => {
          const recordDate = record.date || record.attendance_date;
          return recordDate && recordDate.includes(today);
        }).length;
      }
      
      console.log(`📊 API القديم: ${records.length} سجل كامل، ${validRecords} سجل لليوم`);
    } else {
      console.log('❌ فشل في API القديم');
    }
    
  } catch (error) {
    console.error('💥 خطأ في API القديم:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
}

console.log('\n✅ انتهى الاختبار!');
