// اختبار شامل لنظام التحضير
const testAttendanceSystem = async () => {
  console.log('=== اختبار شامل لنظام التحضير ===');
  
  const API_BASE_URL = 'http://localhost:8000/api';
  
  // أولاً: إضافة بعض الطلاب التجريبيين
  console.log('1. إضافة طلاب تجريبيين...');
  
  const testStudents = [
    { name: 'عبدالله محمد أحمد', age: 16, phone: '966501234567', guardian_phone: '966501234568', address: 'الرياض' },
    { name: 'محمد علي سالم', age: 15, phone: '966501234569', guardian_phone: '966501234570', address: 'جدة' },
    { name: 'أحمد عبدالرحمن', age: 17, phone: '966501234571', guardian_phone: '966501234572', address: 'الدمام' },
    { name: 'يوسف خالد محمد', age: 16, phone: '966501234573', guardian_phone: '966501234574', address: 'المدينة' }
  ];
  
  const createdStudents = [];
  
  for (const studentData of testStudents) {
    try {
      console.log(`إضافة الطالب: ${studentData.name}...`);
      
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(studentData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ تم إضافة الطالب: ${studentData.name}`);
        createdStudents.push({
          id: result.data?.id || result.id,
          name: studentData.name,
          data: result
        });
      } else {
        const error = await response.text();
        console.log(`⚠️ تخطي الطالب ${studentData.name} (ربما موجود مسبقاً): ${error}`);
        // نضيف الطالب للقائمة حتى لو كان موجوداً
        createdStudents.push({
          id: null,
          name: studentData.name,
          data: null
        });
      }
    } catch (error) {
      console.error(`❌ خطأ في إضافة الطالب ${studentData.name}:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`تم إضافة/التحقق من ${createdStudents.length} طلاب`);
  
  // ثانياً: جلب قائمة الطلاب من قاعدة البيانات
  console.log('\n2. جلب قائمة الطلاب من قاعدة البيانات...');
  
  let actualStudents = [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ تم جلب قائمة الطلاب بنجاح');
      
      // استخراج الطلاب
      let students = data.data || data;
      if (Array.isArray(students)) {
        actualStudents = students.slice(0, 4); // نأخذ أول 4 طلاب
        console.log(`تم العثور على ${students.length} طلاب، سيتم اختبار أول 4:`);
        actualStudents.forEach((student, index) => {
          console.log(`${index + 1}. ${student.name || student.الاسم} (ID: ${student.id})`);
        });
      }
    } else {
      console.error('فشل في جلب الطلاب:', response.status);
    }
  } catch (error) {
    console.error('خطأ في جلب الطلاب:', error.message);
  }
  
  // إذا لم نجد طلاب، نستخدم الأسماء المضافة
  if (actualStudents.length === 0) {
    console.log('استخدام أسماء الطلاب المضافة...');
    actualStudents = createdStudents.map(student => ({ name: student.name }));
  }
  
  if (actualStudents.length === 0) {
    console.error('❌ لا توجد طلاب للاختبار');
    return;
  }
  
  // ثالثاً: اختبار تحضير الطلاب
  console.log('\n3. اختبار تحضير الطلاب...');
  
  const statuses = ['present', 'late', 'excused', 'absent'];
  const arabicStatuses = ['حاضر', 'متأخر', 'مستأذن', 'غائب'];
  
  let successCount = 0;
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0];
  
  for (let i = 0; i < actualStudents.length; i++) {
    const student = actualStudents[i];
    const status = statuses[i % statuses.length];
    const arabicStatus = arabicStatuses[i % arabicStatuses.length];
    
    try {
      const attendanceData = {
        student_name: student.name || student.الاسم,
        date: today,
        status: status,
        period: 'العصر',
        time: currentTime,
        notes: `اختبار تحضير - ${arabicStatus}`
      };
      
      console.log(`إرسال تحضير ${student.name || student.الاسم} - ${arabicStatus}...`);
      
      const response = await fetch(`${API_BASE_URL}/attendance/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ نجح التحضير: ${JSON.stringify(result)}`);
        successCount++;
      } else {
        const error = await response.text();
        console.error(`❌ فشل التحضير: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error(`❌ خطأ في التحضير:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n=== نتائج التحضير ===`);
  console.log(`نجح: ${successCount}/${actualStudents.length}`);
  console.log(`فشل: ${actualStudents.length - successCount}/${actualStudents.length}`);
  
  // رابعاً: اختبار جلب بيانات التحضير
  if (successCount > 0) {
    console.log('\n4. اختبار جلب بيانات التحضير...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/records?date=${today}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ تم جلب بيانات التحضير بنجاح');
        
        const records = data.data || data;
        if (Array.isArray(records)) {
          console.log(`عدد سجلات التحضير: ${records.length}`);
          
          if (records.length > 0) {
            console.log('\nآخر 3 سجلات تحضير:');
            records.slice(-3).forEach((record, index) => {
              console.log(`${index + 1}. ${record.student_name} - ${record.status} (${record.time || 'بدون وقت'})`);
            });
          }
        }
      } else {
        const error = await response.text();
        console.error(`❌ فشل في جلب بيانات التحضير: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات التحضير:', error.message);
    }
  }
  
  console.log('\n=== انتهى الاختبار ===');
};

// تشغيل الاختبار
console.log('بدء اختبار شامل لنظام التحضير...\n');
testAttendanceSystem().catch(console.error);
