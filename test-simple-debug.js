// اختبار مبسط للـ API بحسب TestRecitationSessionsApi.php
console.log('🎯 بدء اختبار جلسات التسميع...');

const http = require('http');

// وظيفة مساعدة للطلبات
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: '/api' + path,
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        success: false
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTest() {
    console.log('\n=== 1. فحص البيانات الموجودة ===');
    
    try {
        const response = await makeRequest('GET', '/recitation/sessions');
        console.log(`📊 HTTP Status: ${response.status}`);
        
        if (response.success && response.data.success) {
            const sessions = response.data.data?.data || [];
            console.log(`✅ تم جلب ${sessions.length} جلسة`);
            
            if (sessions.length > 0) {
                const first = sessions[0];
                console.log('📋 أول جلسة:');
                console.log(`  - Session ID: ${first.session_id}`);
                console.log(`  - Student ID: ${first.student_id}`);
                console.log(`  - Teacher ID: ${first.teacher_id}`);
                console.log(`  - Recitation Type: "${first.recitation_type}"`);
                console.log(`  - Evaluation: "${first.evaluation}"`);
                console.log(`  - Grade: ${first.grade}`);
            }
        } else {
            console.log('❌ فشل جلب البيانات:', response.data);
        }
    } catch (error) {
        console.log('❌ خطأ في الاتصال:', error.message);
    }

    console.log('\n=== 2. اختبار إنشاء جلسة جديدة ===');
    
    // البيانات بنفس القيم من ملف PHP
    const sessionData = {
        student_id: 1,
        teacher_id: 1,
        quran_circle_id: 1,
        start_surah_number: 2,
        start_verse: 1,
        end_surah_number: 2,
        end_verse: 50,
        recitation_type: 'حفظ',
        duration_minutes: 15,
        grade: 8.5,
        evaluation: 'جيد جداً',
        teacher_notes: 'أداء جيد مع بعض الأخطاء البسيطة'
    };
    
    try {
        console.log('📤 إرسال البيانات...');
        const response = await makeRequest('POST', '/recitation/sessions', sessionData);
        
        console.log(`📨 HTTP Status: ${response.status}`);
        console.log('📨 Response:', JSON.stringify(response.data, null, 2));
        
        if (response.success && response.data.success) {
            console.log('✅ تم إنشاء الجلسة بنجاح!');
            console.log(`Session ID: ${response.data.session_id}`);
        } else {
            console.log('❌ فشل إنشاء الجلسة');
            if (response.data.errors) {
                console.log('🔍 تفاصيل الأخطاء:');
                Object.entries(response.data.errors).forEach(([field, errors]) => {
                    console.log(`  - ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                });
            }
        }
    } catch (error) {
        console.log('❌ خطأ في إنشاء الجلسة:', error.message);
    }

    console.log('\n=== 3. اختبار بقية القيم المسموحة ===');
    
    const recitationTypes = ['حفظ', 'مراجعة صغرى', 'مراجعة كبرى', 'تثبيت'];
    const evaluations = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'];
    
    console.log('📋 أنواع التسميع المتوقعة:', recitationTypes);
    console.log('📋 التقييمات المتوقعة:', evaluations);
    
    // اختبار مجموعة صغيرة
    const testData = {
        student_id: 1,
        teacher_id: 1,
        start_surah_number: 3,
        start_verse: 1,
        end_surah_number: 3,
        end_verse: 20,
        recitation_type: 'مراجعة صغرى',
        duration_minutes: 10,
        grade: 9.0,
        evaluation: 'ممتاز',
        teacher_notes: 'أداء رائع'
    };
    
    try {
        console.log('🧪 اختبار مراجعة صغرى + ممتاز...');
        const response = await makeRequest('POST', '/recitation/sessions', testData);
        
        console.log(`📨 HTTP Status: ${response.status}`);
        
        if (response.success && response.data.success) {
            console.log('✅ نجح! Session ID:', response.data.session_id);
        } else {
            console.log('❌ فشل:', response.data.message || 'خطأ غير محدد');
            if (response.data.errors) {
                Object.entries(response.data.errors).forEach(([field, errors]) => {
                    console.log(`  - ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                });
            }
        }
    } catch (error) {
        console.log('❌ خطأ:', error.message);
    }

    console.log('\n✅ انتهى الاختبار!');
}

runTest().catch(console.error);
