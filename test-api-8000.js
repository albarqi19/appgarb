// Test script specifically for Laravel server on port 8000
// اختبار API للخادم على المنفذ 8000

console.log('🕌 اختبار API جلسات التسميع - المنفذ 8000');
console.log('==========================================');

const apiUrl = 'http://localhost:8000/api';

async function testRecitationAPI() {
    // First test server connection
    console.log('\n🔍 اختبار الاتصال بالخادم...');
    try {
        const response = await fetch('http://localhost:8000', { 
            method: 'GET',
            timeout: 5000 
        });
        console.log(`✅ الخادم يعمل - حالة الاستجابة: ${response.status}`);
    } catch (error) {
        console.log('❌ لا يمكن الوصول للخادم على http://localhost:8000');
        console.log('تأكد من تشغيل Laravel بالأمر: php artisan serve');
        return;
    }
    
    // Test data for creating a recitation session
    const sessionData = {
        student_id: 1,
        teacher_id: 2,
        quran_circle_id: 3,
        start_surah_number: 2,
        start_verse: 1,
        end_surah_number: 2,
        end_verse: 10,
        recitation_type: "حفظ",
        duration_minutes: 30,
        grade: 8.5,
        evaluation: "جيد جداً",
        teacher_notes: "أداء ممتاز في التسميع"
    };
    
    console.log('\n1️⃣ اختبار إنشاء جلسة تسميع جديدة...');
    console.log('📤 إرسال البيانات إلى:', `${apiUrl}/recitation/sessions/`);
    console.log('البيانات:', JSON.stringify(sessionData, null, 2));
    
    try {
        // Create recitation session
        const sessionResponse = await fetch(`${apiUrl}/recitation/sessions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(sessionData)
        });
        
        console.log(`\n📡 حالة الاستجابة: ${sessionResponse.status} ${sessionResponse.statusText}`);
        
        if (!sessionResponse.ok) {
            const errorText = await sessionResponse.text();
            console.log('❌ تفاصيل الخطأ:', errorText);
            throw new Error(`HTTP ${sessionResponse.status}: ${sessionResponse.statusText}`);
        }
        
        const sessionResult = await sessionResponse.json();
        console.log('\n✅ تم إنشاء الجلسة بنجاح!');
        console.log('📋 الاستجابة:', JSON.stringify(sessionResult, null, 2));
        
        // Extract session_id for further testing
        const sessionId = sessionResult.data?.session_id || sessionResult.session_id;
        
        if (sessionId) {
            console.log(`\n🆔 معرف الجلسة: ${sessionId}`);
            
            // Test adding errors to the session
            await testAddingErrors(sessionId);
            
            // Test getting session details
            await testSessionDetails(sessionId);
            
            // Test getting all sessions
            await testGetAllSessions();
        }
        
        console.log('\n🎉 تم اختبار API بنجاح!');
        
    } catch (error) {
        console.log('\n❌ خطأ في الاتصال بـ API:');
        console.log('التفاصيل:', error.message);
        
        console.log('\n🔍 خطوات التشخيص:');
        console.log('1. تحقق من أن Laravel يعمل: php artisan serve --port=8000');
        console.log('2. تأكد من وجود الطرق في routes/api.php');
        console.log('3. تحقق من إعدادات CORS');
        console.log('4. تأكد من وجود البيانات الأساسية في قاعدة البيانات');
    }
}

async function testAddingErrors(sessionId) {
    console.log('\n2️⃣ اختبار إضافة أخطاء للجلسة...');
    
    const errorData = {
        session_id: sessionId,
        error_type: "نسيان",
        surah_number: 2,
        verse_number: 5,
        error_description: "نسيان كلمة في الآية الخامسة",
        correction: "الكلمة الصحيحة هي: الله"
    };
    
    console.log('📤 إرسال بيانات الخطأ:', JSON.stringify(errorData, null, 2));
    
    try {
        const errorResponse = await fetch(`${apiUrl}/recitation/errors/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(errorData)
        });
        
        console.log(`📡 حالة الاستجابة: ${errorResponse.status} ${errorResponse.statusText}`);
        
        if (errorResponse.ok) {
            const errorResult = await errorResponse.json();
            console.log('✅ تم إضافة الخطأ بنجاح!');
            console.log('📋 الاستجابة:', JSON.stringify(errorResult, null, 2));
        } else {
            const errorText = await errorResponse.text();
            console.log(`❌ فشل في إضافة الخطأ: ${errorResponse.status}`);
            console.log('تفاصيل الخطأ:', errorText);
        }
    } catch (error) {
        console.log('❌ خطأ في إضافة الخطأ:', error.message);
    }
}

async function testSessionDetails(sessionId) {
    console.log('\n3️⃣ اختبار عرض تفاصيل الجلسة...');
    
    try {
        const detailsResponse = await fetch(`${apiUrl}/recitation/sessions/${sessionId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log(`📡 حالة الاستجابة: ${detailsResponse.status} ${detailsResponse.statusText}`);
        
        if (detailsResponse.ok) {
            const detailsResult = await detailsResponse.json();
            console.log('✅ تم جلب تفاصيل الجلسة!');
            console.log('📋 التفاصيل:', JSON.stringify(detailsResult, null, 2));
        } else {
            const errorText = await detailsResponse.text();
            console.log(`❌ فشل في عرض تفاصيل الجلسة: ${detailsResponse.status}`);
            console.log('تفاصيل الخطأ:', errorText);
        }
    } catch (error) {
        console.log('❌ خطأ في جلب تفاصيل الجلسة:', error.message);
    }
}

async function testGetAllSessions() {
    console.log('\n4️⃣ اختبار عرض جميع الجلسات...');
    
    try {
        const allSessionsResponse = await fetch(`${apiUrl}/recitation/sessions/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        console.log(`📡 حالة الاستجابة: ${allSessionsResponse.status} ${allSessionsResponse.statusText}`);
        
        if (allSessionsResponse.ok) {
            const allSessionsResult = await allSessionsResponse.json();
            console.log('✅ تم جلب جميع الجلسات!');
            console.log('📋 عدد الجلسات:', allSessionsResult.data?.length || 0);
            console.log('📋 البيانات:', JSON.stringify(allSessionsResult, null, 2));
        } else {
            const errorText = await allSessionsResponse.text();
            console.log(`❌ فشل في عرض الجلسات: ${allSessionsResponse.status}`);
            console.log('تفاصيل الخطأ:', errorText);
        }
    } catch (error) {
        console.log('❌ خطأ في جلب الجلسات:', error.message);
    }
}

// Run the test
testRecitationAPI();
