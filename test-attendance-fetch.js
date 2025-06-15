// اختبار جلب بيانات التحضير مع الفلترة
import fetch from 'node-fetch';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testAttendanceFetch() {
  console.log('🔍 اختبار جلب بيانات التحضير مع الفلترة');
  
  const today = new Date().toISOString().split('T')[0];
  const teacherId = '1';
  const mosqueId = '2';
  
  // اختبار 1: بدون فلترة
  console.log('\n=== اختبار 1: بدون فلترة ===');
  try {
    const url1 = `${API_BASE_URL}/attendance/records?date=${today}`;
    console.log('📞 طلب إلى:', url1);
    const response1 = await fetch(url1);
    const data1 = await response1.json();
    console.log('📥 النتيجة:', JSON.stringify(data1, null, 2));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  // اختبار 2: مع فلترة المعلم فقط
  console.log('\n=== اختبار 2: مع فلترة المعلم فقط ===');
  try {
    const url2 = `${API_BASE_URL}/attendance/records?date=${today}&teacher_id=${teacherId}`;
    console.log('📞 طلب إلى:', url2);
    const response2 = await fetch(url2);
    const data2 = await response2.json();
    console.log('📥 النتيجة:', JSON.stringify(data2, null, 2));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  // اختبار 3: مع فلترة المسجد فقط  
  console.log('\n=== اختبار 3: مع فلترة المسجد فقط ===');
  try {
    const url3 = `${API_BASE_URL}/attendance/records?date=${today}&mosque_id=${mosqueId}`;
    console.log('📞 طلب إلى:', url3);
    const response3 = await fetch(url3);
    const data3 = await response3.json();
    console.log('📥 النتيجة:', JSON.stringify(data3, null, 2));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  // اختبار 4: مع فلترة المعلم والمسجد معاً
  console.log('\n=== اختبار 4: مع فلترة المعلم والمسجد معاً ===');
  try {
    const url4 = `${API_BASE_URL}/attendance/records?date=${today}&teacher_id=${teacherId}&mosque_id=${mosqueId}`;
    console.log('📞 طلب إلى:', url4);
    const response4 = await fetch(url4);
    const data4 = await response4.json();
    console.log('📥 النتيجة:', JSON.stringify(data4, null, 2));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
  
  // اختبار 5: فحص طلاب المعلم في المسجد
  console.log('\n=== اختبار 5: فحص طلاب المعلم في المسجد ===');
  try {
    const url5 = `${API_BASE_URL}/teachers/${teacherId}/mosques/${mosqueId}/students`;
    console.log('📞 طلب إلى:', url5);
    const response5 = await fetch(url5);
    const data5 = await response5.json();
    console.log('👥 طلاب المعلم في المسجد:', JSON.stringify(data5, null, 2));
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testAttendanceFetch().catch(console.error);
