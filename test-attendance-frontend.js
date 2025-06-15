// اختبار نظام التحضير من Frontend
const testAttendanceAPI = async () => {
  console.log('=== اختبار نظام التحضير الجديد ===');
  
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  
  // أولاً، جلب قائمة الطلاب الحقيقية من API
  console.log('1. جلب قائمة الطلاب الحقيقية...');
  
  let realStudents = [];
  
  try {
    // جلب الطلاب من API
    const studentsResponse = await fetch(`${API_BASE_URL}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('بيانات الطلاب المستلمة:', studentsData);
      
      // استخراج الطلاب من الاستجابة
      const students = studentsData.البيانات || studentsData.data || studentsData;
      
      if (Array.isArray(students) && students.length > 0) {
        // أخذ أول 4 طلاب للاختبار
        realStudents = students.slice(0, 4).map((student, index) => {
          const statuses = ['حاضر', 'متأخر', 'مستأذن', 'غائب'];
          return {
            name: student.name || student.الاسم || `طالب ${student.id}`,
            status: statuses[index % 4]
          };
        });
        
        console.log('الطلاب الحقيقيون للاختبار:', realStudents);
      } else {
        console.warn('لم يتم العثور على طلاب في الاستجابة');
        console.log('محاولة استخدام أسماء افتراضية...');
        
        // استخدام أسماء افتراضية إذا لم نجد طلاب
        realStudents = [
          { name: 'أحمد محمد', status: 'حاضر' },
          { name: 'محمد علي', status: 'متأخر' }
        ];
      }
    } else {
      console.error('فشل في جلب قائمة الطلاب:', studentsResponse.status);
      // استخدام أسماء افتراضية
      realStudents = [
        { name: 'أحمد محمد', status: 'حاضر' },
        { name: 'محمد علي', status: 'متأخر' }
      ];
    }
  } catch (error) {
    console.error('خطأ في جلب الطلاب:', error);
    // استخدام أسماء افتراضية
    realStudents = [
      { name: 'أحمد محمد', status: 'حاضر' },
      { name: 'محمد علي', status: 'متأخر' }
    ];
  }
  
  if (realStudents.length === 0) {
    console.error('لا توجد طلاب للاختبار');
    return;
  }
  
  // تحويل الحالات إلى الإنجليزية
  const convertStatusToEnglish = (arabicStatus) => {
    switch (arabicStatus) {
      case 'حاضر': return 'present';
      case 'غائب': return 'absent';
      case 'متأخر': return 'late';
      case 'مستأذن': return 'excused';
      default: return 'present';
    }
  };
  
  console.log('\n2. اختبار إرسال التحضير للطلاب...');
  
  let successCount = 0;
  let totalCount = realStudents.length;
  
  for (const student of realStudents) {
    try {
      const attendanceData = {
        student_name: student.name,
        date: new Date().toISOString().split('T')[0],
        status: convertStatusToEnglish(student.status),
        period: 'العصر',
        notes: `اختبار تحضير ${student.status}`
      };
      
      console.log(`إرسال تحضير ${student.name} - ${student.status}...`);
      
      const response = await fetch(`${API_BASE_URL}/attendance/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ نجح تحضير ${student.name}: ${JSON.stringify(result)}`);
        successCount++;
      } else {
        const error = await response.text();
        console.error(`❌ فشل تحضير ${student.name}: ${response.status} - ${error}`);
      }
      
    } catch (error) {
      console.error(`❌ خطأ في تحضير ${student.name}:`, error.message);
    }
    
    // انتظار قصير بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== ملخص النتائج ===');
  console.log(`نجح: ${successCount}/${totalCount}`);
  console.log(`فشل: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 جميع الطلاب تم تحضيرهم بنجاح!');
  } else if (successCount > 0) {
    console.log('⚠️ بعض الطلاب تم تحضيرهم');
  } else {
    console.log('❌ فشل في تحضير جميع الطلاب');
  }
  
  // 3. اختبار جلب بيانات التحضير
  if (successCount > 0) {
    console.log('\n3. اختبار جلب بيانات التحضير...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/records?date=${today}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        console.log('✅ تم جلب بيانات التحضير بنجاح');
        console.log('بيانات التحضير:', JSON.stringify(attendanceData, null, 2));
      } else {
        console.error('❌ فشل في جلب بيانات التحضير:', attendanceResponse.status);
      }
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات التحضير:', error);
    }
  }
};

// تشغيل الاختبار
testAttendanceAPI().catch(console.error);
