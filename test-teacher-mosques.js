// اختبار نظام عرض مساجد المعلم فقط
// Test for teacher-specific mosque display

const axios = require('axios');

const API_BASE = 'http://localhost:8000/api';

async function testTeacherMosques() {
    console.log('=== اختبار نظام مساجد المعلم ===');
    console.log('الوقت:', new Date().toLocaleString('ar-SA'));
    
    try {
        // 1. تسجيل دخول معلم
        console.log('\n1. تسجيل دخول معلم...');
        const loginResponse = await axios.post(`${API_BASE}/auth/teacher/login`, {
            identity_number: '1234567890', // معرف معلم افتراضي
            password: '0530996778'
        });
        
        if (!loginResponse.data || !loginResponse.data.data) {
            console.error('❌ فشل في تسجيل الدخول');
            return;
        }
        
        const teacher = loginResponse.data.data;
        console.log('✅ تم تسجيل الدخول بنجاح');
        console.log('معرف المعلم:', teacher.id);
        console.log('اسم المعلم:', teacher.name);
        
        // 2. اختبار getTeacherMosques مقابل getAllMosques
        console.log('\n2. مقارنة مساجد المعلم مع جميع المساجد...');
        
        // جلب جميع المساجد (النظام القديم)
        const allMosquesResponse = await axios.get(`${API_BASE}/mosques`);
        const allMosques = allMosquesResponse.data?.data || [];
        console.log('عدد جميع المساجد في النظام:', allMosques.length);
        
        // جلب مساجد المعلم فقط (النظام الجديد)
        const teacherMosquesResponse = await axios.get(`${API_BASE}/teachers/${teacher.id}/mosques`);
        const teacherMosques = teacherMosquesResponse.data?.البيانات?.المساجد || [];
        console.log('عدد مساجد المعلم المخصصة:', teacherMosques.length);
        
        // 3. عرض النتائج
        console.log('\n3. تفاصيل المساجد:');
        console.log('\n--- جميع المساجد (النظام القديم) ---');
        allMosques.forEach((mosque, index) => {
            console.log(`${index + 1}. ${mosque.mosque_name || mosque.اسم_المسجد} - ${mosque.district || mosque.الحي}`);
        });
        
        console.log('\n--- مساجد المعلم فقط (النظام الجديد) ---');
        teacherMosques.forEach((mosque, index) => {
            console.log(`${index + 1}. ${mosque.اسم_المسجد} - ${mosque.العنوان}`);
            if (mosque.الحلقات && mosque.الحلقات.length > 0) {
                console.log(`   - الحلقات: ${mosque.الحلقات.map(c => c.اسم_الحلقة).join(', ')}`);
            }
        });
        
        // 4. التحقق من الفرق
        console.log('\n4. التحليل:');
        if (teacherMosques.length < allMosques.length) {
            console.log('✅ النظام يعمل بشكل صحيح - المعلم يرى مساجده فقط');
            console.log(`الفرق: ${allMosques.length - teacherMosques.length} مسجد مخفي`);
        } else if (teacherMosques.length === allMosques.length) {
            console.log('⚠️  المعلم يرى جميع المساجد - قد يحتاج تحديث');
        } else {
            console.log('❓ نتيجة غير متوقعة');
        }
        
    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.response?.data || error.message);
    }
    
    console.log('\n=== انتهى الاختبار ===');
}

// تشغيل الاختبار
testTeacherMosques();
