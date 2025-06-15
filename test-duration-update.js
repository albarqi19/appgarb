/**
 * اختبار إرسال duration_minutes في تحديث الجلسة
 */

// إعداد البيانات للاختبار
const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testDurationUpdate() {
    console.log('🧪 اختبار إرسال duration_minutes...\n');
    
    try {
        // 1. إنشاء جلسة أولاً للحصول على session_id
        console.log('1️⃣ إنشاء جلسة تسميع جديدة...');
        
        const sessionData = {
            student_id: 1,
            teacher_id: 1,
            quran_circle_id: 1,
            start_surah_number: 1,
            start_verse: 1,
            end_surah_number: 1,
            end_verse: 7,
            recitation_type: 'حفظ',
            grade: 8.5,
            evaluation: 'جيد جداً',
            teacher_notes: 'جلسة اختبار لمدة الجلسة'
        };
        
        const createResponse = await fetch(`${API_BASE_URL}/recitation/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(sessionData),
        });
        
        if (!createResponse.ok) {
            throw new Error(`خطأ في إنشاء الجلسة: ${createResponse.status}`);
        }
        
        const createResult = await createResponse.json();
        console.log('✅ تم إنشاء الجلسة:', createResult.data.session_id);
        
        const sessionId = createResult.data.session_id;
        
        // 2. اختبار تحديث الجلسة مع duration_minutes
        console.log('\n2️⃣ تحديث الجلسة مع duration_minutes...');
        
        const updateData = {
            grade: 9,
            evaluation: 'ممتاز',
            teacher_notes: 'تم اختبار إرسال مدة الجلسة بنجاح',
            duration_minutes: 25  // ✅ اختبار إرسال مدة الجلسة
        };
        
        console.log('📤 البيانات المرسلة:', JSON.stringify(updateData, null, 2));
        
        const updateResponse = await fetch(`${API_BASE_URL}/recitation/sessions/${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(updateData),
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`خطأ في تحديث الجلسة: ${updateResponse.status} - ${errorText}`);
        }
        
        const updateResult = await updateResponse.json();
        console.log('✅ نتيجة التحديث:', JSON.stringify(updateResult, null, 2));
        
        // 3. التحقق من أن duration_minutes تم حفظه
        console.log('\n3️⃣ التحقق من حفظ duration_minutes...');
        
        const getResponse = await fetch(`${API_BASE_URL}/recitation/sessions/${sessionId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!getResponse.ok) {
            throw new Error(`خطأ في جلب الجلسة: ${getResponse.status}`);
        }
        
        const getResult = await getResponse.json();
        console.log('📥 بيانات الجلسة المحدثة:', JSON.stringify(getResult, null, 2));
        
        // التحقق من وجود duration_minutes
        if (getResult.duration_minutes !== undefined) {
            console.log(`\n🎉 نجح الاختبار! duration_minutes = ${getResult.duration_minutes} دقيقة`);
        } else {
            console.log('\n❌ فشل الاختبار: duration_minutes غير موجود في النتيجة');
        }
        
    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
    }
}

// تشغيل الاختبار
testDurationUpdate();
