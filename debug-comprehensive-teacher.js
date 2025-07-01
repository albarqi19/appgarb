// فحص شامل لمشكلة teacher_id في إنشاء الجلسات
import fetch from 'node-fetch';

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

async function comprehensiveTeacherTest() {
  try {
    console.log('🔍 فحص شامل لمشكلة teacher_id...');
    
    // 1. فحص جميع المعلمين المتاحين
    console.log('\n1️⃣ فحص المعلمين المتاحين...');
    const teachersResponse = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    if (teachersResponse.ok) {
      const teachersData = await teachersResponse.json();
      const teachers = teachersData.البيانات || [];
      console.log(`✅ عدد المعلمين المتاحين: ${teachers.length}`);
      
      // طباعة أول 5 معلمين فقط للوضوح
      console.log('📋 عينة من المعلمين:');
      teachers.slice(0, 5).forEach(teacher => {
        console.log(`   - ID: ${teacher.id}, الاسم: ${teacher.الاسم}, نشط: ${teacher.نشط}`);
      });
    }
    
    // 2. محاولة تسجيل دخول معلم صالح
    console.log('\n2️⃣ محاولة تسجيل دخول معلم صالح...');
    
    const loginData = {
      identity_number: "1074554773", // من قائمة المعلمين
      password: "123456" // كلمة مرور افتراضية
    };
    
    const loginResponse = await fetch(`${API_BASE_URL}/teacher/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    console.log(`📥 استجابة تسجيل الدخول (${loginResponse.status}):`, JSON.stringify(loginResult, null, 2));
    
    if (loginResponse.ok && loginResult.success) {
      const validTeacherId = loginResult.data.user_id;
      console.log(`✅ تم تسجيل الدخول بنجاح! معرف المعلم الصالح: ${validTeacherId}`);
      
      // 3. محاولة إنشاء جلسة بمعرف المعلم الصالح
      console.log('\n3️⃣ محاولة إنشاء جلسة بمعرف المعلم الصالح...');
      
      const sessionData = {
        student_id: 36,
        teacher_id: validTeacherId,
        quran_circle_id: 1,
        start_surah_number: 1,
        start_verse: 1,
        end_surah_number: 1,
        end_verse: 1,
        recitation_type: "حفظ",
        duration_minutes: 30,
        grade: 8.5,
        evaluation: "جيد جداً",
        teacher_notes: "اختبار مع معرف معلم صالح"
      };
      
      const sessionResponse = await fetch(`${API_BASE_URL}/recitation/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      const sessionResult = await sessionResponse.text();
      console.log(`📥 استجابة إنشاء الجلسة (${sessionResponse.status}):`, sessionResult);
      
      if (sessionResponse.ok) {
        console.log('✅ تم إنشاء الجلسة بنجاح مع معرف المعلم الصالح!');
      } else {
        console.log('❌ فشل في إنشاء الجلسة حتى مع معرف المعلم الصالح');
        
        // 4. فحص إضافي للطلاب المتاحين
        console.log('\n4️⃣ فحص الطلاب المتاحين...');
        await checkStudents();
      }
    } else {
      console.log('❌ فشل في تسجيل الدخول');
      
      // محاولة أوراق اعتماد أخرى
      console.log('\n🔄 محاولة أوراق اعتماد أخرى...');
      await tryOtherCredentials();
    }
    
  } catch (error) {
    console.error('❌ خطأ في الفحص الشامل:', error.message);
  }
}

async function checkStudents() {
  try {
    const studentsResponse = await fetch(`${API_BASE_URL}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    if (studentsResponse.ok) {
      const studentsData = await studentsResponse.json();
      console.log('📋 عينة من الطلاب المتاحين:');
      const students = studentsData.البيانات || studentsData.data || [];
      students.slice(0, 3).forEach(student => {
        console.log(`   - ID: ${student.id || student.ID}, الاسم: ${student.الاسم || student.name}`);
      });
    } else {
      console.log('❌ فشل في جلب الطلاب');
    }
  } catch (error) {
    console.log('❌ خطأ في فحص الطلاب:', error.message);
  }
}

async function tryOtherCredentials() {
  const credentials = [
    { identity_number: "1234567890", password: "123456" },
    { identity_number: "1234567891", password: "test123" },
    { identity_number: "3234567891", password: "test123" },
    { identity_number: "2234567890", password: "123456" }
  ];
  
  for (const cred of credentials) {
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/teacher/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cred)
      });
      
      if (loginResponse.ok) {
        const result = await loginResponse.json();
        if (result.success) {
          console.log(`✅ نجح تسجيل الدخول مع: ${cred.identity_number}, معرف المعلم: ${result.data.user_id}`);
          return result.data.user_id;
        }
      }
    } catch (error) {
      // تجاهل الأخطاء ومتابعة المحاولة التالية
    }
  }
  
  console.log('❌ فشل في جميع محاولات تسجيل الدخول');
  return null;
}

// تشغيل الفحص الشامل
comprehensiveTeacherTest();
