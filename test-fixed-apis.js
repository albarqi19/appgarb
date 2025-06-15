const testEndpoints = async () => {
  console.log('🧪 اختبار API endpoints المُصلحة...\n');
  
  const endpoints = [
    'http://localhost:8000/api/students/11',
    'http://localhost:8000/api/students/11/daily-curriculum', 
    'http://localhost:8000/api/recitation/sessions/stats/student/11',
    'http://localhost:8000/api/recitation/errors/stats/student/11'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 اختبار: ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ نجح الاتصال - الكود: ${response.status}`);
        console.log(`📊 مفاتيح البيانات: ${Object.keys(data).join(', ')}`);
        console.log('---');
      } else {
        console.log(`❌ فشل الاتصال - الكود: ${response.status}`);
        console.log('---');
      }
    } catch (error) {
      console.log(`❌ خطأ في الاتصال: ${error.message}`);
      console.log('---');
    }
  }
};

testEndpoints().catch(console.error);
