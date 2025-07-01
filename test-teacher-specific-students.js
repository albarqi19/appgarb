// اختبار API جلب طلاب معلم محدد في مسجد محدد
const axios = require('axios');

// إعدادات الاختبار
const API_BASE = 'http://localhost:8000/api'; // أو استخدم الرابط الصحيح لل API
const TEACHER_ID = 1; // معرف المعلم للاختبار
const MOSQUE_ID = 1;  // معرف المسجد للاختبار

async function testTeacherSpecificStudents() {
    console.log('🧪 اختبار جلب طلاب معلم محدد في مسجد محدد');
    console.log('=' .repeat(50));
    
    try {
        // 1. API الأساسي - طلاب المعلم في مسجد محدد
        console.log('\n1️⃣ اختبار API: طلاب المعلم في مسجد محدد');
        console.log(`GET ${API_BASE}/teachers/${TEACHER_ID}/mosques/${MOSQUE_ID}/students`);
        
        const response1 = await axios.get(`${API_BASE}/teachers/${TEACHER_ID}/mosques/${MOSQUE_ID}/students`);
        
        console.log('✅ النتيجة:', response1.status);
        console.log('📊 البيانات:', JSON.stringify(response1.data, null, 2));
        
        // تحليل النتائج
        const students = response1.data?.البيانات || response1.data?.data || [];
        console.log(`\n📈 عدد الطلاب المعروضين: ${students.length}`);
        
        if (students.length > 0) {
            console.log('\n👥 عينة من الطلاب:');
            students.slice(0, 3).forEach((student, index) => {
                console.log(`  ${index + 1}. ${student.الاسم || student.name} - ${student.رقم_الطالب || student.student_number}`);
            });
        }
        
    } catch (error) {
        console.error('❌ خطأ في API الأول:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    try {
        // 2. API البديل - جميع مساجد المعلم مع الطلاب
        console.log('\n2️⃣ اختبار API البديل: جميع مساجد المعلم');
        console.log(`GET ${API_BASE}/teachers/${TEACHER_ID}/mosques`);
        
        const response2 = await axios.get(`${API_BASE}/teachers/${TEACHER_ID}/mosques`);
        
        console.log('✅ النتيجة:', response2.status);
        
        const data = response2.data?.البيانات || response2.data?.data;
        const mosques = data?.المساجد || data?.mosques || [];
        
        console.log(`📊 عدد المساجد: ${mosques.length}`);
        
        // البحث عن المسجد المحدد
        const targetMosque = mosques.find(m => m.id === MOSQUE_ID);
        
        if (targetMosque) {
            console.log(`\n🕌 المسجد المستهدف: ${targetMosque.اسم_المسجد || targetMosque.mosque_name}`);
            
            const circles = targetMosque.الحلقات || targetMosque.circles || [];
            console.log(`📚 عدد الحلقات: ${circles.length}`);
            
            let totalStudents = 0;
            circles.forEach(circle => {
                const students = circle.الطلاب || circle.students || [];
                totalStudents += students.length;
                console.log(`  - ${circle.اسم_الحلقة || circle.circle_name}: ${students.length} طالب`);
            });
            
            console.log(`\n👥 إجمالي الطلاب في هذا المسجد: ${totalStudents}`);
        } else {
            console.log(`⚠️ لم يتم العثور على المسجد ${MOSQUE_ID} في قائمة مساجد المعلم`);
        }
        
    } catch (error) {
        console.error('❌ خطأ في API الثاني:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    try {
        // 3. API الحلقات المفصلة
        console.log('\n3️⃣ اختبار API: حلقات المعلم المفصلة');
        console.log(`GET ${API_BASE}/teachers/${TEACHER_ID}/circles-detailed`);
        
        const response3 = await axios.get(`${API_BASE}/teachers/${TEACHER_ID}/circles-detailed`);
        
        console.log('✅ النتيجة:', response3.status);
        
        const data3 = response3.data?.البيانات || response3.data?.data;
        const circles = data3?.الحلقات || data3?.circles || [];
        
        console.log(`📚 عدد الحلقات الإجمالي: ${circles.length}`);
        
        // تصفية الطلاب حسب المسجد
        const mosqueStudents = [];
        circles.forEach(circle => {
            const mosqueName = circle.المسجد?.اسم || circle.mosque?.name;
            const mosqueId = circle.المسجد?.id || circle.mosque?.id;
            
            if (mosqueId === MOSQUE_ID) {
                const students = circle.الطلاب || circle.students || [];
                mosqueStudents.push(...students);
                console.log(`📖 ${circle.اسم_الحلقة || circle.circle_name} في ${mosqueName}: ${students.length} طالب`);
            }
        });
        
        console.log(`\n👥 إجمالي طلاب المعلم في المسجد ${MOSQUE_ID}: ${mosqueStudents.length}`);
        
        if (mosqueStudents.length > 0) {
            console.log('\n📋 تفاصيل الطلاب:');
            mosqueStudents.slice(0, 5).forEach((student, index) => {
                const name = student.الاسم || student.name;
                const studentNumber = student.رقم_الطالب || student.student_number;
                const progress = student.المنهج_الحالي || student.current_curriculum;
                
                console.log(`  ${index + 1}. ${name} (${studentNumber})`);
                if (progress) {
                    console.log(`     📖 المنهج: ${progress.السورة || progress.surah} - آية ${progress.الآية || progress.ayah}`);
                    console.log(`     📊 التقدم: ${progress.نسبة_الإنجاز || progress.completion_percentage}%`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ خطأ في API الثالث:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    // 4. ملخص النتائج
    console.log('\n' + '='.repeat(50));
    console.log('📋 ملخص APIs المتاحة:');
    console.log(`\n🎯 API مخصص: GET /teachers/${TEACHER_ID}/mosques/${MOSQUE_ID}/students`);
    console.log('   - يجلب طلاب المعلم في مسجد محدد مباشرة');
    
    console.log(`\n🕌 API شامل: GET /teachers/${TEACHER_ID}/mosques`);
    console.log('   - يجلب جميع مساجد المعلم مع الطلاب');
    console.log('   - تحتاج تصفية حسب المسجد المطلوب');
    
    console.log(`\n📚 API مفصل: GET /teachers/${TEACHER_ID}/circles-detailed`);
    console.log('   - يجلب جميع حلقات المعلم مع تفاصيل الطلاب');
    console.log('   - تحتاج تصفية حسب المسجد المطلوب');
}

// تشغيل الاختبار
testTeacherSpecificStudents().catch(console.error);
