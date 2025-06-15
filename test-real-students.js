// اختبار نظام التحضير مع الطلاب الحقيقيين
const testWithRealStudents = async () => {
  console.log('=== اختبار نظام التحضير مع الطلاب الحقيقيين ===');
  
  const API_BASE_URL = 'http://localhost:8000/api';
  
  console.log('1. محاولة جلب قائمة الطلاب الحقيقية من قاعدة البيانات...');
  
  let realStudents = [];
  
  try {
    // محاولة جلب الطلاب من API
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log('حالة الاستجابة:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('البيانات المستلمة:', JSON.stringify(data, null, 2));
      
      // معالجة أشكال مختلفة من الاستجابة
      let students = [];
      
      if (data.data && Array.isArray(data.data)) {
        students = data.data;
      } else if (data.البيانات && Array.isArray(data.البيانات)) {
        students = data.البيانات;
      } else if (Array.isArray(data)) {
        students = data;
      } else if (data.students && Array.isArray(data.students)) {
        students = data.students;
      }
      
      console.log('الطلاب المستخرجون:', students);
      
      if (students.length > 0) {
        // تحويل البيانات لتنسيق موحد
        realStudents = students.slice(0, 4).map(student => {
          let name = '';
          
          // محاولة الحصول على الاسم بطرق مختلفة
          if (student.name) {
            name = student.name;
          } else if (student.الاسم) {
            name = student.الاسم;
          } else if (student.full_name) {
            name = student.full_name;
          } else if (student.first_name && student.last_name) {
            name = `${student.first_name} ${student.last_name}`;
          } else {
            name = `طالب ${student.id || 'مجهول'}`;
          }
          
          return {
            id: student.id,
            name: name,
            originalData: student
          };
        });
        
        console.log('الطلاب الحقيقيون الذين سيتم اختبارهم:');
        realStudents.forEach((student, index) => {
          console.log(`${index + 1}. ${student.name} (ID: ${student.id})`);
        });
      }
    } else {
      const errorText = await response.text();
      console.error('فشل في جلب الطلاب:', response.status, errorText);
    }
  } catch (error) {
    console.error('خطأ في الاتصال بـ API:', error.message);
  }
  
  // إذا لم نجد طلاب حقيقيين، نستخدم أسماء تجريبية
  if (realStudents.length === 0) {
    console.log('\n⚠️ لم يتم العثور على طلاب حقيقيين. سيتم استخدام أسماء تجريبية...');
    
    // محاولة إنشاء طلاب تجريبيين أولاً
    const testNames = ['عبدالله محمد', 'أحمد علي', 'فاطمة عبدالرحمن', 'محمد صالح'];
    
    console.log('2. محاولة إنشاء طلاب تجريبيين...');
    
    for (const name of testNames) {
      try {
        const studentData = {
          name: name,
          age: 15,
          phone: '966512345678',
          guardian_phone: '966512345679',
          address: 'الرياض'
        };
        
        const createResponse = await fetch(`${API_BASE_URL}/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(studentData)
        });
        
        if (createResponse.ok) {
          const newStudent = await createResponse.json();
          console.log(`✅ تم إنشاء الطالب: ${name}`);
          realStudents.push({
            id: newStudent.data?.id || newStudent.id,
            name: name,
            originalData: newStudent
          });
        } else {
          const error = await createResponse.text();
          console.log(`❌ فشل في إنشاء الطالب ${name}: ${error}`);
        }
      } catch (error) {
        console.error(`خطأ في إنشاء الطالب ${name}:`, error.message);
      }
      
      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  if (realStudents.length === 0) {
    console.error('❌ لا يمكن المتابعة بدون طلاب. يرجى التأكد من عمل API أو إضافة طلاب يدوياً.');
    return;
  }
  
  // تحديد حالات التحضير
  const statuses = ['حاضر', 'متأخر', 'مستأذن', 'غائب'];
  
  // تحويل الحالات إلى الإنجليزية
  const convertStatusToEnglish = (arabicStatus) => {
    switch (arabicStatus) {
      case 'حاضر': return 'present';
      case 'غائب': return 'absent';
      case 'متأخر': return 'late';
      case 'مستأذن': return 'excused';
      default: return 'present';
    }
  };
  
  console.log('\n3. اختبار إرسال التحضير للطلاب الحقيقيين...');
  
  let successCount = 0;
  let totalCount = realStudents.length;
  
  for (let i = 0; i < realStudents.length; i++) {
    const student = realStudents[i];
    const status = statuses[i % statuses.length];
    
    try {
      const attendanceData = {
        student_name: student.name,
        date: new Date().toISOString().split('T')[0],
        status: convertStatusToEnglish(status),
        period: 'العصر',
        notes: `تحضير تجريبي - ${status}`,
        time: new Date().toTimeString().split(' ')[0]
      };
      
      console.log(`إرسال تحضير ${student.name} - ${status}...`);
      console.log('البيانات المرسلة:', JSON.stringify(attendanceData, null, 2));
      
      const response = await fetch(`${API_BASE_URL}/attendance/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ نجح تحضير ${student.name}: ${JSON.stringify(result)}`);
        successCount++;
      } else {
        const error = await response.text();
        console.error(`❌ فشل تحضير ${student.name}: ${response.status} - ${error}`);
      }
      
    } catch (error) {
      console.error(`❌ خطأ في تحضير ${student.name}:`, error.message);
    }
    
    // انتظار بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== ملخص النتائج ===');
  console.log(`نجح: ${successCount}/${totalCount}`);
  console.log(`فشل: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('🎉 جميع الطلاب تم تحضيرهم بنجاح!');
  } else if (successCount > 0) {
    console.log('⚠️ بعض الطلاب تم تحضيرهم');
  } else {
    console.log('❌ فشل في تحضير جميع الطلاب');
  }
  
  // 4. اختبار جلب بيانات التحضير
  console.log('\n4. اختبار جلب بيانات التحضير...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/records?date=${today}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    if (attendanceResponse.ok) {
      const attendanceData = await attendanceResponse.json();
      console.log('✅ تم جلب بيانات التحضير بنجاح');
      console.log('عدد سجلات التحضير:', attendanceData.data?.length || attendanceData.length || 'غير معروف');
      
      // عرض تفاصيل أول سجلين
      const records = attendanceData.data || attendanceData;
      if (Array.isArray(records) && records.length > 0) {
        console.log('\nأول سجلين من التحضير:');
        records.slice(0, 2).forEach((record, index) => {
          console.log(`${index + 1}. ${JSON.stringify(record, null, 2)}`);
        });
      }
    } else {
      const error = await attendanceResponse.text();
      console.error('❌ فشل في جلب بيانات التحضير:', attendanceResponse.status, error);
    }
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات التحضير:', error.message);
  }
};

// تشغيل الاختبار
console.log('بدء اختبار النظام...');
testWithRealStudents().catch(console.error);
