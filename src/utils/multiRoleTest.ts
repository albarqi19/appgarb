// اختبار وظائف الأدوار المتعددة
// هذا الملف للاختبار والتطوير فقط

import { checkAvailableRoles, loginWithRoleCheck } from '../services/authService';

// مثال على بيانات اختبار
const testCredentials = {
  nationalId: '3234567891', // الطالب الذي يسجل دخول بنجاح كطالب ومعلم
  password: 'test123'
};

// دالة اختبار فحص الأدوار المتاحة
export const testMultipleRoles = async () => {
  console.group('🧪 اختبار الأدوار المتعددة');
  
  try {
    console.log('📋 اختبار فحص الأدوار المتاحة...');
    const availableRoles = await checkAvailableRoles(testCredentials);
    console.log('الأدوار المتاحة:', availableRoles);
    
    if (availableRoles.length === 0) {
      console.error('❌ لا توجد أدوار متاحة');
      return;
    }
    
    if (availableRoles.length === 1) {
      console.log('✅ دور واحد فقط:', availableRoles[0]);
    } else {
      console.log('🔄 أدوار متعددة متاحة:', availableRoles);
    }
    
    console.log('📋 اختبار تسجيل الدخول مع فحص الأدوار...');
    const loginResult = await loginWithRoleCheck(testCredentials);
    
    if ('multipleRoles' in loginResult) {
      console.log('🎯 النتيجة: أدوار متعددة -', loginResult.multipleRoles);
      console.log('✅ سيتم عرض صفحة اختيار الدور للمستخدم');
    } else {
      console.log('✅ النتيجة: تسجيل دخول مباشر -', loginResult.user.defaultRole);
      console.log('المستخدم:', loginResult.user.name);
      console.log('التوجيه إلى:', loginResult.redirectPath);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
  
  console.groupEnd();
};

// دالة اختبار حالات مختلفة
export const testDifferentScenarios = async () => {
  console.group('🔬 اختبار حالات مختلفة');
  
  const testCases = [
    {
      name: 'مستخدم غير موجود',
      credentials: { nationalId: '9999999999', password: 'wrongpass' }
    },
    {
      name: 'كلمة مرور خاطئة',
      credentials: { nationalId: '3234567891', password: 'wrongpass' }
    },
    {
      name: 'مستخدم صحيح',
      credentials: { nationalId: '3234567891', password: 'test123' }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📋 اختبار: ${testCase.name}`);
    try {
      const result = await loginWithRoleCheck(testCase.credentials);
      if ('multipleRoles' in result) {
        console.log('✅ أدوار متعددة:', result.multipleRoles);
      } else {
        console.log('✅ تسجيل دخول ناجح:', result.user.defaultRole);
      }
    } catch (error: any) {
      console.log('❌ فشل متوقع:', error.message);
    }
  }
  
  console.groupEnd();
};

// دالة اختبار شاملة
export const runAllTests = async () => {
  console.log('🚀 بدء الاختبارات الشاملة للأدوار المتعددة');
  console.log('=' .repeat(50));
  
  await testMultipleRoles();
  await testDifferentScenarios();
  
  console.log('=' .repeat(50));
  console.log('✅ انتهت جميع الاختبارات');
};

// تشغيل الاختبارات تلقائياً في بيئة التطوير
if (process.env.NODE_ENV === 'development') {
  // يمكن استدعاء runAllTests() من وحدة التحكم في المتصفح
  (window as any).runMultiRoleTests = runAllTests;
  console.log('💡 لتشغيل اختبارات الأدوار المتعددة، اكتب في وحدة التحكم: runMultiRoleTests()');
}
