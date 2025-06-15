// ملف اختبار API بسيط
const fetch = require('node-fetch');

const baseUrls = [
    'http://localhost:8000',
    'http://localhost:80',
    'http://localhost:3000',
    'http://127.0.0.1:8000'
];

async function testAPI() {
    console.log('🔍 البحث عن الخادم...');
    
    for (const baseUrl of baseUrls) {
        try {
            console.log(`جاري الاختبار: ${baseUrl}`);
            
            // اختبار GET للجلسات
            const response = await fetch(`${baseUrl}/api/recitation/sessions?limit=2`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            if (response.ok) {
                console.log(`✅ الخادم يعمل على: ${baseUrl}`);
                const data = await response.json();
                console.log('📊 البيانات المستلمة:');
                console.log(JSON.stringify(data, null, 2));
                
                // اختبار POST لإنشاء جلسة
                await testCreateSession(baseUrl);
                break;
            } else {
                console.log(`❌ خطأ ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.log(`❌ خطأ اتصال مع ${baseUrl}: ${error.message}`);
        }
    }
}

async function testCreateSession(baseUrl) {
    console.log('\n🆕 اختبار إنشاء جلسة جديدة...');
    
    const sessionData = {
        student_id: 1,
        teacher_id: 1,
        quran_circle_id: 1,
        evaluation: "جيد",
        recitation_type: "حفظ"
    };
    
    try {
        const response = await fetch(`${baseUrl}/api/recitation/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        const result = await response.text();
        
        if (response.ok) {
            console.log('✅ تم إنشاء الجلسة بنجاح:');
            console.log(result);
        } else {
            console.log(`❌ خطأ في إنشاء الجلسة (${response.status}):`);
            console.log(result);
        }
    } catch (error) {
        console.log(`❌ خطأ في إنشاء الجلسة: ${error.message}`);
    }
}

testAPI().catch(console.error);
