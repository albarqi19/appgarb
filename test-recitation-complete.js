// اختبار كامل لـ API التسميع
console.log('🕌 اختبار API التسميع الكامل');
console.log('===============================');

const API_BASE = 'http://localhost:8000/api';

// بيانات الجلسة الجديدة
const sessionData = {
    student_id: 1,
    teacher_id: 1,
    quran_circle_id: 1,
    start_surah_number: 4,
    start_verse: 1,
    end_surah_number: 4,
    end_verse: 10,
    recitation_type: "حفظ",
    duration_minutes: 25,
    grade: 8.75,
    evaluation: "جيد جداً",
    teacher_notes: "حفظ جيد لسورة النساء - اختبار JavaScript"
};

async function testRecitationAPI() {
    try {
        console.log('\n1️⃣ إنشاء جلسة تسميع جديدة...');
        console.log('البيانات:', JSON.stringify(sessionData, null, 2));
        
        const response = await fetch(`${API_BASE}/recitation/sessions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        console.log(`📊 حالة الاستجابة: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ خطأ في الاستجابة:', errorText);
            return;
        }
        
        const result = await response.json();
        console.log('✅ تم إنشاء الجلسة بنجاح!');
        console.log('📋 الاستجابة:', JSON.stringify(result, null, 2));
        
        const sessionId = result.data.session_id;
        console.log(`\n📝 معرف الجلسة: ${sessionId}`);
        
        // اختبار إضافة خطأ للجلسة
        if (sessionId) {
            console.log('\n2️⃣ إضافة خطأ للجلسة...');
            
            const errorData = {
                session_id: sessionId,
                error_type: "نسيان",
                surah_number: 4,
                verse_number: 5,
                error_description: "نسيان كلمة في آية النساء",
                correction: "الكلمة الصحيحة: والله"
            };
            
            console.log('بيانات الخطأ:', JSON.stringify(errorData, null, 2));
            
            const errorResponse = await fetch(`${API_BASE}/recitation/errors/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(errorData)
            });
            
            if (errorResponse.ok) {
                const errorResult = await errorResponse.json();
                console.log('✅ تم إضافة الخطأ بنجاح!');
                console.log('📋 استجابة الخطأ:', JSON.stringify(errorResult, null, 2));
            } else {
                const errorText = await errorResponse.text();
                console.log('❌ فشل في إضافة الخطأ:', errorText);
            }
            
            // اختبار تحديث الجلسة
            console.log('\n3️⃣ تحديث الجلسة...');
            
            const updateData = {
                grade: 9.25,
                evaluation: "ممتاز",
                teacher_notes: "تم تحديث التقييم - ممتاز بعد التصحيح"
            };
            
            const updateResponse = await fetch(`${API_BASE}/recitation/sessions/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (updateResponse.ok) {
                const updateResult = await updateResponse.json();
                console.log('✅ تم تحديث الجلسة بنجاح!');
                console.log('📋 الجلسة المحدثة:', JSON.stringify(updateResult, null, 2));
            } else {
                const updateErrorText = await updateResponse.text();
                console.log('❌ فشل في تحديث الجلسة:', updateErrorText);
            }
            
            // اختبار عرض تفاصيل الجلسة
            console.log('\n4️⃣ عرض تفاصيل الجلسة...');
            
            const detailsResponse = await fetch(`${API_BASE}/recitation/sessions/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (detailsResponse.ok) {
                const detailsResult = await detailsResponse.json();
                console.log('✅ تم جلب تفاصيل الجلسة!');
                console.log('📋 تفاصيل الجلسة الكاملة:', JSON.stringify(detailsResult, null, 2));
            } else {
                const detailsErrorText = await detailsResponse.text();
                console.log('❌ فشل في جلب تفاصيل الجلسة:', detailsErrorText);
            }
        }
        
        console.log('\n🎉 تم اختبار API بنجاح!');
        
    } catch (error) {
        console.log('\n❌ خطأ عام في الاختبار:', error.message);
    }
}

// تشغيل الاختبار
testRecitationAPI();
