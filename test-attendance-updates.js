import https from 'https';

// اختبار تحديثات الحضور لطالب معين
async function testAttendanceUpdate(studentName, newStatus) {
  console.log(`\n🧪 اختبار تسجيل ${newStatus} للطالب: ${studentName}`);
  
  // 1. أولاً: تسجيل الحضور الجديد
  const attendanceData = {
    student_name: studentName,
    date: new Date().toISOString().split('T')[0],
    status: newStatus,
    period: 'العصر',
    notes: `اختبار تسجيل ${newStatus}`
  };

  console.log('📝 بيانات الحضور المرسلة:', JSON.stringify(attendanceData, null, 2));

  try {
    // إرسال بيانات الحضور
    const postResponse = await makeRequest('POST', '/attendance/record', attendanceData);
    console.log('✅ تم تسجيل الحضور:', postResponse);

    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 500));

    // 2. ثانياً: جلب البيانات المحدثة
    console.log('\n🔄 جلب البيانات المحدثة...');
    const getResponse = await makeRequest('GET', '/attendance/records?date=' + attendanceData.date);
    
    console.log('📊 البيانات المحدثة:', JSON.stringify(getResponse, null, 2));

    // 3. التحقق من التحديث
    if (getResponse && getResponse.data && Array.isArray(getResponse.data)) {
      const studentRecord = getResponse.data.find(record => 
        record.student && record.student.name === studentName
      );
      
      if (studentRecord) {
        console.log(`✅ تم العثور على سجل محدث للطالب ${studentName}:`);
        console.log(`   الحالة: ${studentRecord.status}`);
        console.log(`   التاريخ: ${studentRecord.date}`);
        console.log(`   الوقت: ${studentRecord.time || 'غير محدد'}`);
        
        if (studentRecord.status === newStatus) {
          console.log('🎉 التحديث تم بنجاح!');
        } else {
          console.log(`⚠️ التحديث لم يتم كما متوقع. متوقع: ${newStatus}, فعلي: ${studentRecord.status}`);
        }
      } else {
        console.log(`❌ لم يتم العثور على سجل للطالب ${studentName}`);
      }
    } else {
      console.log('❌ تنسيق البيانات غير متوقع');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار التحديث:', error.message);
  }
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// تشغيل الاختبارات
async function runTests() {
  console.log('🚀 بدء اختبار تحديثات الحضور...\n');
  
  // اختبار تغيير حالة أحمد علي البارقي
  await testAttendanceUpdate('أحمد علي البارقي', 'present');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // اختبار تغيير حالة خالد حسن
  await testAttendanceUpdate('خالد حسن', 'absent');
  
  console.log('\n✅ انتهى الاختبار');
}

runTests().catch(console.error);
