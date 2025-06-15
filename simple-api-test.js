console.log('🔥 اختبار بسيط');

async function quickTest() {
    try {
        const response = await fetch('http://localhost:8000/api/recitation/sessions', {
            method: 'GET'
        });
        
        const data = await response.json();
        console.log('✅ API يعمل! عدد الجلسات:', data.data.data.length);
        
        // اختبار إنشاء جلسة بسيطة
        const newSession = {
            student_id: 1,
            teacher_id: 1,
            start_surah_number: 5,
            start_verse: 1,
            end_surah_number: 5,
            end_verse: 3,
            recitation_type: "حفظ"
        };
        
        console.log('📤 إرسال جلسة جديدة...');
        
        const createResponse = await fetch('http://localhost:8000/api/recitation/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newSession)
        });
        
        console.log('📊 حالة الاستجابة:', createResponse.status);
        
        if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('✅ تم إنشاء الجلسة!', result.data.session_id);
        } else {
            const error = await createResponse.text();
            console.log('❌ خطأ:', error);
        }
        
    } catch (error) {
        console.log('❌ خطأ شبكة:', error.message);
    }
}

quickTest();
