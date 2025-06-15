// اختبار شامل لـ API جلسات التسميع محاكياً للملف PHP الناجح
const baseUrl = 'http://localhost:8000/api';

// ألوان للطباعة الملونة في console
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function info(message) {
    log(`🚀 ${message}`, 'blue');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function warn(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function line(message) {
    log(`   ${message}`, 'cyan');
}

// اختبار أساسي للاتصال
async function testConnection() {
    info('اختبار الاتصال بـ API...');
    
    try {
        const response = await fetch(`${baseUrl}/recitation/sessions`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            success('تم الاتصال بـ API بنجاح');
            line(`إجمالي الجلسات الموجودة: ${data.data?.total || 0}`);
            return true;
        } else {
            error(`فشل الاتصال: ${response.status}`);
            return false;
        }
    } catch (err) {
        error(`خطأ في الاتصال: ${err.message}`);
        return false;
    }
}

// جلب الجلسات الموجودة
async function getExistingSessions() {
    info('جلب الجلسات الموجودة...');
    
    try {
        const response = await fetch(`${baseUrl}/recitation/sessions`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.data.length > 0) {
                success(`تم جلب ${data.data.data.length} جلسة`);
                
                // عرض أول 3 جلسات
                data.data.data.slice(0, 3).forEach((session, index) => {
                    line(`${index + 1}. ${session.session_id}: ${session.student?.name || 'غير محدد'} - ${session.grade}/10 (${session.evaluation})`);
                });
                
                return data.data.data;
            } else {
                warn('لا توجد جلسات');
                return [];
            }
        } else {
            error(`فشل جلب الجلسات: ${response.status}`);
            return [];
        }
    } catch (err) {
        error(`خطأ في جلب الجلسات: ${err.message}`);
        return [];
    }
}

// اختبار إنشاء جلسة جديدة - باستخدام نفس القيم من الملف PHP
async function testCreateSession() {
    info('1️⃣ اختبار إنشاء جلسة جديدة...');
    
    // استخدام نفس البيانات الموجودة في الملف PHP الناجح
    const sessionData = {
        student_id: 1,
        teacher_id: 1,
        quran_circle_id: 1,
        start_surah_number: 112,
        start_verse: 1,
        end_surah_number: 114,
        end_verse: 6,
        recitation_type: 'حفظ',
        duration_minutes: 20,
        grade: 9.0,
        evaluation: 'ممتاز',
        teacher_notes: 'حفظ المعوذات - جلسة اختبار API'
    };

    try {
        line('إرسال البيانات التالية:');
        line(JSON.stringify(sessionData, null, 2));
        
        const response = await fetch(`${baseUrl}/recitation/sessions`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });

        const responseText = await response.text();
        line(`استجابة الخادم: ${responseText}`);

        if (response.ok) {
            const data = JSON.parse(responseText);
            if (data.success) {
                success(`نجح إنشاء الجلسة: ${data.session_id}`);
                line(`📊 معرف الجلسة: ${data.data.session_id}`);
                line(`📊 الطالب: ${data.data.student?.name || 'غير محدد'}`);
                line(`📊 الدرجة: ${data.data.grade}/10`);
                line(`📊 التقدير: ${data.data.evaluation}`);
                return data.session_id;
            } else {
                error(`فشل الإنشاء: ${data.message}`);
                if (data.errors) {
                    Object.keys(data.errors).forEach(field => {
                        error(`- ${field}: ${data.errors[field].join(', ')}`);
                    });
                }
                return null;
            }
        } else {
            error(`فشل الطلب: ${response.status} - ${response.statusText}`);
            try {
                const errorData = JSON.parse(responseText);
                if (errorData.errors) {
                    Object.keys(errorData.errors).forEach(field => {
                        error(`- ${field}: ${errorData.errors[field].join(', ')}`);
                    });
                }
            } catch (e) {
                // تجاهل خطأ parsing
            }
            return null;
        }
    } catch (err) {
        error(`خطأ في الاتصال: ${err.message}`);
        return null;
    }
}

