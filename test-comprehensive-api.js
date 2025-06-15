// Test API بناءً على TestRecitationSessionsApi.php
const http = require('http');

// Base configuration
const config = {
    baseUrl: 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

// Helper function for HTTP requests
async function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(config.baseUrl + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: config.headers
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
                        success: false,
                        error: 'JSON Parse Error'
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Test functions following PHP structure

/**
 * فحص البيانات الأساسية
 */
async function checkBasicData() {
    console.log('=== 1. فحص البيانات الأساسية ===');
    
    try {
        // Test connection first
        const response = await makeRequest('GET', '/recitation/sessions');
        
        if (response.success && response.data.success) {
            const sessions = response.data.data?.data || response.data.sessions || [];
            console.log(`✅ الاتصال بـ API ناجح`);
            console.log(`📊 عدد الجلسات الموجودة: ${sessions.length}`);
            
            if (sessions.length > 0) {
                const firstSession = sessions[0];
                console.log('\n📋 بنية أول جلسة:');
                console.log(`- Session ID: ${firstSession.session_id || firstSession.id}`);
                console.log(`- Student ID: ${firstSession.student_id}`);
                console.log(`- Teacher ID: ${firstSession.teacher_id}`);
                console.log(`- Recitation Type: "${firstSession.recitation_type}"`);
                console.log(`- Evaluation: "${firstSession.evaluation}"`);
                console.log(`- Grade: ${firstSession.grade}`);
                
                return firstSession;
            } else {
                console.log('⚠️ لا توجد جلسات موجودة');
            }
        } else {
            console.log('❌ فشل الاتصال بـ API');
            console.log('Response:', response);
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال:', error.message);
    }
    
    console.log('');
    return null;
}

/**
 * اختبار إنشاء جلسة تسميع مباشرة (محاكاة Model::create)
 */
async function testDirectSessionCreation() {
    console.log('=== 2. اختبار إنشاء جلسة تسميع مباشرة ===');
    
    // البيانات كما في الـ PHP بالضبط
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
        console.log('📤 إرسال البيانات:', JSON.stringify(sessionData, null, 2));
        
        const response = await makeRequest('POST', '/recitation/sessions', sessionData);
        
        console.log(`📨 HTTP Status: ${response.status}`);
        
        if (response.success && response.data.success) {
            console.log('✅ تم إنشاء الجلسة بنجاح!');
            console.log(`Session ID: ${response.data.session_id}`);
            console.log(`Database ID: ${response.data.data?.id || 'N/A'}`);
            console.log(`الدرجة: ${response.data.data?.grade || sessionData.grade}`);
            console.log(`التقييم: ${response.data.data?.evaluation || sessionData.evaluation}`);
            
            return response.data.session_id;
        } else {
            console.log('❌ خطأ في إنشاء الجلسة');
            console.log('Response:', JSON.stringify(response.data, null, 2));
            
            if (response.data.errors) {
                console.log('\n📋 تفاصيل الأخطاء:');
                Object.entries(response.data.errors).forEach(([field, errors]) => {
                    console.log(`- ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                });
            }
        }
    } catch (error) {
        console.error('❌ خطأ في إنشاء الجلسة:', error.message);
    }
    
    console.log('');
    return null;
}

/**
 * اختبار Controller (محاكاة Controller::store)
 */
async function testController() {
    console.log('=== 3. اختبار Controller ===');
    
    // بيانات مختلفة كما في الـ PHP
    const requestData = {
        student_id: 1,
        teacher_id: 1,
        quran_circle_id: 1,
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
        console.log('📤 اختبار Controller مع البيانات:', JSON.stringify(requestData, null, 2));
        
        const response = await makeRequest('POST', '/recitation/sessions', requestData);
        
        console.log('✅ Controller Response:');
        console.log(`📨 HTTP Status: ${response.status}`);
        
        if (response.success && response.data.success) {
            console.log('✅ نجح إنشاء الجلسة عبر Controller');
            console.log(`Session ID: ${response.data.session_id}`);
            console.log(`Message: ${response.data.message}`);
            
            return response.data.session_id;
        } else {
            console.log('❌ فشل Controller');
            console.log(`Message: ${response.data.message}`);
            
            if (response.data.errors) {
                console.log('\n📋 تفاصيل الأخطاء:');
                Object.entries(response.data.errors).forEach(([field, errors]) => {
                    console.log(`- ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                });
            }
        }
    } catch (error) {
        console.error('❌ خطأ في Controller:', error.message);
    }
    
    console.log('');
    return null;
}

/**
 * عرض الجلسات الموجودة
 */
async function showExistingSessions() {
    console.log('=== 4. عرض جميع الجلسات الموجودة ===');
    
    try {
        const response = await makeRequest('GET', '/recitation/sessions');
        
        if (response.success && response.data.success) {
            const sessions = response.data.data?.data || response.data.sessions || [];
            
            console.log(`عدد الجلسات الإجمالي: ${sessions.length}`);
            
            if (sessions.length > 0) {
                console.log('\n📋 آخر الجلسات:');
                console.log('Session ID | طالب | معلم | نوع التسميع | الدرجة | التقييم | التاريخ');
                console.log('---------|------|------|-----------|-------|--------|--------');
                
                sessions.slice(0, 5).forEach(session => {
                    const sessionId = session.session_id || session.id || 'N/A';
                    const studentName = session.student?.name || session.student_name || 'غير محدد';
                    const teacherName = session.teacher?.name || session.teacher_name || 'غير محدد';
                    const recitationType = session.recitation_type || 'N/A';
                    const grade = session.grade || 'N/A';
                    const evaluation = session.evaluation || 'N/A';
                    const date = session.created_at ? new Date(session.created_at).toLocaleString('ar-SA') : 'N/A';
                    
                    console.log(`${sessionId} | ${studentName} | ${teacherName} | ${recitationType} | ${grade} | ${evaluation} | ${date}`);
                });
            } else {
                console.log('⚠️ لا توجد جلسات تسميع حالياً');
            }
        } else {
            console.log('❌ فشل جلب الجلسات');
            console.log('Response:', response);
        }
    } catch (error) {
        console.error('❌ خطأ في جلب الجلسات:', error.message);
    }
    
    console.log('');
}

/**
 * اختبار قيم مختلفة للحقول
 */
async function testDifferentValues() {
    console.log('=== 5. اختبار قيم مختلفة للحقول ===');
    
    const recitationTypes = ['حفظ', 'مراجعة صغرى', 'مراجعة كبرى', 'تثبيت'];
    const evaluations = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'];
    
    console.log('🧪 اختبار كل نوع تسميع مع كل تقييم...\n');
    
    for (let i = 0; i < Math.min(recitationTypes.length, 2); i++) {
        for (let j = 0; j < Math.min(evaluations.length, 2); j++) {
            const testData = {
                student_id: 1,
                teacher_id: 1,
                start_surah_number: 1,
                start_verse: 1,
                end_surah_number: 1,
                end_verse: 7,
                recitation_type: recitationTypes[i],
                evaluation: evaluations[j],
                grade: 8.0,
                duration_minutes: 10
            };
            
            console.log(`🔍 اختبار: ${recitationTypes[i]} + ${evaluations[j]}`);
            
            try {
                const response = await makeRequest('POST', '/recitation/sessions', testData);
                
                if (response.success && response.data.success) {
                    console.log(`   ✅ نجح! Session ID: ${response.data.session_id}`);
                } else {
                    console.log(`   ❌ فشل: ${response.data.message || 'خطأ غير محدد'}`);
                    if (response.data.errors) {
                        Object.entries(response.data.errors).forEach(([field, errors]) => {
                            console.log(`      - ${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
                        });
                    }
                }
            } catch (error) {
                console.log(`   ❌ خطأ: ${error.message}`);
            }
            
            // توقف قصير بين الطلبات
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    console.log('');
}

// Main test execution
async function runTests() {
    console.log('🎯 بدء اختبار جلسات التسميع...\n');
    
    // 1. فحص البيانات الأساسية
    const existingSession = await checkBasicData();
    
    // 2. اختبار إنشاء جلسة تسميع مباشرة
    const newSession1 = await testDirectSessionCreation();
    
    // 3. اختبار Controller
    const newSession2 = await testController();
    
    // 4. عرض الجلسات الموجودة
    await showExistingSessions();
    
    // 5. اختبار قيم مختلفة
    await testDifferentValues();
    
    console.log('✅ انتهى الاختبار!');
}

// Run the tests
runTests().catch(error => {
    console.error('❌ خطأ عام في الاختبار:', error);
});
