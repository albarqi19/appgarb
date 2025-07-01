// 🎯 اختبار API تتبع المعلم مع تسجيل الدخول
console.log('🎯 اختبار API تتبع المعلم مع تسجيل الدخول');
console.log('='.repeat(60));
console.log('');

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app';

// بيانات تسجيل دخول المشرف
const supervisorCredentials = [
    { identity_number: "1234567890", password: "password123" },
    { identity_number: "1074554779", password: "123456" },
    { identity_number: "1111111111", password: "supervisor123" },
    { identity_number: "2222222222", password: "admin123" }
];

// دالة لتسجيل دخول المشرف
async function loginSupervisor() {
    console.log('🔐 محاولة تسجيل دخول المشرف...');
    
    for (const credential of supervisorCredentials) {
        console.log(`🔄 محاولة تسجيل دخول برقم هوية: ${credential.identity_number}`);
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/supervisor/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify(credential)
                }
            );

            if (!response.ok) {
                console.log(`   ❌ فشل التسجيل - HTTP ${response.status}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            if (data.success && data.data.token) {
                console.log(`✅ نجح تسجيل الدخول! Token: ${data.data.token.substring(0, 20)}...`);
                return {
                    token: data.data.token,
                    user: data.data.user
                };
            } else {
                console.log(`   ❌ فشل التسجيل: ${data.message || 'خطأ غير محدد'}`);
            }
        } catch (error) {
            console.log(`   ❌ خطأ في التسجيل: ${error.message}`);
        }
    }
    
    return null;
}

// دالة لاختبار API نشاط المعلمين اليومي
async function testTeacherDailyActivity(token, supervisorId) {
    console.log('');
    console.log('📊 اختبار API نشاط المعلمين اليومي:');
    console.log(`المشرف ID: ${supervisorId}`);
    console.log('التاريخ: 2025-07-01');
    console.log('');

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/supervisors/teachers-daily-activity?supervisor_id=${supervisorId}&date=2025-07-01`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('✅ API يعمل بنجاح!');
            console.log('');

            const summary = data.data.summary;
            console.log('📋 ملخص النشاط:');
            console.log(`   إجمالي المعلمين: ${summary.total_teachers}`);
            console.log(`   المعلمين النشطين: ${summary.active_teachers}`);
            console.log(`   سجلوا الحضور: ${summary.attendance_recorded}`);
            console.log(`   سجلوا التسميع: ${summary.recitation_recorded}`);
            console.log(`   معدل الإنجاز: ${summary.completion_rate}%`);
            console.log(`   نسبة التحضير: ${summary.attendance_percentage}%`);
            console.log(`   نسبة التسميع: ${summary.recitation_percentage}%`);
            console.log('');

            if (data.data.teachers_activity && data.data.teachers_activity.length > 0) {
                console.log('👥 تفاصيل المعلمين:');
                data.data.teachers_activity.forEach(teacher => {
                    const activity = teacher.daily_activity;
                    console.log(`   📚 المعلم: ${teacher.teacher_name}`);
                    console.log(`      الحلقة: ${teacher.circle?.name || 'غير محدد'}`);
                    console.log(`      المسجد: ${teacher.mosque?.name || 'غير محدد'}`);
                    console.log(`      الحالة: ${activity.activity_status}`);
                    console.log(`      التحضير: ${activity.attendance_recorded ? `تم (${activity.attendance_percentage}%)` : 'لم يتم'}`);
                    console.log(`      التسميع: ${activity.recitation_recorded ? `تم (${activity.recitation_percentage}%)` : 'لم يتم'}`);
                    console.log(`      الطلاب: ${activity.students_count}`);
                    console.log(`      الملخص: ${activity.details.completion_summary}`);
                    console.log('');
                });
            } else {
                console.log('ℹ️ لا توجد بيانات معلمين لهذا المشرف');
                console.log('');
            }

            return true;

        } else {
            console.log(`❌ فشل API: ${data.message}`);
            return false;
        }

    } catch (error) {
        console.log(`❌ خطأ: ${error.message}`);
        return false;
    }
}

