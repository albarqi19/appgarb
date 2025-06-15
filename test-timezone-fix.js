// اختبار إصلاح المنطقة الزمنية
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// تحقق من التاريخ بنفس طريقة الكود الجديد
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return '';
  
  // إذا كان التاريخ يحتوي على وقت وأوفست منطقة زمنية
  if (dateStr.includes('T')) {
    // تحويل التاريخ للمنطقة الزمنية المحلية ثم استخراج التاريخ فقط
    const localDate = new Date(dateStr);
    
    // تحويل للمنطقة الزمنية السعودية (UTC+3)
    const saudiOffset = 3 * 60; // 3 ساعات بالدقائق
    const saudiTime = new Date(localDate.getTime() + (saudiOffset * 60 * 1000));
    
    return saudiTime.toISOString().split('T')[0];
  }
  
  return dateStr.split('T')[0]; // إزالة الوقت والمنطقة الزمنية
};

const isDateToday = (dateStr) => {
  if (!dateStr) return false;
  const normalizedDate = normalizeDate(dateStr);
  const today = getTodayDate();
  
  console.log(`🕒 مقارنة التواريخ: ${dateStr} -> ${normalizedDate} vs ${today}`);
  
  return normalizedDate === today;
};

async function testTimezonefix() {
  console.log('=== بدء اختبار إصلاح المنطقة الزمنية ===');
  
  try {
    console.log('تاريخ اليوم:', getTodayDate());
    
    console.log('جلب البيانات من API...');
    // جلب البيانات من API
    const response = await fetch(`${API_BASE_URL}/attendance/records?date=2025-06-08`);
    console.log('استجابة HTTP:', response.status);
    
    const data = await response.json();
    console.log('تم تحليل JSON');
    
    console.log('\n📥 استجابة API:');
    console.log('نوع البيانات:', typeof data);
    console.log('مفاتيح البيانات:', Object.keys(data));
    console.log('عدد السجلات:', data.data?.data?.length || 0);
    
    if (data.data?.data) {
      console.log('\nمعالجة السجلات...');
      data.data.data.forEach((record, index) => {
        const originalDate = record.date;
        const isToday = isDateToday(originalDate);
        console.log(`\n📋 سجل ${index + 1}: ${record.student?.name}`);
        console.log(`   التاريخ الأصلي: ${originalDate}`);
        console.log(`   هل هو اليوم؟ ${isToday ? '✅ نعم' : '❌ لا'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على سجلات');
    }
    
    console.log('\n=== انتهى الاختبار ===');
    
  } catch (error) {
    console.error('💥 خطأ:', error.message);
    console.error('تفاصيل الخطأ:', error);
  }
}

testTimezonefix();
