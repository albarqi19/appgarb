/**
 * اختبار سريع للوحة تحكم المشرف مع APIs الحقيقية
 * Test Supervisor Dashboard with Real APIs
 */

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app/api';

// اختبار جميع APIs المشرف
async function testSupervisorAPIs() {
    console.log('🚀 بدء اختبار APIs المشرف...');
    
    const supervisorId = 1;
    const headers = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    };

    try {
        // 1. اختبار لوحة تحكم المشرف
        console.log('\n📊 اختبار لوحة تحكم المشرف...');
        const dashboardResponse = await fetch(`${API_BASE_URL}/supervisor/dashboard`, { headers });
        const dashboardData = await dashboardResponse.json();
        console.log('✅ لوحة التحكم:', dashboardData.success ? 'نجح' : 'فشل');

        // 2. اختبار معلمو المشرف
        console.log('\n👨‍🏫 اختبار معلمو المشرف...');
        const teachersResponse = await fetch(`${API_BASE_URL}/supervisor/teachers?supervisor_id=${supervisorId}`, { headers });
        const teachersData = await teachersResponse.json();
        console.log(`✅ المعلمون: ${teachersData.success ? teachersData.data.length + ' معلم' : 'فشل'}`);

        // 3. اختبار طلاب المشرف
        console.log('\n👨‍🎓 اختبار طلاب المشرف...');
        const studentsResponse = await fetch(`${API_BASE_URL}/supervisor/students?supervisor_id=${supervisorId}`, { headers });
        const studentsData = await studentsResponse.json();
        console.log(`✅ الطلاب: ${studentsData.success ? studentsData.data.length + ' طالب' : 'فشل'}`);

        // 4. اختبار حلقات المشرف
        console.log('\n🔄 اختبار حلقات المشرف...');
        const circlesResponse = await fetch(`${API_BASE_URL}/supervisor/circles?supervisor_id=${supervisorId}`, { headers });
        const circlesData = await circlesResponse.json();
        console.log(`✅ الحلقات: ${circlesData.success ? circlesData.data.length + ' حلقة' : 'فشل'}`);

        // 5. اختبار إحصائيات المشرفين
        console.log('\n📈 اختبار إحصائيات المشرفين...');
        const statsResponse = await fetch(`${API_BASE_URL}/supervisors/statistics`, { headers });
        const statsData = await statsResponse.json();
        console.log('✅ الإحصائيات:', statsData.success ? 'نجح' : 'فشل');

        // عرض ملخص البيانات
        console.log('\n📋 ملخص البيانات:');
        console.log(`- المعلمون: ${teachersData.data?.length || 0}`);
        console.log(`- الطلاب: ${studentsData.data?.length || 0}`);
        console.log(`- الحلقات: ${circlesData.data?.length || 0}`);
        console.log(`- المساجد: ${new Set(circlesData.data?.map(c => c.mosque.id)).size || 0}`);

        // اختبار التكامل - البيانات المطلوبة للوحة التحكم
        console.log('\n🔗 اختبار التكامل - البيانات المطلوبة:');
        
        const requiredData = {
            dashboard: dashboardData.success,
            teachers: teachersData.success && teachersData.data.length > 0,
            students: studentsData.success && studentsData.data.length > 0,
            circles: circlesData.success && circlesData.data.length > 0,
            statistics: statsData.success
        };

        const integrationSuccess = Object.values(requiredData).every(Boolean);
        console.log(`🎯 التكامل الكامل: ${integrationSuccess ? '✅ نجح' : '❌ فشل'}`);

        if (integrationSuccess) {
            console.log('\n🎉 جميع APIs جاهزة للاستخدام في لوحة تحكم المشرف!');
        } else {
            console.log('\n⚠️ بعض APIs تحتاج إصلاح:', Object.entries(requiredData).filter(([k, v]) => !v).map(([k]) => k));
        }

    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
    }
}

// تشغيل الاختبار
testSupervisorAPIs();

// اختبار البيانات التفصيلية للمشرف
async function testSupervisorDataStructure() {
    console.log('\n🔍 اختبار هيكل البيانات التفصيلي...');
    
    const supervisorId = 1;
    const headers = {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    };

    try {
        const studentsResponse = await fetch(`${API_BASE_URL}/supervisor/students?supervisor_id=${supervisorId}`, { headers });
        const studentsData = await studentsResponse.json();
        
        if (studentsData.success && studentsData.data.length > 0) {
            const student = studentsData.data[0];
            console.log('\n👨‍🎓 نموذج بيانات الطالب:');
            console.log(`- الاسم: ${student.name}`);
            console.log(`- العمر: ${student.age}`);
            console.log(`- الدرجة الكلية: ${student.total_score || 'غير محدد'}`);
            console.log(`- الحلقة: ${student.circle.name}`);
            console.log(`- المسجد: ${student.circle.mosque.name}`);
            console.log(`- المعلم: ${student.circle.teacher.name}`);
        }

        const teachersResponse = await fetch(`${API_BASE_URL}/supervisor/teachers?supervisor_id=${supervisorId}`, { headers });
        const teachersData = await teachersResponse.json();
        
        if (teachersData.success && teachersData.data.length > 0) {
            const teacher = teachersData.data[0];
            console.log('\n👨‍🏫 نموذج بيانات المعلم:');
            console.log(`- الاسم: ${teacher.name}`);
            console.log(`- الهاتف: ${teacher.phone}`);
            console.log(`- عدد المساجد: ${teacher.mosques.length}`);
            console.log(`- عدد الحلقات: ${teacher.circles_count}`);
            console.log(`- عدد الطلاب: ${teacher.students_count}`);
            console.log(`- المساجد: ${teacher.mosques.map(m => m.name).join(', ')}`);
        }

    } catch (error) {
        console.error('❌ خطأ في اختبار هيكل البيانات:', error.message);
    }
}

// تشغيل اختبار هيكل البيانات بعد 2 ثانية
setTimeout(testSupervisorDataStructure, 2000);
