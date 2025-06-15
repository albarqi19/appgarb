/**
 * اختبار شامل لنظام جلسات التلاوة والأخطاء - مبني على نفس منطق ملف PHP
 * 🚀 يحاكي نفس الاختبارات الموجودة في Laravel Command
 */

const API_BASE_URL = 'http://localhost:8000/api';

// إعدادات التوقيت والانتظار
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// دالة لطباعة النتائج بتنسيق مشابه للـ PHP
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

// دالة للحصول على البيانات الأساسية
async function fetchBasicData() {
    logInfo('📋 التحقق من البيانات الأساسية...');
    
    try {
        // جلب بيانات الطلاب
        const studentsResponse = await fetch(`${API_BASE_URL}/students`);
        const studentsData = await studentsResponse.json();
        const studentsCount = studentsData.data?.data?.length || 0;
        
        // جلب بيانات المعلمين (المستخدمين)
        const teachersResponse = await fetch(`${API_BASE_URL}/users`);
        const teachersData = await teachersResponse.json();
        const teachersCount = teachersData.data?.data?.length || 0;
        
        // جلب بيانات الحلقات
        const circlesResponse = await fetch(`${API_BASE_URL}/circles`);
        const circlesData = await circlesResponse.json();
        const circlesCount = circlesData.data?.data?.length || 0;
        
        console.log(`   👨‍🎓 الطلاب: ${studentsCount}`);
        console.log(`   👨‍🏫 المعلمين: ${teachersCount}`);
        console.log(`   📚 الحلقات: ${circlesCount}`);
        
        // إرجاع أول عنصر من كل نوع للاستخدام في الاختبارات
        const firstStudent = studentsData.data?.data?.[0];
        const firstTeacher = teachersData.data?.data?.[0];
        const firstCircle = circlesData.data?.data?.[0];
        
        if (firstStudent) {
            console.log(`   ✅ أول طالب - ID: ${firstStudent.id}, الاسم: ${firstStudent.name}`);
        }
        
        if (firstTeacher) {
            console.log(`   ✅ أول معلم - ID: ${firstTeacher.id}, الاسم: ${firstTeacher.name}`);
        }
        
        if (firstCircle) {
            console.log(`   ✅ أول حلقة - ID: ${firstCircle.id}, الاسم: ${firstCircle.name}`);
        }
        
        return {
            student: firstStudent,
            teacher: firstTeacher,
            circle: firstCircle
        };
        
    } catch (error) {
        logError(`خطأ في جلب البيانات الأساسية: ${error.message}`);
        return null;
    }
}

