// فحص مشكلة teacher_id = 89
import fetch from 'node-fetch';

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

async function debugTeacherIssue() {
  try {
    console.log('🔍 فحص المشكلة مع teacher_id = 89...');
    
    // 1. محاولة إنشاء جلسة بنفس البيانات التي فشلت
    const sessionData = {
      student_id: 36,
      teacher_id: 89,
      quran_circle_id: 1,
      start_surah_number: 1,
      start_verse: 1,
      end_surah_number: 1,
      end_verse: 1,
      recitation_type: "حفظ",
      duration_minutes: 30,
      grade: 8.5,
      evaluation: "جيد جداً",
      teacher_notes: "جلسة جديدة - بدء التسميع"
    };

    console.log('📤 إرسال البيانات:', JSON.stringify(sessionData, null, 2));

    const response = await fetch(`${API_BASE_URL}/recitation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const responseText = await response.text();
    console.log(`📥 استجابة الخادم (${response.status}):`, responseText);

    if (!response.ok) {
      console.log('\n❌ فشل في إنشاء الجلسة - سبب المشكلة:');
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.errors && errorData.errors.teacher_id) {
          console.log('🔴 مشكلة في teacher_id:', errorData.errors.teacher_id);
          console.log('📊 البيانات المستلمة:', errorData.debug_info?.received_data);
          
          // محاولة إيجاد حل
          console.log('\n🔧 محاولة حلول مختلفة...');
          
          // حل 1: استخدام teacher_id = 1
          console.log('\n1️⃣ محاولة مع teacher_id = 1');
          await testWithTeacherId(1);
          
          // حل 2: استخدام teacher_id = 2  
          console.log('\n2️⃣ محاولة مع teacher_id = 2');
          await testWithTeacherId(2);
          
          // حل 3: فحص المعلمين المتاحين
          console.log('\n3️⃣ فحص المعلمين المتاحين...');
          await checkAvailableTeachers();
        }
      } catch (parseError) {
        console.log('خطأ في تحليل الاستجابة:', parseError.message);
      }
    } else {
      console.log('✅ تم إنشاء الجلسة بنجاح!');
    }

  } catch (error) {
    console.error('❌ خطأ في الفحص:', error.message);
  }
}

async function testWithTeacherId(teacherId) {
  try {
    const sessionData = {
      student_id: 36,
      teacher_id: teacherId,
      quran_circle_id: 1,
      start_surah_number: 1,
      start_verse: 1,
      end_surah_number: 1,
      end_verse: 1,
      recitation_type: "حفظ",
      duration_minutes: 30,
      grade: 8.5,
      evaluation: "جيد جداً",
      teacher_notes: `اختبار مع teacher_id = ${teacherId}`
    };

    const response = await fetch(`${API_BASE_URL}/recitation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ نجح مع teacher_id = ${teacherId}`);
      const data = JSON.parse(responseText);
      console.log('معرف الجلسة:', data.data?.session_id);
    } else {
      console.log(`❌ فشل مع teacher_id = ${teacherId}:`, response.status);
    }

  } catch (error) {
    console.log(`❌ خطأ مع teacher_id = ${teacherId}:`, error.message);
  }
}

async function checkAvailableTeachers() {
  try {
    // محاولة الحصول على قائمة المعلمين المتاحين
    const endpoints = [
      '/teachers',
      '/mosque/1/teachers', 
      '/users/teachers',
      '/auth/teachers'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`🔍 فحص ${endpoint}...`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}:`, JSON.stringify(data, null, 2));
          break;
        } else {
          console.log(`❌ ${endpoint}: ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ خطأ في ${endpoint}:`, err.message);
      }
    }
  } catch (error) {
    console.log('❌ خطأ في فحص المعلمين:', error.message);
  }
}

// تشغيل الفحص
debugTeacherIssue();
