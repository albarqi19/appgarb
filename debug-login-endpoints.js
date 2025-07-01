// فحص مسارات تسجيل الدخول المتاحة
import fetch from 'node-fetch';

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

async function findCorrectLoginEndpoints() {
  console.log('🔍 البحث عن مسارات تسجيل الدخول الصحيحة...');
  
  const possibleEndpoints = [
    '/login',
    '/auth/login',
    '/teacher/login',
    '/teachers/login',
    '/user/login',
    '/users/login',
    '/supervisor/login',
    '/student/login'
  ];
  
  const testCredentials = {
    identity_number: "1074554773",
    password: "123456"
  };
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`\n🧪 اختبار: ${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testCredentials)
      });
      
      const result = await response.text();
      
      if (response.status === 404) {
        console.log(`❌ ${endpoint}: غير موجود (404)`);
      } else if (response.status === 422) {
        console.log(`⚠️ ${endpoint}: خطأ في البيانات (422) - المسار موجود لكن البيانات خاطئة`);
        try {
          const jsonResult = JSON.parse(result);
          if (jsonResult.errors) {
            console.log(`   أخطاء: ${JSON.stringify(jsonResult.errors)}`);
          }
        } catch (e) {
          // تجاهل خطأ parsing
        }
      } else if (response.status === 401) {
        console.log(`🔐 ${endpoint}: غير مصرح (401) - المسار موجود لكن أوراق الاعتماد خاطئة`);
      } else if (response.ok) {
        console.log(`✅ ${endpoint}: نجح! (${response.status})`);
        try {
          const jsonResult = JSON.parse(result);
          console.log(`   استجابة: ${JSON.stringify(jsonResult, null, 2)}`);
        } catch (e) {
          console.log(`   استجابة: ${result}`);
        }
      } else {
        console.log(`🔄 ${endpoint}: استجابة غير متوقعة (${response.status})`);
        console.log(`   محتوى: ${result.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: خطأ في الاتصال - ${error.message}`);
    }
  }
  
  // فحص إضافي: محاولة مع بيانات مختلفة
  console.log('\n🔄 محاولة مع بيانات اعتماد مختلفة...');
  await tryDifferentCredentials();
}

async function tryDifferentCredentials() {
  const endpoints = ['/login', '/auth/login'];
  const credentialSets = [
    { nationalId: "1074554773", password: "123456" },
    { identity_number: "1074554773", password: "123456" },
    { email: "test@example.com", password: "123456" },
    { username: "teacher1", password: "123456" }
  ];
  
  for (const endpoint of endpoints) {
    for (const creds of credentialSets) {
      try {
        console.log(`\n🧪 ${endpoint} مع ${JSON.stringify(creds)}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(creds)
        });
        
        if (response.status !== 404) {
          const result = await response.text();
          console.log(`   استجابة (${response.status}): ${result.substring(0, 300)}...`);
          
          if (response.ok) {
            console.log('✅ نجح تسجيل الدخول!');
            return { endpoint, credentials: creds, response: result };
          }
        }
        
      } catch (error) {
        // تجاهل الأخطاء ومتابعة التجربة
      }
    }
  }
  
  return null;
}

// تشغيل الفحص
findCorrectLoginEndpoints();
