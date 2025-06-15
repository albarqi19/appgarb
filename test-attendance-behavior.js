// اختبار سلوك التحضير: هل ينشئ سجل جديد أم يعدل الموجود؟

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testAttendanceBehavior() {
  console.log('🧪 اختبار سلوك التحضير: إنشاء سجل جديد أم تعديل الموجود؟');
  console.log('='.repeat(80));
  
  const today = new Date().toISOString().split('T')[0];
  const teacherId = '1';
  const mosqueId = '2';
  const studentName = 'سعدون';
  
  try {
    // 🔍 خطوة 1: جلب الحالة الحالية
    console.log('\n📋 خطوة 1: جلب الحالة الحالية للطالب');
    console.log('-'.repeat(50));
    
    const currentUrl = `${API_BASE_URL}/attendance/records?date=${today}&teacher_id=${teacherId}&mosque_id=${mosqueId}`;
    console.log('🔗 URL:', currentUrl);
    
    const currentResponse = await fetch(currentUrl);
    const currentData = await currentResponse.json();
    
    console.log('📥 البيانات الحالية:', JSON.stringify(currentData, null, 2));
    
    // استخراج الحالة الحالية للطالب
    let currentStatus = 'غائب'; // افتراضي
    if (currentData.success && currentData.data && currentData.data.data) {
      const records = currentData.data.data;
      const studentRecord = records.find(record => 
        (record.student_name || record.name || record.اسم_الطالب) === studentName
      );
      if (studentRecord) {
        currentStatus = studentRecord.status || studentRecord.الحالة || studentRecord.attendance_status || 'غائب';
      }
    }
    
    console.log(`👤 الحالة الحالية للطالب "${studentName}": ${currentStatus}`);
    
    // 🔄 خطوة 2: تحديد الحالة الجديدة (عكس الحالة الحالية)
    console.log('\n🔄 خطوة 2: تحديد الحالة الجديدة');
    console.log('-'.repeat(50));
    
    let newStatus;
    switch(currentStatus) {
      case 'حاضر': newStatus = 'متأخر'; break;
      case 'متأخر': newStatus = 'حاضر'; break;
      case 'مستأذن': newStatus = 'حاضر'; break;
      default: newStatus = 'حاضر'; break;
    }
    
    console.log(`🎯 الحالة الجديدة المطلوبة: ${currentStatus} → ${newStatus}`);
    
    // 📊 خطوة 3: عد السجلات قبل التحديث
    console.log('\n📊 خطوة 3: عد السجلات قبل التحديث');
    console.log('-'.repeat(50));
    
    const recordsCountBefore = currentData.data?.data?.length || 0;
    console.log(`📈 عدد السجلات قبل التحديث: ${recordsCountBefore}`);
    
    // ✏️ خطوة 4: إرسال التحضير الجديد
    console.log('\n✏️ خطوة 4: إرسال التحضير الجديد');
    console.log('-'.repeat(50));
    
    const markUrl = `${API_BASE_URL}/attendance/mark`;
    const markData = {
      teacher_id: parseInt(teacherId),
      date: today,
      time: new Date().toTimeString().split(' ')[0],
      students: [{
        student_name: studentName,
        status: newStatus,
        notes: `اختبار تغيير من ${currentStatus} إلى ${newStatus} - ${new Date().toLocaleTimeString()}`
      }]
    };
    
    console.log('🔗 URL:', markUrl);
    console.log('📤 البيانات المرسلة:', JSON.stringify(markData, null, 2));
    
    const markResponse = await fetch(markUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(markData)
    });
    
    const markResult = await markResponse.json();
    console.log('📥 نتيجة التحديث:', JSON.stringify(markResult, null, 2));
    
    if (!markResponse.ok) {
      console.error('❌ فشل في تحديث التحضير');
      return;
    }
    
    // ⏱️ انتظار ثانية للتأكد من حفظ البيانات
    console.log('\n⏱️ انتظار ثانية واحدة...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 🔍 خطوة 5: جلب البيانات مرة أخرى للمقارنة
    console.log('\n🔍 خطوة 5: جلب البيانات بعد التحديث');
    console.log('-'.repeat(50));
    
    const afterResponse = await fetch(currentUrl);
    const afterData = await afterResponse.json();
    
    console.log('📥 البيانات بعد التحديث:', JSON.stringify(afterData, null, 2));
    
    // 📊 خطوة 6: تحليل النتائج
    console.log('\n📊 خطوة 6: تحليل النتائج');
    console.log('-'.repeat(50));
    
    const recordsCountAfter = afterData.data?.data?.length || 0;
    console.log(`📈 عدد السجلات بعد التحديث: ${recordsCountAfter}`);
    
    // العثور على سجل الطالب الجديد
    let updatedStatus = 'غير موجود';
    if (afterData.success && afterData.data && afterData.data.data) {
      const records = afterData.data.data;
      const studentRecord = records.find(record => 
        (record.student_name || record.name || record.اسم_الطالب) === studentName
      );
      if (studentRecord) {
        updatedStatus = studentRecord.status || studentRecord.الحالة || studentRecord.attendance_status || 'غير محدد';
      }
    }
    
    console.log(`👤 الحالة النهائية للطالب "${studentName}": ${updatedStatus}`);
    
    // 🎯 خطوة 7: الخلاصة والتحليل
    console.log('\n🎯 خطوة 7: الخلاصة والتحليل');
    console.log('='.repeat(80));
    
    if (recordsCountBefore === recordsCountAfter) {
      console.log('✅ السلوك: تم تعديل السجل الموجود (لم يتغير عدد السجلات)');
      console.log(`📝 تفاصيل: ${currentStatus} → ${updatedStatus}`);
    } else if (recordsCountAfter > recordsCountBefore) {
      console.log('➕ السلوك: تم إنشاء سجل جديد (زاد عدد السجلات)');
      console.log(`📝 تفاصيل: عدد السجلات ${recordsCountBefore} → ${recordsCountAfter}`);
    } else {
      console.log('❓ السلوك: غير متوقع (قل عدد السجلات)');
    }
    
    if (updatedStatus === newStatus) {
      console.log('✅ التحديث نجح: الحالة تغيرت كما هو مطلوب');
    } else {
      console.log('❌ التحديث فشل: الحالة لم تتغير كما هو مطلوب');
    }
    
  } catch (error) {
    console.error('💥 خطأ في الاختبار:', error);
  }
}

testAttendanceBehavior().catch(console.error);
