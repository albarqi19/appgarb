// اختبار سريع لمعرفة القيم المقبولة للـ status في الخادم
const testStatuses = [
  'present',
  'absent', 
  'late',
  'excused',
  'حاضر',
  'غائب',
  'متأخر',
  'مستأذن',
  'مأذون',
  'معذور'
];

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

async function testStatusValues() {
  console.log('🔍 اختبار القيم المقبولة للـ status...');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXBpL2F1dGgvdGVhY2hlci9sb2dpbiIsImlhdCI6MTczMzg1MjA4MSwiZXhwIjoxNzMzODU1NjgxLCJuYmYiOjE3MzM4NTIwODEsImp0aSI6IjdLZHJSd2lNVGJqbVVmbDEiLCJzdWIiOiIxIiwicHJ2IjoiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.RFPm-aOg0T-6kMnNdSWDNgFZZH-1Lsaez0TIlIoGq0A'
  };

  for (const status of testStatuses) {
    try {
      const testData = {
        student_name: 'طالب تجريبي',
        date: '2025-06-10',
        status: status,
        period: 'العصر',
        notes: `اختبار ${status}`
      };

      console.log(`📤 اختبار الحالة: ${status}`);
      
      const response = await fetch(`${API_BASE_URL}/attendance/record`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${status} - نجح`);
      } else {
        const error = await response.json();
        console.log(`❌ ${status} - فشل:`, error.message || 'خطأ غير معروف');
      }
    } catch (error) {
      console.log(`💥 ${status} - خطأ في الاتصال:`, error.message);
    }
    
    // انتظار قصير بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testStatusValues();
