// Test file to validate exact API requirements
const https = require('http');

async function testRecitationAPI() {
    console.log('🎯 اختبار شامل لـ API التسميع...\n');

    // 1. Test GET first to see what data exists
    console.log('=== 1. فحص البيانات الموجودة ===');
    await testGet();

    // 2. Test with exact values from existing sessions
    console.log('\n=== 2. اختبار إنشاء جلسة بقيم مطابقة ===');
    await testPostWithExactValues();

    // 3. Test individual field validation
    console.log('\n=== 3. اختبار حقول محددة ===');
    await testFieldValidation();
}

async function testGet() {
    try {
        const response = await fetch('http://localhost:8000/api/recitation/sessions/');
        const data = await response.json();
        
        if (data.success && data.sessions && data.sessions.length > 0) {
            console.log(`✅ تم العثور على ${data.sessions.length} جلسة موجودة`);
            
            // Show first session structure
            const firstSession = data.sessions[0];
            console.log('\n📋 بنية أول جلسة:');
            console.log(`- recitation_type: "${firstSession.recitation_type}"`);
            console.log(`- evaluation: "${firstSession.evaluation}"`);
            console.log(`- student_id: ${firstSession.student_id}`);
            console.log(`- teacher_id: ${firstSession.teacher_id}`);
            
            return firstSession;
        } else {
            console.log('⚠️ لا توجد جلسات موجودة');
            return null;
        }
    } catch (error) {
        console.error('❌ خطأ في GET:', error.message);
        return null;
    }
}

async function testPostWithExactValues() {
    // Use exact values that we know work
    const testData = {
        student_id: 1,
        teacher_id: 1,
        quran_circle_id: 1,
        start_surah_number: 2,
        start_verse: 1,
        end_surah_number: 2,
        end_verse: 5,
        recitation_type: "حفظ",  // Exact Arabic value
        duration_minutes: 10,
        grade: 9.0,
        evaluation: "ممتاز",    // Exact Arabic value
        teacher_notes: "اختبار API"
    };

    try {
        console.log('📤 إرسال البيانات:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:8000/api/recitation/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        console.log(`📨 HTTP Status: ${response.status}`);
        console.log('📨 Response:', JSON.stringify(result, null, 2));

        if (response.ok && result.success) {
            console.log('✅ نجح إنشاء الجلسة!');
        } else {
            console.log('❌ فشل إنشاء الجلسة');
            if (result.errors) {
                console.log('\n📋 تفاصيل الأخطاء:');
                Object.entries(result.errors).forEach(([field, errors]) => {
                    console.log(`- ${field}: ${errors.join(', ')}`);
                });
            }
        }
    } catch (error) {
        console.error('❌ خطأ في الشبكة:', error.message);
    }
}

async function testFieldValidation() {
    console.log('🔍 اختبار القيم المسموحة...\n');
    
    // Test recitation_type values
    const recitationTypes = ["حفظ", "مراجعة صغرى", "مراجعة كبرى", "تثبيت"];
    const evaluations = ["ممتاز", "جيد جداً", "جيد", "مقبول", "ضعيف"];
    
    console.log('📋 أنواع التسميع المتوقعة:');
    recitationTypes.forEach(type => console.log(`  - "${type}"`));
    
    console.log('\n📋 التقييمات المتوقعة:');
    evaluations.forEach(eval => console.log(`  - "${eval}"`));
    
    // Test with first valid combination
    const testData = {
        student_id: 1,
        teacher_id: 1,
        start_surah_number: 1,
        start_verse: 1,
        end_surah_number: 1,
        end_verse: 5,
        recitation_type: recitationTypes[0],
        evaluation: evaluations[0]
    };
    
    console.log('\n🧪 اختبار القيم الأولى...');
    await testSinglePost(testData);
}

async function testSinglePost(data) {
    try {
        const response = await fetch('http://localhost:8000/api/recitation/sessions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ نجح!');
        } else {
            console.log('❌ فشل');
            if (result.errors) {
                Object.entries(result.errors).forEach(([field, errors]) => {
                    console.log(`  - ${field}: ${errors.join(', ')}`);
                });
            }
        }
    } catch (error) {
        console.error('❌ خطأ:', error.message);
    }
}

// Run the test
testRecitationAPI().catch(console.error);
