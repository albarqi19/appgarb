// اختبار API الحلقات الفرعية
const fetch = require('node-fetch');

// معرف حلقة قرآنية للاختبار - يمكنك تغييرها حسب البيانات المتاحة
const quranCircleId = 1; // أو أي معرف آخر متاح

const API_BASE_URL = 'http://localhost:8000';

async function testHierarchyAPI() {
    try {
        console.log(`اختبار API: GET ${API_BASE_URL}/api/hierarchy/quran-school/${quranCircleId}`);
        
        const response = await fetch(`${API_BASE_URL}/api/hierarchy/quran-school/${quranCircleId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('Status:', response.status);
        console.log('Headers:', response.headers.raw());

        const data = await response.text();
        console.log('\nResponse:');
        
        try {
            const jsonData = JSON.parse(data);
            console.log(JSON.stringify(jsonData, null, 2));
        } catch (e) {
            console.log('Raw response (not JSON):', data);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// اختبار عدة معرفات
async function testMultipleIds() {
    const testIds = [1, 2, 3, 4, 5];
    
    for (const id of testIds) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`اختبار معرف الحلقة: ${id}`);
        console.log(`${'='.repeat(50)}`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/hierarchy/quran-school/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ نجح الطلب!');
                console.log('البيانات:', JSON.stringify(data, null, 2));
                break; // إذا نجح واحد، توقف
            } else {
                console.log(`❌ فشل الطلب - Status: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ خطأ: ${error.message}`);
        }
    }
}

console.log('🚀 بدء اختبار API الحلقات الفرعية...\n');
testMultipleIds();
