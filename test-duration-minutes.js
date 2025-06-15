// اختبار duration_minutes مع fetch API
// Test duration_minutes with fetch API

const API_BASE_URL = 'http://localhost:8000/api';

async function testDurationMinutes() {
    console.log('🧪 اختبار duration_minutes');
    console.log('=' * 50);

    try {
        // خطوة 1: إنشاء جلسة جديدة
        console.log('📝 إنشاء جلسة جديدة...');
        
        const sessionData = {
            student_id: 1,
            teacher_id: 1,
            quran_circle_id: 1,
            start_surah_number: 1,
            start_verse: 1,
            end_surah_number: 1,
            end_verse: 5,
            recitation_type: "حفظ",
            grade: 8.5,
            evaluation: "جيد جداً",
            teacher_notes: "اختبار duration_minutes"
        };

        console.log('البيانات المرسلة:', JSON.stringify(sessionData, null, 2));

        const createResponse = await fetch(`${API_BASE_URL}/recitation/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });

        const createResult = await createResponse.json();
        console.log('استجابة إنشاء الجلسة:', JSON.stringify(createResult, null, 2));

        if (!createResult.success) {
            throw new Error('فشل في إنشاء الجلسة');
        }

        const sessionId = createResult.data.session_id;
        console.log(`✅ تم إنشاء الجلسة: ${sessionId}`);

        // خطوة 2: تحديث الجلسة مع duration_minutes
        console.log('\n📝 تحديث الجلسة مع duration_minutes...');
        
        const updateData = {
            grade: 9.0,
            evaluation: "ممتاز",
            teacher_notes: "تم التحديث مع مدة 45 دقيقة",
            duration_minutes: 45  // ✅ هذا هو الذي نريد اختباره
        };

        console.log('بيانات التحديث:', JSON.stringify(updateData, null, 2));

        const updateResponse = await fetch(`${API_BASE_URL}/recitation/sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const updateResult = await updateResponse.json();
        console.log('استجابة التحديث:', JSON.stringify(updateResult, null, 2));

        // خطوة 3: جلب الجلسة للتأكد
        console.log('\n📝 جلب الجلسة للتأكد من حفظ duration_minutes...');
        
        const getResponse = await fetch(`${API_BASE_URL}/recitation/sessions/${sessionId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const sessionDetails = await getResponse.json();
        console.log('تفاصيل الجلسة:', JSON.stringify(sessionDetails, null, 2));

        // التحقق من النتيجة
        if (sessionDetails.duration_minutes !== undefined) {
            console.log(`✅ نجح الاختبار! تم حفظ duration_minutes: ${sessionDetails.duration_minutes} دقيقة`);
        } else {
            console.log('❌ فشل الاختبار! لم يتم حفظ duration_minutes');
            console.log('البيانات المستلمة:', Object.keys(sessionDetails));
        }

    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
        console.error('التفاصيل:', error);
    }
}

// تشغيل الاختبار
testDurationMinutes();