// دالة لاختبار API إحصائيات المعلمين
async function testTeachersActivityStatistics(token, supervisorId) {
    console.log('='.repeat(60));
    console.log('📊 اختبار API إحصائيات المعلمين:');
    console.log('='.repeat(60));
    console.log('');

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/supervisors/teachers-activity-statistics?supervisor_id=${supervisorId}&start_date=2025-06-24&end_date=2025-07-01`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('✅ API الإحصائيات يعمل بنجاح!');
            console.log('');

            if (data.data.overall_summary) {
                const summary = data.data.overall_summary;
                console.log('📈 الملخص العام:');
                console.log(`   إجمالي المعلمين: ${summary.total_teachers}`);
                console.log(`   متوسط أيام التحضير: ${summary.average_attendance_days}`);
                console.log(`   متوسط أيام التسميع: ${summary.average_recitation_days}`);
                console.log(`   متوسط الأداء: ${summary.average_performance_score}`);
                console.log(`   معدل التحضير: ${summary.attendance_rate}%`);
                console.log(`   معدل التسميع: ${summary.recitation_rate}%`);
                console.log('');
            }

            if (data.data.teachers_statistics && data.data.teachers_statistics.length > 0) {
                console.log('👨‍🏫 إحصائيات المعلمين:');
                data.data.teachers_statistics.forEach(teacher => {
                    console.log(`   📚 المعلم: ${teacher.teacher_name}`);
                    console.log(`      أيام التحضير: ${teacher.attendance_days}`);
                    console.log(`      أيام التسميع: ${teacher.recitation_days}`);
                    console.log(`      درجة الأداء: ${teacher.performance_score}%`);
                    console.log(`      معدل التحضير: ${teacher.attendance_rate}%`);
                    console.log(`      معدل التسميع: ${teacher.recitation_rate}%`);
                    console.log('');
                });
            }

            return true;

        } else {
            console.log(`❌ فشل API الإحصائيات: ${data.message}`);
            return false;
        }

    } catch (error) {
        console.log(`❌ خطأ في الإحصائيات: ${error.message}`);
        return false;
    }
}

// دالة لاختبار API بدون مصادقة (للمقارنة)
async function testWithoutAuth() {
    console.log('='.repeat(60));
    console.log('🔍 اختبار API بدون مصادقة (للمقارنة):');
    console.log('='.repeat(60));
    console.log('');

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/supervisors/teachers-daily-activity?supervisor_id=1&date=2025-07-01`,
            {
                headers: {
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            }
        );

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.status === 401) {
            console.log('✅ نتيجة متوقعة - API يتطلب مصادقة');
        } else {
            const data = await response.json();
            console.log('📊 البيانات:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.log(`❌ خطأ: ${error.message}`);
    }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
    // تسجيل دخول المشرف
    const loginResult = await loginSupervisor();
    
    if (!loginResult) {
        console.log('❌ فشل في تسجيل دخول المشرف - لا يمكن متابعة الاختبارات');
        await testWithoutAuth();
        return;
    }
    
    const supervisorId = loginResult.user?.id || 1;
    console.log(`👤 المشرف: ${loginResult.user?.name || 'غير محدد'} (ID: ${supervisorId})`);
    
    // تشغيل اختبارات API
    const dailyActivityResult = await testTeacherDailyActivity(loginResult.token, supervisorId);
    const statisticsResult = await testTeachersActivityStatistics(loginResult.token, supervisorId);
    
    // عرض النتيجة النهائية
    console.log('='.repeat(60));
    console.log('📋 ملخص نتائج الاختبارات:');
    console.log('='.repeat(60));
    console.log(`✅ تسجيل الدخول: نجح`);
    console.log(`${dailyActivityResult ? '✅' : '❌'} API النشاط اليومي: ${dailyActivityResult ? 'نجح' : 'فشل'}`);
    console.log(`${statisticsResult ? '✅' : '❌'} API الإحصائيات: ${statisticsResult ? 'نجح' : 'فشل'}`);
    console.log('');
    console.log('🔗 APIs المتاحة:');
    console.log('1. النشاط اليومي: GET /api/supervisors/teachers-daily-activity');
    console.log('2. الإحصائيات: GET /api/supervisors/teachers-activity-statistics');
    console.log('');
    console.log('✨ انتهى اختبار APIs تتبع المعلم!');
}

// تشغيل الاختبارات
runAllTests().catch(error => {
    console.error('❌ خطأ عام في الاختبارات:', error);
});