// اختبار إنشاء جلسة باستخدام البيانات المحفوظة
async function testCreateWithSavedData() {
    info('2️⃣ اختبار إنشاء جلسة باستخدام البيانات المحفوظة...');
    
    // قراءة البيانات المحفوظة
    try {
        const fs = require('fs');
        const savedData = JSON.parse(fs.readFileSync('session-data.json', 'utf8'));
        
        // استخدام أول جلسة كمرجع
        if (savedData.length > 0) {
            const referenceSession = savedData[0];
            
            const sessionData = {
                student_id: referenceSession.student_id,
                teacher_id: referenceSession.teacher_id,
                quran_circle_id: referenceSession.quran_circle_id,
                start_surah_number: 1,
                start_verse: 1,
                end_surah_number: 1,
                end_verse: 7,
                recitation_type: 'حفظ',
                duration_minutes: 15,
                grade: 9.5,
                evaluation: 'ممتاز',
                teacher_notes: 'اختبار بالبيانات المحفوظة - سورة الفاتحة'
            };

            line('استخدام البيانات المحفوظة:');
            line(JSON.stringify(sessionData, null, 2));
            
            const response = await fetch(`${baseUrl}/recitation/sessions`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sessionData)
            });

            const responseText = await response.text();
            line(`استجابة الخادم: ${responseText}`);

            if (response.ok) {
                const data = JSON.parse(responseText);
                if (data.success) {
                    success(`نجح إنشاء الجلسة بالبيانات المحفوظة: ${data.session_id}`);
                    return data.session_id;
                } else {
                    error(`فشل الإنشاء: ${data.message}`);
                    return null;
                }
            } else {
                error(`فشل الطلب: ${response.status}`);
                return null;
            }
        } else {
            warn('لا توجد بيانات محفوظة');
            return null;
        }
    } catch (err) {
        error(`خطأ في قراءة البيانات المحفوظة: ${err.message}`);
        return null;
    }
}

// اختبار جلب جلسة محددة
async function testGetSpecificSession(sessionId) {
    if (!sessionId) {
        warn('لا يوجد معرف جلسة للاختبار');
        return;
    }
    
    info('3️⃣ اختبار جلب جلسة محددة...');
    
    try {
        const response = await fetch(`${baseUrl}/recitation/sessions/${sessionId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                success(`نجح جلب الجلسة: ${sessionId}`);
                const session = data.data;
                line(`📊 الطالب: ${session.student?.name || 'غير محدد'}`);
                line(`📊 المعلم: ${session.teacher?.name || 'غير محدد'}`);
                line(`📊 النطاق: سورة ${session.start_surah_number} آية ${session.start_verse} - سورة ${session.end_surah_number} آية ${session.end_verse}`);
                line(`📊 النوع: ${session.recitation_type}`);
                line(`📊 الدرجة: ${session.grade}/10`);
                line(`📊 التقدير: ${session.evaluation}`);
                line(`📊 أخطاء: ${session.has_errors ? 'نعم' : 'لا'}`);
                
                if (session.teacher_notes) {
                    line(`📝 ملاحظات: ${session.teacher_notes}`);
                }
            } else {
                error(`فشل جلب الجلسة: ${data.message}`);
            }
        } else {
            error(`فشل الطلب: ${response.status}`);
        }
    } catch (err) {
        error(`خطأ في الاتصال: ${err.message}`);
    }
}

// اختبار إضافة خطأ للجلسة
async function testAddError(sessionId) {
    if (!sessionId) {
        warn('لا يوجد معرف جلسة لإضافة خطأ');
        return;
    }
    
    info('4️⃣ اختبار إضافة خطأ للجلسة...');
    
    const errorData = {
        session_id: sessionId,
        error_type: 'نطق',
        error_description: 'خطأ في نطق كلمة "الرحمن"',
        surah_number: 1,
        verse_number: 3,
        word_position: 2,
        severity: 'متوسط',
        correction_provided: true,
        notes: 'تم تصحيح النطق مباشرة'
    };
    
    try {
        line('إضافة خطأ:');
        line(JSON.stringify(errorData, null, 2));
        
        const response = await fetch(`${baseUrl}/recitation/errors`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        });

        const responseText = await response.text();
        line(`استجابة الخادم: ${responseText}`);

        if (response.ok) {
            const data = JSON.parse(responseText);
            if (data.success) {
                success(`تم إضافة الخطأ بنجاح`);
            } else {
                error(`فشل إضافة الخطأ: ${data.message}`);
            }
        } else {
            error(`فشل الطلب: ${response.status}`);
        }
    } catch (err) {
        error(`خطأ في الاتصال: ${err.message}`);
    }
}

// الدالة الرئيسية
async function runCompleteTest() {
    console.clear();
    info('🚀 بدء الاختبار الشامل لـ API جلسات التسميع...');
    console.log('');
    
    // 1. اختبار الاتصال
    const connected = await testConnection();
    if (!connected) {
        error('فشل الاتصال - إنهاء الاختبار');
        return;
    }
    
    console.log('');
    
    // 2. جلب الجلسات الموجودة
    await getExistingSessions();
    
    console.log('');
    
    // 3. اختبار إنشاء جلسة جديدة
    const newSessionId = await testCreateSession();
    
    console.log('');
    
    // 4. اختبار إنشاء جلسة بالبيانات المحفوظة
    const savedSessionId = await testCreateWithSavedData();
    
    console.log('');
    
    // 5. اختبار جلب جلسة محددة
    const testSessionId = newSessionId || savedSessionId;
    await testGetSpecificSession(testSessionId);
    
    console.log('');
    
    // 6. اختبار إضافة خطأ
    await testAddError(testSessionId);
    
    console.log('');
    info('🎉 انتهى الاختبار الشامل!');
}

// تشغيل الاختبار
runCompleteTest().catch(err => {
    error(`خطأ عام في الاختبار: ${err.message}`);
});
