// اختبار التحضير للطلاب الحقيقيين
async function testRealStudents() {
  console.log('=== اختبار الطلاب الحقيقيين ===');
  
  const testData = {
    'خالد حسن': 'حاضر',
    'أحمد علي البارقي': 'متأخر'
  };
  
  for (const [studentName, status] of Object.entries(testData)) {
    console.log(`إرسال تحضير ${studentName} - ${status}...`);
    
    try {
      const attendanceData = {
        student_name: studentName,
        date: new Date().toISOString().split('T')[0],
        status: status === 'حاضر' ? 'present' : 'late',
        period: 'العصر',
        notes: `تحضير ${status}`
      };
      
      const response = await fetch('http://127.0.0.1:8000/api/attendance/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(attendanceData)
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`✅ نجح تحضير ${studentName}: ${response.status} - ${responseText}`);
      } else {
        console.log(`❌ فشل تحضير ${studentName}: ${response.status} - ${responseText}`);
      }
      
    } catch (error) {
      console.log(`💥 خطأ في تحضير ${studentName}: ${error.message}`);
    }
    
    // انتظار قصير بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // الآن اختبار جلب البيانات
  console.log('\n=== اختبار جلب البيانات ===');
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/attendance/records?date=${new Date().toISOString().split('T')[0]}`);
    const data = await response.json();
    
    console.log('📥 بيانات التحضير لليوم:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('💥 خطأ في جلب البيانات:', error.message);
  }
}

testRealStudents();
