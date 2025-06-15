// Test script for Recitation Sessions API
// اختبار API جلسات التسميع

console.log('🕌 اختبار API جلسات التسميع');
console.log('================================');

// Test with different possible server URLs
const possibleUrls = [
    'http://localhost:8000',
    'http://localhost:80',
    'http://localhost:8080',
    'http://127.0.0.1:8000',
    'http://127.0.0.1:80'
];

async function testRecitationAPI() {
    let workingUrl = null;
    
    // First, find the working server URL
    console.log('\n🔍 البحث عن خادم Laravel...');
    for (const url of possibleUrls) {
        try {
            const response = await fetch(url, { 
                method: 'GET',
                timeout: 3000 
            });
            if (response.ok || response.status === 200) {
                workingUrl = url;
                console.log(`✅ وُجد خادم على: ${url}`);
                break;
            }
        } catch (error) {
            console.log(`❌ لا يوجد خادم على: ${url}`);
        }
    }
    
    if (!workingUrl) {
        console.log('❌ لم يتم العثور على خادم Laravel. تأكد من تشغيله أولاً.');
        console.log('💡 جرب: php artisan serve');
        return;
    }
    
    const apiUrl = workingUrl + '/api';
    console.log(`\n🚀 استخدام API على: ${apiUrl}`);
    
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
    console.log('البيانات المرسلة:', JSON.stringify(sessionData, null, 2));
    
    try {
        // Create recitation session
        const sessionResponse = await fetch(`${apiUrl}/recitation/sessions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        if (!sessionResponse.ok) {
            throw new Error(`HTTP ${sessionResponse.status}: ${sessionResponse.statusText}`);
        }
        
        const sessionResult = await sessionResponse.json();
        console.log('\n✅ تم إنشاء الجلسة بنجاح!');
        console.log('الاستجابة:', JSON.stringify(sessionResult, null, 2));
        
        // Extract session_id for error testing
        const sessionId = sessionResult.data?.session_id || sessionResult.session_id;
        
        if (sessionId) {
            console.log(`\n📝 معرف الجلسة: ${sessionId}`);
            
            // Test adding errors to the session
            console.log('\n2️⃣ اختبار إضافة أخطاء للجلسة...');
            
            const errorData = {
                session_id: sessionId,
                error_type: "نسيان",
                surah_number: 2,
                verse_number: 5,
                error_description: "نسيان كلمة في الآية الخامسة",
                correction: "الكلمة الصحيحة هي: الله"
            };
            
            console.log('بيانات الخطأ:', JSON.stringify(errorData, null, 2));
            
            const errorResponse = await fetch(`${apiUrl}/recitation/errors/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(errorData)
            });
            
            if (errorResponse.ok) {
                const errorResult = await errorResponse.json();
                console.log('\n✅ تم إضافة الخطأ بنجاح!');
                console.log('الاستجابة:', JSON.stringify(errorResult, null, 2));
            } else {
                console.log(`\n❌ فشل في إضافة الخطأ: ${errorResponse.status} ${errorResponse.statusText}`);
            }
            
            // Test getting session details
            console.log('\n3️⃣ اختبار عرض تفاصيل الجلسة...');
            
            const detailsResponse = await fetch(`${apiUrl}/recitation/sessions/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (detailsResponse.ok) {
                const detailsResult = await detailsResponse.json();
                console.log('\n📋 تفاصيل الجلسة:');
                console.log(JSON.stringify(detailsResult, null, 2));
            } else {
                console.log(`\n❌ فشل في عرض تفاصيل الجلسة: ${detailsResponse.status}`);
            }
        }
        
        console.log('\n🎉 تم اختبار API بنجاح!');
        
    } catch (error) {
        console.log('\n❌ خطأ في الاتصال بـ API:');
        console.log(error.message);
        
        // Provide helpful suggestions
        console.log('\n💡 اقتراحات لحل المشكلة:');
        console.log('1. تأكد من تشغيل خادم Laravel: php artisan serve');
        console.log('2. تحقق من إعدادات قاعدة البيانات');
        console.log('3. تأكد من وجود البيانات الأساسية (طلاب، معلمين، حلقات)');
        console.log('4. تحقق من routes/api.php');
    }
}

// Run the test
testRecitationAPI();
