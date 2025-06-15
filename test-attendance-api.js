// اختبار API التحضير
const testAttendanceAPI = async () => {
  const apiUrl = 'http://127.0.0.1:8000/api/attendance/record';
  
  // بيانات تجريبية للتحضير
  const testData = {
    teacherId: 1,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    students: [
      {
        studentId: 1,
        status: 'حاضر',
        notes: 'طالب مجتهد'
      },
      {
        studentId: 2,
        status: 'متأخر',
        notes: 'تأخر 10 دقائق'
      },
      {
        studentId: 3,
        status: 'غائب',
        notes: ''
      }
    ]
  };

  console.log('بيانات الاختبار:', JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('حالة الاستجابة:', response.status);
    console.log('رؤوس الاستجابة:', response.headers);

    const responseText = await response.text();
    console.log('نص الاستجابة:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('نجح الإرسال:', data);
    } else {
      console.error('فشل الإرسال - الحالة:', response.status);
      console.error('تفاصيل الخطأ:', responseText);
    }

  } catch (error) {
    console.error('خطأ في الشبكة:', error);
  }
};

// تشغيل الاختبار
testAttendanceAPI();
