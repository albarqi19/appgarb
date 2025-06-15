// Simple test for recitation API
console.log('🔥 اختبار مبسط لـ API التسميع');

const testData = {
    student_id: 1,
    teacher_id: 2,
    quran_circle_id: 3,
    start_surah_number: 2,
    start_verse: 1,
    end_surah_number: 2,
    end_verse: 10,
    recitation_type: "حفظ",
    grade: 8.5,
    evaluation: "جيد جداً"
};

async function quickTest() {
    try {
        console.log('📤 إرسال طلب إنشاء جلسة...');
        
        const response = await fetch('http://localhost:8000/api/recitation/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log(`📊 حالة الاستجابة: ${response.status}`);
        
        const result = await response.text();
        console.log('📋 الاستجابة الكاملة:');
        console.log(result);
        
        if (response.ok) {
            console.log('✅ نجح الاختبار!');
        } else {
            console.log('❌ فشل الاختبار');
        }
        
    } catch (error) {
        console.log('❌ خطأ:', error.message);
    }
}

quickTest();
