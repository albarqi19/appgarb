/**
 * اختبار مبسط لـ API التسميع والأخطاء - يركز على الـ endpoints المتاحة
 * بناءً على نفس منطق ملف PHP ولكن مع البيانات المتاحة فعلاً
 */

const API_BASE_URL = 'http://localhost:8000/api';

// دوال المساعدة للطباعة
function logInfo(message) {
    console.log(`ℹ️  ${message}`);
}

function logSuccess(message) {
    console.log(`✅ ${message}`);
}

function logError(message) {
    console.log(`❌ ${message}`);
}

function logWarning(message) {
    console.log(`⚠️  ${message}`);
}

function logSeparator(char = '=', length = 80) {
    console.log(char.repeat(length));
}

function logSubSeparator(char = '-', length = 50) {
    console.log(char.repeat(length));
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// جلب الجلسات الموجودة للحصول على البيانات
async function getExistingData() {
    logInfo('📋 جلب البيانات الموجودة من الجلسات...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/recitation/sessions?limit=5`);
        
        if (response.ok) {
            const data = await response.json();
            const sessions = data.data?.data || [];
            
            if (sessions.length > 0) {
                const session = sessions[0];
                logSuccess(`تم العثور على ${sessions.length} جلسة`);
                
                return {
                    student_id: session.student_id,
                    teacher_id: session.teacher_id,
                    circle_id: session.quran_circle_id,
                    sample_session: session
                };
            } else {
                logWarning('لا توجد جلسات محفوظة - سنحتاج لاستخدام قيم افتراضية');
                // استخدام قيم افتراضية من النتائج التي رأيناها في الـ PHP
                return {
                    student_id: 1,
                    teacher_id: 1,
                    circle_id: 1,
                    sample_session: null
                };
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        logError(`خطأ في جلب البيانات: ${error.message}`);
        return null;
    }
}

// اختبار إنشاء جلسة جديدة (مثل PHP)
async function testCreateSession(basicData) {
    logWarning('🗄️ اختبار إنشاء جلسة تلاوة جديدة...');
    logSubSeparator();
    
    logInfo('1️⃣ اختبار إنشاء جلسة تلاوة جديدة...');
    
    // إنشاء session_id مثل PHP
    const now = new Date();
    const dateStr = now.getFullYear() + 
                   String(now.getMonth() + 1).padStart(2, '0') + 
                   String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + 
                   String(now.getMinutes()).padStart(2, '0') + 
                   String(now.getSeconds()).padStart(2, '0');
    const sessionId = `RS-${dateStr}-${timeStr}-TEST`;
    
    // نفس البيانات المستخدمة في ملف PHP
    const sessionData = {
        session_id: sessionId,
        student_id: basicData.student_id,
        teacher_id: basicData.teacher_id,
        quran_circle_id: basicData.circle_id,
        start_surah_number: 1,
        start_verse: 1,
        end_surah_number: 1,
        end_verse: 7,
        recitation_type: 'حفظ',
        grade: 9.0,
        evaluation: 'ممتاز',
        teacher_notes: 'أداء ممتاز في التلاوة - اختبار API JavaScript',
        has_errors: false,
        session_date: now.toISOString()
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/recitation/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        if (response.ok) {
            const result = await response.json();
            logSuccess(`تم إنشاء الجلسة: ${sessionId}`);
            console.log(`   📚 الطالب ID: ${basicData.student_id}`);
            console.log(`   👨‍🏫 المعلم ID: ${basicData.teacher_id}`);
            console.log(`   🎯 الدرجة: ${sessionData.grade}`);
            console.log(`   📊 التقييم: ${sessionData.evaluation}`);
            
            return sessionId;
        } else {
            const error = await response.json();
            logError(`فشل إنشاء الجلسة: ${response.status}`);
            console.log('📄 تفاصيل الخطأ:', JSON.stringify(error, null, 2));
            return null;
        }
    } catch (error) {
        logError(`خطأ في إنشاء الجلسة: ${error.message}`);
        return null;
    }
}

// اختبار استرجاع الجلسات
async function testRetrieveSessions() {
    logInfo('2️⃣ اختبار استرجاع الجلسات...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/recitation/sessions?limit=5`);
        
        if (response.ok) {
            const data = await response.json();
            const sessions = data.data?.data || [];
            
            console.log(`   📋 عدد الجلسات المسترجعة: ${sessions.length}`);
            
            sessions.forEach((session, index) => {
                const studentInfo = session.student ? session.student.name : `Student ID: ${session.student_id}`;
                const evaluation = session.evaluation || 'غير محدد';
                console.log(`   ${index + 1}. ${session.session_id} - ${studentInfo} - ${evaluation}`);
            });
            
            return sessions;
        } else {
            logError(`فشل استرجاع الجلسات: ${response.status}`);
            return [];
        }
    } catch (error) {
        logError(`خطأ في استرجاع الجلسات: ${error.message}`);
        return [];
    }
}

// اختبار إضافة الأخطاء (نفس الأخطاء من ملف PHP)
async function testErrorManagement(sessionId) {
    logWarning('🐛 اختبار إدارة أخطاء التلاوة...');
    logSubSeparator();
    
    if (!sessionId) {
        logError('❌ لا يوجد session_id لإضافة الأخطاء');
        return false;
    }
    
    console.log(`🔍 استخدام الجلسة: ${sessionId}`);
    
    logInfo('1️⃣ اختبار إضافة أخطاء متنوعة...');
    
    // نفس الأخطاء من ملف PHP بالضبط
    const errors = [
        {
            surah_number: 1,
            verse_number: 2,
            word_text: 'الرحمن',
            error_type: 'تجويد',
            correction_note: 'عدم مد الألف في "الرحمن"',
            teacher_note: 'يحتاج مراجعة أحكام المد',
            is_repeated: true,
            severity_level: 'متوسط'
        },
        {
            surah_number: 1,
            verse_number: 3,
            word_text: 'مالك',
            error_type: 'نطق',
            correction_note: 'نطق الكاف غير واضح',
            teacher_note: 'تدريب على مخارج الحروف',
            is_repeated: false,
            severity_level: 'خفيف'
        },
        {
            surah_number: 1,
            verse_number: 4,
            word_text: 'الدين',
            error_type: 'ترتيل',
            correction_note: 'سرعة في القراءة',
            teacher_note: 'التأني في الترتيل',
            is_repeated: true,
            severity_level: 'شديد'
        },
        {
            surah_number: 1,
            verse_number: 6,
            word_text: 'الصراط',
            error_type: 'تشكيل',
            correction_note: 'خطأ في تشكيل الصاد',
            teacher_note: 'مراجعة التشكيل',
            is_repeated: false,
            severity_level: 'متوسط'
        }
    ];
    
    const errorData = {
        session_id: sessionId,
        errors: errors
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/recitation/errors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(errorData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            errors.forEach((error) => {
                logSuccess(`تم إضافة خطأ ${error.error_type} في سورة ${error.surah_number} آية ${error.verse_number}`);
            });
            
            // اختبار استرجاع الأخطاء
            await delay(1000);
            logInfo('2️⃣ اختبار استرجاع أخطاء الجلسة...');
            
            const errorsResponse = await fetch(`${API_BASE_URL}/recitation/errors?session_id=${sessionId}`);
            
            if (errorsResponse.ok) {
                const errorsData = await errorsResponse.json();
                const sessionErrors = errorsData.data?.data || [];
                
                console.log(`   📋 عدد الأخطاء: ${sessionErrors.length}`);
                
                // عرض الأخطاء في جدول مثل PHP
                displayErrorsTable(sessionErrors);
                
                // إحصائيات الأخطاء
                logInfo('3️⃣ إحصائيات أخطاء الجلسة...');
                const errorStats = calculateErrorStats(sessionErrors);
                displayErrorStats(errorStats);
                
                return true;
            } else {
                logError(`فشل استرجاع الأخطاء: ${errorsResponse.status}`);
                return false;
            }
            
        } else {
            const error = await response.json();
            logError(`فشل إضافة الأخطاء: ${response.status}`);
            console.log('📄 تفاصيل الخطأ:', JSON.stringify(error, null, 2));
            return false;
        }
    } catch (error) {
        logError(`خطأ في إدارة الأخطاء: ${error.message}`);
        return false;
    }
}

// عرض الأخطاء في جدول (مثل PHP)
function displayErrorsTable(errors) {
    if (errors.length === 0) {
        console.log("   📋 لا توجد أخطاء في هذه الجلسة");
        return;
    }
    
    console.log("   +" + "-".repeat(95) + "+");
    console.log("   | سورة | آية | الكلمة     | نوع الخطأ | شدة الخطأ | متكرر | ملاحظة التصحيح                          |");
    console.log("   +" + "-".repeat(95) + "+");
    
    errors.forEach((error) => {
        const repeated = error.is_repeated ? 'نعم' : 'لا';
        const line = `   | ${String(error.surah_number).padEnd(4)} | ${String(error.verse_number).padEnd(3)} | ${String(error.word_text || '').substring(0, 10).padEnd(10)} | ${String(error.error_type || '').substring(0, 9).padEnd(9)} | ${String(error.severity_level || '').substring(0, 8).padEnd(8)} | ${repeated.padEnd(4)} | ${String(error.correction_note || '').substring(0, 40).padEnd(40)} |`;
        console.log(line);
    });
    
    console.log("   +" + "-".repeat(95) + "+");
}

// حساب إحصائيات الأخطاء
function calculateErrorStats(errors) {
    if (errors.length === 0) {
        return {};
    }
    
    const byType = {};
    const bySeverity = {};
    let repeated = 0;
    let nonRepeated = 0;
    
    errors.forEach(error => {
        byType[error.error_type] = (byType[error.error_type] || 0) + 1;
        bySeverity[error.severity_level] = (bySeverity[error.severity_level] || 0) + 1;
        
        if (error.is_repeated) {
            repeated++;
        } else {
            nonRepeated++;
        }
    });
    
    return {
        total: errors.length,
        by_type: byType,
        by_severity: bySeverity,
        repeated: repeated,
        non_repeated: nonRepeated
    };
}

// عرض إحصائيات الأخطاء (مثل PHP)
function displayErrorStats(stats) {
    if (Object.keys(stats).length === 0) {
        console.log("   📊 لا توجد أخطاء لحساب الإحصائيات");
        return;
    }
    
    console.log(`   📊 إجمالي الأخطاء: ${stats.total}`);
    
    console.log("   🔸 حسب النوع:");
    Object.entries(stats.by_type).forEach(([type, count]) => {
        console.log(`      - ${type}: ${count} أخطاء`);
    });
    
    console.log("   🎯 حسب الشدة:");
    Object.entries(stats.by_severity).forEach(([severity, count]) => {
        console.log(`      - ${severity}: ${count} أخطاء`);
    });
    
    console.log(`   🔄 الأخطاء المتكررة: ${stats.repeated}`);
    console.log(`   ✨ الأخطاء غير المتكررة: ${stats.non_repeated}`);
}

// عرض الإحصائيات العامة
async function showGeneralStats() {
    logWarning('📊 عرض الإحصائيات العامة...');
    logSubSeparator();
    
    try {
        // جلب جميع الجلسات
        const sessionsResponse = await fetch(`${API_BASE_URL}/recitation/sessions`);
        
        if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            const allSessions = sessionsData.data?.data || [];
            
            logInfo('📈 الإحصائيات العامة:');
            console.log(`   📚 إجمالي الجلسات: ${allSessions.length}`);
            
            // إحصائيات أنواع التلاوة
            const recitationTypes = {};
            allSessions.forEach(session => {
                if (session.recitation_type) {
                    recitationTypes[session.recitation_type] = (recitationTypes[session.recitation_type] || 0) + 1;
                }
            });
            
            logInfo('📖 إحصائيات أنواع التلاوة:');
            Object.entries(recitationTypes).forEach(([type, count]) => {
                console.log(`   🔹 ${type}: ${count} جلسة`);
            });
            
            // إحصائيات التقييمات
            const evaluations = {};
            allSessions.forEach(session => {
                if (session.evaluation) {
                    evaluations[session.evaluation] = (evaluations[session.evaluation] || 0) + 1;
                }
            });
            
            logInfo('🏆 إحصائيات التقييمات:');
            Object.entries(evaluations)
                .sort(([,a], [,b]) => b - a)
                .forEach(([evaluation, count]) => {
                    console.log(`   🌟 ${evaluation}: ${count} جلسة`);
                });
            
            // أحدث الجلسات
            logInfo('🕒 أحدث 5 جلسات:');
            const recentSessions = allSessions.slice(0, 5);
            
            recentSessions.forEach((session, index) => {
                const hasErrors = session.has_errors ? '⚠️' : '✅';
                const studentInfo = session.student ? session.student.name : `Student ID: ${session.student_id}`;
                const evaluation = session.evaluation || 'غير محدد';
                console.log(`   ${index + 1}. ${session.session_id} - ${studentInfo} - ${evaluation} ${hasErrors}`);
            });
        }
        
        // جلب إحصائيات الأخطاء
        const errorsResponse = await fetch(`${API_BASE_URL}/recitation/errors`);
        
        if (errorsResponse.ok) {
            const errorsData = await errorsResponse.json();
            const allErrors = errorsData.data?.data || [];
            
            console.log(`   🐛 إجمالي الأخطاء: ${allErrors.length}`);
            
            if (allErrors.length > 0) {
                // إحصائيات أنواع الأخطاء
                const errorTypes = {};
                allErrors.forEach(error => {
                    if (error.error_type) {
                        errorTypes[error.error_type] = (errorTypes[error.error_type] || 0) + 1;
                    }
                });
                
                logInfo('🐛 إحصائيات أنواع الأخطاء:');
                Object.entries(errorTypes)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([type, count]) => {
                        console.log(`   🔸 ${type}: ${count} خطأ`);
                    });
                
                // إحصائيات شدة الأخطاء
                const severityLevels = {};
                allErrors.forEach(error => {
                    if (error.severity_level) {
                        severityLevels[error.severity_level] = (severityLevels[error.severity_level] || 0) + 1;
                    }
                });
                
                logInfo('⚡ إحصائيات شدة الأخطاء:');
                Object.entries(severityLevels).forEach(([severity, count]) => {
                    console.log(`   🎯 ${severity}: ${count} خطأ`);
                });
            }
        }
        
    } catch (error) {
        logError(`خطأ في عرض الإحصائيات: ${error.message}`);
    }
}

// الدالة الرئيسية (مشابهة لـ PHP)
async function runComprehensiveTest() {
    console.log('🚀 بدء الاختبار الشامل لنظام جلسات التلاوة والأخطاء...');
    logSeparator();
    
    try {
        // 1. جلب البيانات الموجودة
        const basicData = await getExistingData();
        if (!basicData) {
            logError('❌ فشل في الحصول على البيانات الأساسية');
            return;
        }
        
        await delay(1000);
        
        // 2. اختبار إنشاء جلسة جديدة
        const sessionId = await testCreateSession(basicData);
        
        await delay(1000);
        
        // 3. اختبار استرجاع الجلسات
        await testRetrieveSessions();
        
        await delay(1000);
        
        // 4. اختبار إدارة الأخطاء (إذا تم إنشاء الجلسة بنجاح)
        if (sessionId) {
            await testErrorManagement(sessionId);
            await delay(1000);
        }
        
        // 5. عرض الإحصائيات العامة
        await showGeneralStats();
        
        console.log('\n🎉 انتهى الاختبار الشامل بنجاح!');
        
    } catch (error) {
        logError(`خطأ عام في الاختبار: ${error.message}`);
        console.error(error);
    }
}

// تشغيل الاختبار
console.log('🔥 بدء تشغيل ملف الاختبار...');
runComprehensiveTest().catch(error => {
    console.error('❌ خطأ في تشغيل الاختبار:', error);
});
