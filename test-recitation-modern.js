// اختبار API التسميع الحديث
// Modern ES6 Recitation API Test

console.log('🕌 اختبار API جلسات التسميع');
console.log('==============================');

const apiUrl = 'http://localhost:8000';

// بيانات اختبار إنشاء جلسة
const sessionTestData = {
    student_id: 1,
    teacher_id: 1,
    quran_circle_id: 1,
    start_surah_number: 2,
    start_verse: 1,
    end_surah_number: 2,
    end_verse: 5,
    recitation_type: "حفظ",
    duration_minutes: 20,
    grade: 8.5,
    evaluation: "جيد جداً",
    teacher_notes: "أداء جيد في التسميع"
};

async function testCreateRecitationSession() {
    try {
        console.log('\n1️⃣ اختبار إنشاء جلسة تسميع جديدة...');
        console.log('البيانات المرسلة:', JSON.stringify(sessionTestData, null, 2));
        
        const response = await fetch(`${apiUrl}/api/recitation/sessions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sessionTestData)
        });
        
        console.log(`\n📊 حالة الاستجابة: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ تم إنشاء الجلسة بنجاح!');
            console.log('📋 استجابة الخادم:');
            console.log(JSON.stringify(result, null, 2));
            
            return result.data?.session_id || result.session_id;
        } else {
            const errorText = await response.text();
            console.log('❌ فشل في إنشاء الجلسة');
            console.log('تفاصيل الخطأ:', errorText);
            
            // محاولة تحليل الخطأ كـ JSON
            try {
                const errorJson = JSON.parse(errorText);
                console.log('📋 أخطاء التحقق:');
                if (errorJson.errors) {
                    Object.entries(errorJson.errors).forEach(([field, messages]) => {
                        console.log(`- ${field}: ${messages.join(', ')}`);
                    });
                }
            } catch (e) {
                console.log('لا يمكن تحليل رسالة الخطأ كـ JSON');
            }
            return null;
        }
        
    } catch (error) {
        console.log('❌ خطأ في الشبكة:', error.message);
        return null;
    }
}

async function testAddError(sessionId) {
    if (!sessionId) {
        console.log('⚠️ لا يمكن اختبار إضافة الأخطاء بدون معرف جلسة');
        return;
    }
    
    try {
        console.log('\n2️⃣ اختبار إضافة خطأ للجلسة...');
        
        const errorData = {
            session_id: sessionId,
            error_type: "نسيان",
            surah_number: 2,
            verse_number: 3,
            error_description: "نسيان كلمة في الآية الثالثة",
            correction: "الكلمة الصحيحة: الله"
        };
        
        console.log('بيانات الخطأ:', JSON.stringify(errorData, null, 2));
        
        const response = await fetch(`${apiUrl}/api/recitation/errors/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(errorData)
        });
        
        console.log(`\n📊 حالة الاستجابة: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ تم إضافة الخطأ بنجاح!');
            console.log('📋 استجابة الخادم:');
            console.log(JSON.stringify(result, null, 2));
        } else {
            const errorText = await response.text();
            console.log('❌ فشل في إضافة الخطأ');
            console.log('تفاصيل الخطأ:', errorText);
        }
        
    } catch (error) {
        console.log('❌ خطأ في الشبكة:', error.message);
    }
}

async function testGetSessions() {
    try {
        console.log('\n3️⃣ اختبار عرض جلسات التسميع...');
        
        const response = await fetch(`${apiUrl}/api/recitation/sessions`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ تم جلب الجلسات بنجاح!');
            console.log(`📊 عدد الجلسات: ${result.data?.data?.length || 0}`);
            
            // عرض أول جلسة كمثال
            if (result.data?.data?.length > 0) {
                console.log('📋 مثال على جلسة:');
                const firstSession = result.data.data[0];
                console.log(`- معرف الجلسة: ${firstSession.session_id}`);
                console.log(`- الطالب: ${firstSession.student?.name}`);
                console.log(`- المعلم: ${firstSession.teacher?.name}`);
                console.log(`- نوع التسميع: ${firstSession.recitation_type}`);
                console.log(`- الدرجة: ${firstSession.grade}`);
            }
        } else {
            console.log('❌ فشل في جلب الجلسات');
        }
        
    } catch (error) {
        console.log('❌ خطأ في جلب الجلسات:', error.message);
    }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
    console.log('🚀 بدء اختبارات API التسميع...\n');
    
    // اختبار عرض الجلسات أولاً
    await testGetSessions();
    
    // اختبار إنشاء جلسة جديدة
    const sessionId = await testCreateRecitationSession();
    
    // اختبار إضافة خطأ للجلسة
    await testAddError(sessionId);
    
    console.log('\n🎉 انتهت جميع الاختبارات!');
    console.log('=====================\n');
    
    // نصائح لحل المشاكل
    console.log('💡 نصائح في حالة وجود مشاكل:');
    console.log('1. تأكد من تشغيل خادم Laravel: php artisan serve');
    console.log('2. تحقق من وجود البيانات الأساسية (student_id=1, teacher_id=1, etc.)');
    console.log('3. تحقق من إعدادات قاعدة البيانات');
    console.log('4. راجع ملف routes/api.php');
}

// تشغيل الاختبارات
runAllTests();
