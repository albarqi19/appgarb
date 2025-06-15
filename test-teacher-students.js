// اختبار مباشر لـ API GET /api/teachers/{id}/students
import fetch from 'node-fetch';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function testTeacherStudentsAPI() {
    console.log('=== اختبار API: GET /api/teachers/{id}/students ===\n');
    
    // اختبار IDs مختلفة للمعلمين
    const teacherIds = [1, 2, 3, 4, 5];
    
    for (const teacherId of teacherIds) {
        const endpoint = `/teachers/${teacherId}/students`;
        console.log(`🔍 اختبار: ${endpoint}`);
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`   📊 Status Code: ${response.status} ${response.statusText}`);
            console.log(`   🕐 Response Time: ${new Date().toLocaleTimeString()}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ نجح الطلب!`);
                
                // عرض تفاصيل الاستجابة
                if (data.success !== undefined) {
                    console.log(`   📈 Success: ${data.success}`);
                }
                
                if (data.message) {
                    console.log(`   💬 Message: ${data.message}`);
                }
                
                // عرض بيانات الطلاب
                const students = data.data || data.البيانات || data;
                if (Array.isArray(students)) {
                    console.log(`   👥 عدد الطلاب: ${students.length}`);
                    
                    if (students.length > 0) {
                        console.log(`   📋 أول 3 طلاب:`);
                        students.slice(0, 3).forEach((student, index) => {
                            console.log(`      ${index + 1}. ${student.name || student.اسم_الطالب || student.student_name || 'غير محدد'}`);
                            console.log(`         ID: ${student.id || student.معرف_الطالب || 'غير محدد'}`);
                            console.log(`         المستوى: ${student.level || student.المستوى || 'غير محدد'}`);
                        });
                    }
                } else if (students && typeof students === 'object') {
                    console.log(`   📊 نوع البيانات: Object`);
                    console.log(`   🔑 المفاتيح: ${Object.keys(students).join(', ')}`);
                }
                
                // عرض البيانات الكاملة للمعلم الأول فقط
                if (teacherId === 1) {
                    console.log(`   📄 البيانات الكاملة للمعلم 1:`);
                    console.log(JSON.stringify(data, null, 2));
                }
                
            } else {
                const errorText = await response.text();
                console.log(`   ❌ فشل الطلب: ${errorText.substring(0, 300)}...`);
            }
            
        } catch (error) {
            console.log(`   💥 خطأ في الاتصال: ${error.message}`);
        }
        
        console.log('─'.repeat(60));
    }
}

// اختبار إضافي للتحقق من الخادم
async function checkServerStatus() {
    console.log('🔧 فحص حالة الخادم...\n');
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        console.log(`📡 حالة الخادم: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            console.log('✅ الخادم يعمل بشكل طبيعي\n');
            return true;
        } else {
            console.log('⚠️ الخادم يرد ولكن هناك مشكلة\n');
            return true; // لا يزال يمكن المحاولة
        }
    } catch (error) {
        console.log(`❌ لا يمكن الوصول للخادم: ${error.message}`);
        console.log('تأكد من أن الخادم يعمل على http://127.0.0.1:8000\n');
        return false;
    }
}

// تشغيل الاختبارات
async function runTests() {
    const serverOnline = await checkServerStatus();
    
    if (serverOnline) {
        await testTeacherStudentsAPI();
    } else {
        console.log('🛑 لا يمكن إجراء الاختبارات - الخادم غير متاح');
    }
}

runTests().catch(console.error);
