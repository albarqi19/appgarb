// اختبار نظام التحضير مع البيانات الحقيقية
async function testRealAttendance() {
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  
  console.log('=== اختبار نظام التحضير بعد إصلاح الخادم ===');
  
  const today = new Date().toISOString().split('T')[0];
  const teacherId = '1';
  const mosqueId = '2';
  
  try {
    // 1. أولاً، جلب طلاب المعلم الحقيقيين
    console.log('\n1. جلب طلاب المعلم الحقيقيين...');
    const studentsUrl = `${API_BASE_URL}/teachers/${teacherId}/mosques/${mosqueId}/students`;
    console.log('📞 طلب إلى:', studentsUrl);
    
    const studentsResponse = await fetch(studentsUrl);
    const studentsData = await studentsResponse.json();
    console.log('👥 طلاب المعلم:', JSON.stringify(studentsData, null, 2));
    
    if (!studentsData.success || !studentsData.data || studentsData.data.length === 0) {
      console.log('❌ لا توجد طلاب للمعلم في هذا المسجد');
      return;
    }
    
    const students = studentsData.data;
    console.log(`✅ تم العثور على ${students.length} طالب`);
    
    // 2. إرسال تحضير للطلاب الحقيقيين
    console.log('\n2. إرسال تحضير للطلاب...');
    for (const student of students) {
      try {
        const attendanceData = {
          student_name: student.name,
          status: 'حاضر',
          date: today,
          teacher_id: teacherId,
          mosque_id: mosqueId,
          notes: 'اختبار بعد إصلاح الخادم'
        };
        
        console.log(`📝 إرسال تحضير ${student.name}...`);
        const response = await fetch(`${API_BASE_URL}/attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(attendanceData)
        });
        
        const result = await response.json();
        if (response.ok) {
          console.log(`✅ تم تحضير ${student.name} بنجاح`);
        } else {
          console.log(`❌ فشل تحضير ${student.name}:`, result);
        }
      } catch (error) {
        console.log(`❌ خطأ في تحضير ${student.name}:`, error.message);
      }
    }
    
    // 3. اختبار جلب بيانات التحضير مع الفلترة
    console.log('\n3. اختبار جلب بيانات التحضير مع الفلترة...');
    
    // بدون فلترة
    console.log('\n--- بدون فلترة ---');
    const url1 = `${API_BASE_URL}/attendance/records?date=${today}`;
    console.log('📞 طلب إلى:', url1);
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    console.log('📥 عدد السجلات:', data1.data?.data?.length || 0);
    
    // مع فلترة المعلم والمسجد
    console.log('\n--- مع فلترة المعلم والمسجد ---');
    const url2 = `${API_BASE_URL}/attendance/records?date=${today}&teacher_id=${teacherId}&mosque_id=${mosqueId}`;
    console.log('📞 طلب إلى:', url2);
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    console.log('📥 عدد السجلات:', data2.data?.data?.length || 0);
    console.log('📋 السجلات:', JSON.stringify(data2, null, 2));
    
    // 4. مقارنة النتائج
    const unfilteredCount = data1.data?.data?.length || 0;
    const filteredCount = data2.data?.data?.length || 0;
    
    console.log('\n=== تحليل النتائج ===');
    console.log(`📊 بدون فلترة: ${unfilteredCount} سجل`);
    console.log(`🔍 مع فلترة: ${filteredCount} سجل`);
    
    if (filteredCount < unfilteredCount) {
      console.log('✅ الفلترة تعمل بشكل صحيح! عدد السجلات المفلترة أقل');
    } else if (filteredCount === unfilteredCount && filteredCount === students.length) {
      console.log('✅ الفلترة تعمل - عدد السجلات يطابق عدد طلاب المعلم');
    } else {
      console.log('❌ قد تكون هناك مشكلة في الفلترة');
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

testRealAttendance().catch(console.error);
