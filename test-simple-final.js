// اختبار مبسط محاكي للملف PHP
const fetch = require('node-fetch');

console.log('🚀 بدء اختبار API جلسات التسميع...\n');

async function testAPI() {
    const baseUrl = 'http://localhost:8000/api';
    
    // اختبار 1: جلب الجلسات الموجودة
    console.log('1️⃣ جلب الجلسات الموجودة...');
    try {
        const response = await fetch(`${baseUrl}/recitation/sessions`);
        const data = await response.json();
        console.log(`✅ تم جلب ${data.data?.total || 0} جلسة`);
        console.log('');
    } catch (error) {
        console.log(`❌ خطأ في جلب الجلسات: ${error.message}`);
        return;
    }
    
    // اختبار 2: إنشاء جلسة جديدة - نفس البيانات من الملف PHP
    console.log('2️⃣ إنشاء جلسة جديدة...');
    
    const sessionData = {
        student_id: 1,
        teacher_id: 1,
        quran_circle_id: 1,
        start_surah_number: 1,
        start_verse: 1,
        end_surah_number: 1,
        end_verse: 7,
        recitation_type: 'حفظ',
        duration_minutes: 15,
        grade: 9.5,
        evaluation: 'ممتاز',
        teacher_notes: 'حفظ ممتاز لسورة الفاتحة'
    };
    
    console.log('البيانات المرسلة:');
    console.log(JSON.stringify(sessionData, null, 2));
    console.log('');
    
    try {
        const response = await fetch(`${baseUrl}/recitation/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        const result = await response.text();
        console.log(`الاستجابة الخام: ${result}`);
        console.log('');
        
        if (response.ok) {
            const data = JSON.parse(result);
            if (data.success) {
                console.log(`✅ نجح إنشاء الجلسة: ${data.session_id}`);
                
                // اختبار إضافة خطأ
                console.log('\n3️⃣ إضافة خطأ للجلسة...');
                const errorData = {
                    session_id: data.session_id,
                    error_type: 'نطق',
                    error_description: 'خطأ في نطق كلمة "الرحمن"',
                    surah_number: 1,
                    verse_number: 3,
                    word_position: 2,
                    severity: 'متوسط',
                    correction_provided: true,
                    notes: 'تم تصحيح النطق مباشرة'
                };
                
                const errorResponse = await fetch(`${baseUrl}/recitation/errors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(errorData)
                });
                
                const errorResult = await errorResponse.text();
                console.log(`استجابة إضافة الخطأ: ${errorResult}`);
                
                if (errorResponse.ok) {
                    console.log('✅ تم إضافة الخطأ بنجاح');
                } else {
                    console.log('❌ فشل إضافة الخطأ');
                }
                
            } else {
                console.log(`❌ فشل إنشاء الجلسة: ${data.message}`);
                if (data.errors) {
                    console.log('الأخطاء:');
                    Object.keys(data.errors).forEach(field => {
                        console.log(`- ${field}: ${data.errors[field]}`);
                    });
                }
            }
        } else {
            console.log(`❌ فشل الطلب: ${response.status} - ${response.statusText}`);
            try {
                const errorData = JSON.parse(result);
                if (errorData.errors) {
                    console.log('تفاصيل الأخطاء:');
                    Object.keys(errorData.errors).forEach(field => {
                        console.log(`- ${field}: ${errorData.errors[field]}`);
                    });
                }
            } catch (e) {
                console.log('لا يمكن تحليل رسالة الخطأ');
            }
        }
    } catch (error) {
        console.log(`❌ خطأ في الاتصال: ${error.message}`);
    }
    
    console.log('\n🎉 انتهى الاختبار!');
}

testAPI();
