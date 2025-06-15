// اختبار سلوك التحضير باستخدام XMLHttpRequest محلي
const today = new Date().toISOString().split('T')[0];
const teacherId = '1';
const mosqueId = '2';
const studentName = 'سعدون';

console.log('🧪 اختبار سلوك التحضير: إنشاء سجل جديد أم تعديل الموجود؟');
console.log('='.repeat(80));
console.log(`📅 التاريخ: ${today}`);
console.log(`👨‍🏫 المعلم: ${teacherId}`);
console.log(`🕌 المسجد: ${mosqueId}`);
console.log(`👤 الطالب: ${studentName}`);

// استخدام fetch العادي (إذا كان متاحاً في البيئة)
if (typeof fetch === 'undefined') {
  console.log('❌ fetch غير متاح. يرجى تشغيل هذا في متصفح أو بيئة تدعم fetch.');
  process.exit(1);
}
