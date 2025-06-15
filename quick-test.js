// اختبار سريع للـ API
import fetch from 'node-fetch';

async function quickTest() {
    console.log('🧪 اختبار سريع لـ API...\n');
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/teachers/1/students');
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ نجح الطلب!');
            console.log('📊 البيانات:', JSON.stringify(data, null, 2));
        } else {
            const error = await response.text();
            console.log('❌ خطأ:', error);
        }
    } catch (err) {
        console.log('💥 خطأ في الاتصال:', err.message);
    }
}

quickTest();
