// اختبار شامل لنقطة API إنشاء الجلسة مع تجريب تنسيقات مختلفة للبيانات

const fetch = require('node-fetch');

// تحضير بيانات تجريبية مختلفة
const testData1 = {
    student_id: 1,
    teacher_id: 1,
    quran_circle_id: 1,
    start_surah_number: 1,
    start_verse: 1,
    end_surah_number: 1,
    end_verse: 7,
    recitation_type: "حفظ",
    duration_minutes: 30,
    grade: 10.0,
    evaluation: "ممتاز",
    teacher_notes: "أداء ممتاز للطالب"
};

const testData2 = {
    student_id: 1,
    teacher_id: 1,
    quran_circle_id: 1,
    start_surah_number: 1,
    start_verse: 1,
    end_surah_number: 1,
    end_verse: 7,
    recitation_type: "حفظ",
    duration_minutes: 30,
    grade: 10.0,
    evaluation: "ممتاز",
    teacher_notes: "أداء ممتاز للطالب",
    session_date: new Date().toISOString().split('T')[0] // تاريخ اليوم
};

const testData3 = {
    student_id: 1,
    teacher_id: 1,
    quran_circle_id: 1,
    start_surah_number: 1,
    start_verse: 1,
    end_surah_number: 1,
    end_verse: 7,
    recitation_type: "حفظ",
    duration_minutes: 30,
    grade: 10.0,
    evaluation: "ممتاز",
    teacher_notes: "أداء ممتاز للطالب",
    session_date: new Date().toISOString(),
    created_at: new Date().toISOString()
};

async function testCreateSession(testData, testName) {
    console.log(`\n=== ${testName} ===`);
    console.log('البيانات المرسلة:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await fetch('http://localhost:8000/api/recitation/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log('رمز الاستجابة:', response.status);
        console.log('نص حالة الاستجابة:', response.statusText);
        
        const responseText = await response.text();
        console.log('محتوى الاستجابة:', responseText);
        
        if (response.ok) {
            console.log('✅ نجح الاختبار!');
            try {
                const responseJson = JSON.parse(responseText);
                console.log('البيانات المفسرة:', responseJson);
            } catch (e) {
                console.log('⚠️  الاستجابة ليست JSON صالح');
            }
        } else {
            console.log('❌ فشل الاختبار');
        }
        
    } catch (error) {
        console.error('خطأ في الشبكة:', error.message);
    }
}

async function runAllTests() {
    console.log('بدء اختبار إنشاء جلسات التسميع...\n');
    
    // أولاً تأكد من أن الخادم يعمل
    try {
        const healthResponse = await fetch('http://localhost:8000/api/recitation/sessions/');
        console.log('حالة اتصال الخادم:', healthResponse.status);
        
        if (!healthResponse.ok) {
            console.log('❌ الخادم لا يستجيب. تأكد من تشغيله على http://localhost:8000');
            return;
        }
    } catch (error) {
        console.log('❌ خطأ في الاتصال بالخادم:', error.message);
        return;
    }
    
    // تشغيل الاختبارات
    await testCreateSession(testData1, 'الاختبار الأساسي');
    await testCreateSession(testData2, 'اختبار مع تاريخ الجلسة');
    await testCreateSession(testData3, 'اختبار مع طوابع زمنية كاملة');
    
    console.log('\n=== انتهت الاختبارات ===');
}

runAllTests();
