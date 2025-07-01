// 🎯 اختبار API تتبع المعلم - الحضور والتسميع
console.log('🎯 اختبار API تتبع المعلم - الحضور والتسميع');
console.log('='.repeat(60));
console.log('');

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app';

// دالة لاختبار API نشاط المعلمين اليومي
async function testTeacherDailyActivity() {
    console.log('📊 اختبار API نشاط المعلمين اليومي:');
    console.log('المشرف ID: 1');
    console.log('التاريخ: 2025-07-01');
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

        } else {
            console.log(`❌ فشل API: ${data.message}`);
        }

    } catch (error) {
        console.log(`❌ خطأ: ${error.message}`);
    }
}

// دالة لاختبار API إحصائيات المعلمين
async function testTeachersActivityStatistics() {
    console.log('='.repeat(60));
    console.log('📊 اختبار API إحصائيات المعلمين:');
    console.log('='.repeat(60));
    console.log('');

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/supervisors/teachers-activity-statistics?supervisor_id=1&start_date=2025-06-24&end_date=2025-07-01`,
            {
                headers: {
                    'Accept': 'application/json',
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

        } else {
            console.log(`❌ فشل API الإحصائيات: ${data.message}`);
        }

    } catch (error) {
        console.log(`❌ خطأ في الإحصائيات: ${error.message}`);
    }
}

// دالة لاختبار API مع معرفات مختلفة
async function testWithDifferentIds() {
    console.log('='.repeat(60));
    console.log('🔍 اختبار API مع معرفات مختلفة:');
    console.log('='.repeat(60));
    console.log('');

    const supervisorIds = [1, 2, 3];
    
    for (const supervisorId of supervisorIds) {
        console.log(`🔸 اختبار المشرف ID: ${supervisorId}`);
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/supervisors/teachers-daily-activity?supervisor_id=${supervisorId}&date=2025-07-01`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    }
                }
            );

            if (!response.ok) {
                console.log(`   ❌ HTTP ${response.status}: ${response.statusText}`);
                continue;
            }

            const data = await response.json();

            if (data.success) {
                const summary = data.data.summary;
                console.log(`   ✅ نجح - معلمين: ${summary.total_teachers}, نشطين: ${summary.active_teachers}`);
            } else {
                console.log(`   ❌ فشل: ${data.message}`);
            }

        } catch (error) {
            console.log(`   ❌ خطأ: ${error.message}`);
        }
        
        console.log('');
    }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
    await testTeacherDailyActivity();
    await testTeachersActivityStatistics();
    await testWithDifferentIds();
    
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
