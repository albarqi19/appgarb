// فحص بيانات الحضور لليوم الحالي
const today = new Date().toISOString().split('T')[0];
console.log('🗓️ تاريخ اليوم:', today);

// فحص API الحضور
fetch('http://localhost:8000/api/attendance?teacher_id=1&mosque_id=1', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('📊 بيانات الحضور الكاملة:', data);
  
  if (data.success && data.data && data.data.records) {
    console.log('📋 عدد السجلات:', data.data.records.length);
    
    // فحص التواريخ
    data.data.records.forEach((record, index) => {
      const recordDate = new Date(record.date || record.attendance_date);
      const formattedDate = recordDate.toISOString().split('T')[0];
      
      console.log(`سجل ${index + 1}:`, {
        student: record.student_name || record.student?.name,
        date: formattedDate,
        isToday: formattedDate === today,
        originalDate: record.date || record.attendance_date
      });
    });
  }
})
.catch(error => {
  console.error('❌ خطأ في جلب بيانات الحضور:', error);
});