// اختبار إنشاء جلسة تلاوة جديدة
async function testCreateSession(basicData) {
    logWarning('🗄️ اختبار إنشاء جلسة تلاوة جديدة...');
    logSubSeparator();
    
    if (!basicData || !basicData.student || !basicData.teacher) {
        logError('❌ لا توجد بيانات أساسية كافية لإجراء الاختبار');
        return null;
    }
    
    logInfo('1️⃣ اختبار إنشاء جلسة تلاوة جديدة...');
    
    // إنشاء session_id مشابه للـ PHP
    const now = new Date();
    const dateStr = now.getFullYear() + 
                   String(now.getMonth() + 1).padStart(2, '0') + 
                   String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + 
                   String(now.getMinutes()).padStart(2, '0') + 
                   String(now.getSeconds()).padStart(2, '0');
    const sessionId = `RS-${dateStr}-${timeStr}-TEST`;
    
    const sessionData = {
        session_id: sessionId,
        student_id: basicData.student.id,
        teacher_id: basicData.teacher.id,
        quran_circle_id: basicData.circle?.id || null,
        start_surah_number: 1,
        start_verse: 1,
        end_surah_number: 1,
        end_verse: 7,
        recitation_type: 'حفظ',
        grade: 9.0,
        evaluation: 'ممتاز',
        teacher_notes: 'أداء ممتاز في التلاوة - اختبار API',
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
            console.log(`   📚 الطالب: ${basicData.student.name}`);
            console.log(`   👨‍🏫 المعلم: ${basicData.teacher.name}`);
            console.log(`   🎯 الدرجة: ${sessionData.grade}`);
            console.log(`   📊 التقييم: ${sessionData.evaluation}`);
            
            return {
                ...result,
                session_id: sessionId
            };
        } else {
            const error = await response.json();
            logError(`فشل إنشاء الجلسة: ${response.status}`);
            console.log('تفاصيل الخطأ:', error);
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
        const response = await fetch(`${API_BASE_URL}/recitation/sessions?limit=5&sort=created_at&order=desc`);
        
        if (response.ok) {
            const data = await response.json();
            const sessions = data.data?.data || [];
            
            console.log(`   📋 عدد الجلسات المسترجعة: ${sessions.length}`);
            
            sessions.forEach((session, index) => {
                const studentName = session.student?.name || 'غير محدد';
                const evaluation = session.evaluation || 'غير محدد';
                console.log(`   ${index + 1}. ${session.session_id} - ${studentName} - ${evaluation}`);
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

// اختبار تحديث الجلسة
async function testUpdateSession(sessionId) {
    if (!sessionId) {
        logError('❌ لا يوجد session_id للتحديث');
        return false;
    }
    
    logInfo('3️⃣ اختبار تحديث جلسة...');
    
    const updateData = {
        teacher_notes: `تم تحديث الملاحظات - ${new Date().toLocaleTimeString('ar-SA')}`,
        grade: 8.5,
        evaluation: 'جيد جداً'
    };
    
    try {
        // نحتاج أولاً للحصول على ID الرقمي للجلسة
        const sessionsResponse = await fetch(`${API_BASE_URL}/recitation/sessions?session_id=${sessionId}`);
        if (!sessionsResponse.ok) {
            logError('❌ لم يتم العثور على الجلسة للتحديث');
            return false;
        }
        
        const sessionsData = await sessionsResponse.json();
        const session = sessionsData.data?.data?.[0];
        
        if (!session) {
            logError('❌ لم يتم العثور على الجلسة للتحديث');
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/recitation/sessions/${session.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            logSuccess(`تم تحديث الجلسة ${sessionId}`);
            console.log(`   📝 الملاحظات الجديدة: ${updateData.teacher_notes}`);
            console.log(`   🎯 الدرجة الجديدة: ${updateData.grade}`);
            return true;
        } else {
            const error = await response.json();
            logError(`فشل تحديث الجلسة: ${response.status}`);
            console.log('تفاصيل الخطأ:', error);
            return false;
        }
    } catch (error) {
        logError(`خطأ في تحديث الجلسة: ${error.message}`);
        return false;
    }
}

// اختبار إدارة الأخطاء
async function testErrorManagement(sessionId) {
    logWarning('🐛 اختبار إدارة أخطاء التلاوة...');
    logSubSeparator();
    
    if (!sessionId) {
        logError('❌ لا يوجد session_id لإضافة الأخطاء');
        return false;
    }
    
    console.log(`🔍 استخدام الجلسة: ${sessionId}`);
    
    // 1. إضافة أخطاء متنوعة (نفس الأخطاء من ملف PHP)
    logInfo('1️⃣ اختبار إضافة أخطاء متنوعة...');
    
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
            
            // 2. اختبار استرجاع الأخطاء
            logInfo('2️⃣ اختبار استرجاع أخطاء الجلسة...');
            await delay(1000); // انتظار قصير للتأكد من حفظ البيانات
            
            const errorsResponse = await fetch(`${API_BASE_URL}/recitation/errors?session_id=${sessionId}`);
            
            if (errorsResponse.ok) {
                const errorsData = await errorsResponse.json();
                const sessionErrors = errorsData.data?.data || [];
                
                console.log(`   📋 عدد الأخطاء: ${sessionErrors.length}`);
                
                // عرض الأخطاء في جدول
                displayErrorsTable(sessionErrors);
                
                // 3. إحصائيات الأخطاء
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
            console.log('تفاصيل الخطأ:', error);
            return false;
        }
    } catch (error) {
        logError(`خطأ في إدارة الأخطاء: ${error.message}`);
        return false;
    }
}

// عرض الأخطاء في جدول (مشابه للـ PHP)
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
        // حسب النوع
        byType[error.error_type] = (byType[error.error_type] || 0) + 1;
        
        // حسب الشدة
        bySeverity[error.severity_level] = (bySeverity[error.severity_level] || 0) + 1;
        
        // المتكرر/غير المتكرر
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

// عرض إحصائيات الأخطاء
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

// اختبار الإحصائيات التفصيلية
async function showDetailedStats() {
    logWarning('📊 عرض الإحصائيات التفصيلية...');
    logSubSeparator();
    
    try {
        // 1. الإحصائيات العامة
        logInfo('📈 الإحصائيات العامة:');
        
        const sessionsResponse = await fetch(`${API_BASE_URL}/recitation/sessions`);
        const errorsResponse = await fetch(`${API_BASE_URL}/recitation/errors`);
        
        if (sessionsResponse.ok && errorsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            const errorsData = await errorsResponse.json();
            
            const sessions = sessionsData.data?.data || [];
            const errors = errorsData.data?.data || [];
            
            const totalSessions = sessions.length;
            const totalErrors = errors.length;
            const sessionsWithErrors = sessions.filter(s => s.has_errors).length;
            const grades = sessions.filter(s => s.grade).map(s => parseFloat(s.grade));
            const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0;
            
            console.log(`   📚 إجمالي الجلسات: ${totalSessions}`);
            console.log(`   🐛 إجمالي الأخطاء: ${totalErrors}`);
            console.log(`   ⚠️ جلسات بها أخطاء: ${sessionsWithErrors}`);
            console.log(`   🎯 متوسط الدرجات: ${avgGrade.toFixed(2)}`);
            
            // 2. إحصائيات أنواع التلاوة
            logInfo('📖 إحصائيات أنواع التلاوة:');
            const recitationTypes = {};
            sessions.forEach(session => {
                if (session.recitation_type) {
                    recitationTypes[session.recitation_type] = (recitationTypes[session.recitation_type] || 0) + 1;
                }
            });
            
            Object.entries(recitationTypes).forEach(([type, count]) => {
                console.log(`   🔹 ${type}: ${count} جلسة`);
            });
            
            // 3. إحصائيات التقييمات
            logInfo('🏆 إحصائيات التقييمات:');
            const evaluations = {};
            sessions.forEach(session => {
                if (session.evaluation) {
                    evaluations[session.evaluation] = (evaluations[session.evaluation] || 0) + 1;
                }
            });
              Object.entries(evaluations)
                .sort(([,a], [,b]) => b - a)
                .forEach(([evaluation, count]) => {
                    console.log(`   🌟 ${evaluation}: ${count} جلسة`);
                });
            
            // 4. إحصائيات أنواع الأخطاء
            if (totalErrors > 0) {
                logInfo('🐛 إحصائيات أنواع الأخطاء:');
                const errorTypes = {};
                errors.forEach(error => {
                    if (error.error_type) {
                        errorTypes[error.error_type] = (errorTypes[error.error_type] || 0) + 1;
                    }
                });
                
                Object.entries(errorTypes)
                    .sort(([,a], [,b]) => b - a)
                    .forEach(([type, count]) => {
                        console.log(`   🔸 ${type}: ${count} خطأ`);
                    });
                
                // 5. إحصائيات شدة الأخطاء
                logInfo('⚡ إحصائيات شدة الأخطاء:');
                const severityLevels = {};
                errors.forEach(error => {
                    if (error.severity_level) {
                        severityLevels[error.severity_level] = (severityLevels[error.severity_level] || 0) + 1;
                    }
                });
                
                Object.entries(severityLevels).forEach(([severity, count]) => {
                    console.log(`   🎯 ${severity}: ${count} خطأ`);
                });
            }
            
            // 6. أحدث الجلسات
            logInfo('🕒 أحدث 5 جلسات:');
            const recentSessions = sessions
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
                
            recentSessions.forEach((session, index) => {
                const hasErrors = session.has_errors ? '⚠️' : '✅';
                const studentName = session.student?.name || 'غير محدد';
                const evaluation = session.evaluation || 'غير محدد';
                console.log(`   ${index + 1}. ${session.session_id} - ${studentName} - ${evaluation} ${hasErrors}`);
            });
        }
        
    } catch (error) {
        logError(`خطأ في عرض الإحصائيات: ${error.message}`);
    }
}

// الدالة الرئيسية
async function runComprehensiveTest() {
    console.log('🚀 بدء الاختبار الشامل لنظام جلسات التلاوة والأخطاء...');
    logSeparator();
    
    try {
        // 1. التحقق من البيانات الأساسية
        const basicData = await fetchBasicData();
        if (!basicData) {
            logError('❌ فشل في الحصول على البيانات الأساسية');
            return;
        }
        
        await delay(1000);
        
        // 2. اختبار إنشاء جلسة جديدة
        const session = await testCreateSession(basicData);
        if (!session) {
            logError('❌ فشل في إنشاء الجلسة');
            return;
        }
        
        await delay(1000);
        
        // 3. اختبار استرجاع الجلسات
        await testRetrieveSessions();
        
        await delay(1000);
        
        // 4. اختبار تحديث الجلسة
        await testUpdateSession(session.session_id);
        
        await delay(1000);
        
        // 5. اختبار إدارة الأخطاء
        await testErrorManagement(session.session_id);
        
        await delay(1000);
        
        // 6. عرض الإحصائيات التفصيلية
        await showDetailedStats();
        
        console.log('\n🎉 انتهى الاختبار الشامل بنجاح!');
        
    } catch (error) {
        logError(`خطأ عام في الاختبار: ${error.message}`);
    }
}

// تشغيل الاختبار
console.log('🔥 بدء تشغيل ملف الاختبار...');
runComprehensiveTest().catch(error => {
    console.error('❌ خطأ في تشغيل الاختبار:', error);
});
