// اختبار مسار تسجيل الدخول الصحيح للمعلم
import fetch from 'node-fetch';

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

async function testCorrectTeacherLogin() {
  console.log('🧪 اختبار مسار تسجيل الدخول الصحيح للمعلم...');
  
  // اختبار /auth/teacher/login
  const credentials = {
    identity_number: "1074554773",
    password: "123456"
  };
  
  try {
    console.log('\n1️⃣ اختبار /auth/teacher/login...');
    console.log('البيانات المرسلة:', credentials);
    
    const response = await fetch(`${API_BASE_URL}/auth/teacher/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.text();
    console.log(`استجابة الخادم (${response.status}):`, result);
    
    if (response.ok) {
      const data = JSON.parse(result);
      if (data.success && data.data) {
        console.log('✅ نجح تسجيل الدخول!');
        console.log(`معرف المعلم: ${data.data.user_id}`);
        console.log(`اسم المعلم: ${data.data.name}`);
        
        // الآن محاولة إنشاء جلسة بمعرف المعلم الصحيح
        return await testSessionCreation(data.data.user_id, data.data.token);
      }
    } else {
      console.log('❌ فشل تسجيل الدخول');
      
      // محاولة مع أوراق اعتماد مختلفة
      await tryOtherTeacherCredentials();
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    
    // محاولة مع أوراق اعتماد مختلفة
    await tryOtherTeacherCredentials();
  }
}

async function tryOtherTeacherCredentials() {
  console.log('\n2️⃣ محاولة أوراق اعتماد مختلفة...');
  
  const allCredentials = [
    { identity_number: "1234567890", password: "123456" },
    { identity_number: "1234567891", password: "test123" },
    { identity_number: "3234567891", password: "test123" },
    { identity_number: "2234567890", password: "123456" },
    { identity_number: "1074554772", password: "123456" }, // من قائمة المعلمين
    { identity_number: "10745547735", password: "123456" }, // من قائمة المعلمين
  ];
  
  for (const cred of allCredentials) {
    try {
      console.log(`🧪 اختبار: ${cred.identity_number}`);
      
      const response = await fetch(`${API_BASE_URL}/auth/teacher/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cred)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log(`✅ نجح مع ${cred.identity_number}!`);
          console.log(`معرف المعلم: ${data.data.user_id}`);
          return await testSessionCreation(data.data.user_id, data.data.token);
        }
      } else {
        const errorText = await response.text();
        if (response.status === 401) {
          console.log(`🔐 ${cred.identity_number}: كلمة مرور خاطئة`);
        } else if (response.status === 404) {
          console.log(`❌ ${cred.identity_number}: مستخدم غير موجود`);
        } else {
          console.log(`⚠️ ${cred.identity_number}: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      }
    } catch (error) {
      console.log(`❌ خطأ مع ${cred.identity_number}: ${error.message}`);
    }
  }
  
  console.log('\n❌ لم ينجح أي من أوراق الاعتماد المجربة');
}

async function testSessionCreation(teacherId, token) {
  console.log(`\n3️⃣ اختبار إنشاء جلسة مع teacher_id: ${teacherId}...`);
  
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
    teacher_notes: "اختبار مع معرف معلم صحيح"
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/recitation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` // إضافة token للمصادقة
      },
      body: JSON.stringify(sessionData)
    });
    
    const result = await response.text();
    console.log(`استجابة إنشاء الجلسة (${response.status}):`, result);
    
    if (response.ok) {
      console.log('✅ تم إنشاء الجلسة بنجاح!');
      return true;
    } else {
      console.log('❌ فشل في إنشاء الجلسة');
      try {
        const errorData = JSON.parse(result);
        if (errorData.errors) {
          console.log('أخطاء:', errorData.errors);
        }
      } catch (e) {
        // تجاهل خطأ parsing
      }
      return false;
    }
  } catch (error) {
    console.log('❌ خطأ في إنشاء الجلسة:', error.message);
    return false;
  }
}

// تشغيل الاختبار
testCorrectTeacherLogin();
