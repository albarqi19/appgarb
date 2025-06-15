// اختبار مباشر لـ APIs المعلمين
const fetch = require('node-fetch');

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testTeacherAPIs() {
    console.log('=== اختبار APIs المعلمين ===\n');
    
    // قائمة APIs للاختبار
    const endpoints = [
        '/teachers',
        '/teachers/1',
        '/teachers/1/mosques',
        '/teachers/1/circles',
        '/mosques',
        '/mosques/1'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`🔍 اختبار: ${endpoint}`);
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   📊 Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ البيانات:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
            } else {
                const errorText = await response.text();
                console.log(`   ❌ خطأ: ${errorText.substring(0, 200)}...`);
            }
        } catch (error) {
            console.log(`   💥 خطأ في الاتصال: ${error.message}`);
        }
        console.log('');
    }
}

// تشغيل الاختبار
testTeacherAPIs().catch(console.error);
