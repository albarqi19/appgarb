// خدمة التحضير
import { API_BASE_URL, getApiHeaders } from './authService';

// أنواع حالات الحضور
export type AttendanceStatus = 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن';

// واجهة سجل الحضور
export interface AttendanceRecord {
  id?: string;
  studentId: string | number;
  teacherId: string | number;
  date: string;
  status: AttendanceStatus;
  time?: string;
  notes?: string;
}

// واجهة إرسال التحضير - محدثة لتتوافق مع Laravel API
export interface AttendanceSubmission {
  student_name: string;  // اسم الطالب مطلوب
  date: string;         // تاريخ بصيغة Y-m-d
  status: 'present' | 'absent' | 'late' | 'excused';  // القيم المقبولة من الخادم
  period: string;       // الفترة (العصر، المغرب، إلخ)
  notes?: string;       // ملاحظات اختيارية
}

// واجهة إرسال التحضير المتعدد
export interface BulkAttendanceSubmission {
  students: AttendanceSubmission[];
}

// واجهة استجابة سجلات الحضور
export interface AttendanceResponse {
  success: boolean;
  message: string;
  data?: AttendanceRecord[];
  errors?: any;
}

// تحويل حالة الحضور من العربية إلى الإنجليزية (للإرسال للخادم)
export const convertStatusToEnglish = (arabicStatus: AttendanceStatus): 'present' | 'absent' | 'late' | 'excused' => {
  switch (arabicStatus) {
    case 'حاضر': return 'present';
    case 'غائب': return 'absent';
    case 'متأخر': return 'late';
    case 'مستأذن': return 'excused'; // الخادم يقبل "excused" بالإنجليزية
    default: return 'present';
  }
};

// تحويل حالة الحضور من الإنجليزية إلى العربية
export const convertStatusToArabic = (englishStatus: string): AttendanceStatus => {
  // تنظيف النص أولاً
  const cleanStatus = englishStatus?.toString().toLowerCase().trim();
  
  switch (cleanStatus) {
    case 'present': return 'حاضر';
    case 'absent': return 'غائب';    case 'late': return 'متأخر';
    case 'excused': return 'مستأذن'; // للتوافق مع البيانات القديمة
      // حالات إضافية قد ترد من API
    case 'معذور': return 'مستأذن'; // بعض الأنظمة تستخدم "معذور"
    case 'مأذون': return 'مستأذن'; // الخادم يرجع "مأذون"
    case 'مبرر': return 'مستأذن';
    case 'إجازة': return 'مستأذن';
    
    // في حالة وجود النص بالعربية مسبقاً
    case 'حاضر': return 'حاضر';
    case 'غائب': return 'غائب';
    case 'متأخر': return 'متأخر';
    case 'مستأذن': return 'مستأذن';
    
    default: 
      console.warn(`حالة غير معروفة: ${englishStatus}`);
      return 'حاضر'; // افتراضي
  }
};

// إرسال التحضير لطالب واحد
export const recordSingleAttendance = async (attendance: AttendanceSubmission): Promise<boolean> => {
  try {
    console.log('إرسال تحضير طالب واحد:', JSON.stringify(attendance, null, 2));
      const response = await fetch(`${API_BASE_URL}/attendance/record`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(attendance),
    });

    console.log('حالة الاستجابة:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('تفاصيل الخطأ:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`);
    }

    const data = await response.json();
    console.log('استجابة الخادم:', data);
    return data.نجح || data.success || false;
  } catch (error) {
    console.error('خطأ في إرسال التحضير:', error);
    return false;
  }
};

// جلب سجلات الحضور
export const getAttendanceRecords = async (
  teacherId?: string,
  studentId?: string,
  date?: string
): Promise<AttendanceRecord[]> => {
  try {
    const params = new URLSearchParams();
    if (teacherId) params.append('teacher_id', teacherId);
    if (studentId) params.append('student_id', studentId);    if (date) params.append('date', date);

    const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`, {
      method: 'GET',
      headers: getApiHeaders(true, localStorage.getItem('token') || undefined),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AttendanceResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('خطأ في جلب سجلات الحضور:', error);
    return [];
  }
};

// جلب سجلات حضور طالب معين
export const getStudentAttendanceHistory = async (
  studentId: string,
  startDate?: string,
  endDate?: string
): Promise<AttendanceRecord[]> => {
  try {
    const params = new URLSearchParams();
    params.append('student_id', studentId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);    const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`, {
      method: 'GET',
      headers: getApiHeaders(true, localStorage.getItem('token') || undefined),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AttendanceResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('خطأ في جلب سجل حضور الطالب:', error);
    return [];
  }
};

// تحديث حالة حضور طالب معين
export const updateStudentAttendance = async (
  recordId: string,
  status: AttendanceStatus,
  notes?: string
): Promise<boolean> => {  try {
    const response = await fetch(`${API_BASE_URL}/attendance/record/${recordId}`, {
      method: 'PUT',
      headers: getApiHeaders(true, localStorage.getItem('token') || undefined),
      body: JSON.stringify({ status, notes }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('خطأ في تحديث حالة الحضور:', error);
    return false;
  }
};

// إرسال التحضير المتعدد للطلاب بطريقة محسّنة (إرسال واحد)
export const recordBulkAttendanceFast = async (
  students: { name: string; status: AttendanceStatus; notes?: string }[],
  period: string = 'العصر'
): Promise<{ success: boolean; results: any[] }> => {
  try {
    const date = getTodayDate();
    console.log('🚀 إرسال تحضير جماعي محسّن لـ', students.length, 'طالب في طلب واحد');

    // تحضير البيانات للإرسال الجماعي
    const bulkData: BulkAttendanceSubmission = {
      students: students.map(student => ({
        student_name: student.name,
        date: date,
        status: convertStatusToEnglish(student.status),
        period: period,
        notes: student.notes || `تحضير ${student.status}`
      }))
    };

    console.log('📤 إرسال طلب جماعي واحد:', bulkData);

    // محاولة إرسال جماعي أولاً
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(bulkData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ نجح الإرسال الجماعي:', data);
        
        // إنشاء نتائج موحدة
        const results = students.map(student => ({
          studentName: student.name,
          success: true,
          status: student.status,
          action: 'تم بنجاح (جماعي)'
        }));

        return {
          success: true,
          results: results
        };
      } else {
        console.warn('⚠️ فشل الإرسال الجماعي:', response.status, '- سيتم التراجع للإرسال المتتالي');
        throw new Error('Bulk endpoint failed');
      }
    } catch (bulkError) {
      console.warn('⚠️ الإرسال الجماعي غير متوفر، استخدام الطريقة المتتالية السريعة...');
      
      // التراجع للطريقة المتتالية بدون انتظار
      return await recordBulkAttendanceSequential(students, period);
    }

  } catch (error) {
    console.error('💥 خطأ في إرسال التحضير الجماعي:', error);
    return {
      success: false,
      results: []
    };
  }
};

// إرسال متتالي بدون انتظار (للتراجع)
export const recordBulkAttendanceSequential = async (
  students: { name: string; status: AttendanceStatus; notes?: string }[],
  period: string = 'العصر'
): Promise<{ success: boolean; results: any[] }> => {
  try {
    const date = getTodayDate();
    console.log('⚡ إرسال متتالي سريع (بدون انتظار) لـ', students.length, 'طالب');

    // إرسال جميع الطلاب بشكل متوازي (بدون انتظار)
    const promises = students.map(async (student) => {
      const attendanceData: AttendanceSubmission = {
        student_name: student.name,
        date: date,
        status: convertStatusToEnglish(student.status),
        period: period,
        notes: student.notes || `تحضير ${student.status}`
      };

      try {
        const success = await recordOrUpdateAttendance(attendanceData);
        return {
          studentName: student.name,
          success: success,
          status: student.status,
          action: success ? 'تم بنجاح (متوازي)' : 'فشل'
        };
      } catch (error) {
        console.error(`❌ خطأ في إرسال ${student.name}:`, error);
        return {
          studentName: student.name,
          success: false,
          status: student.status,
          action: 'فشل'
        };
      }
    });

    // انتظار جميع الطلبات في نفس الوقت
    const results = await Promise.all(promises);
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`📊 نتائج الإرسال المتوازي: ${successCount}/${totalCount} نجح`);
    
    return {
      success: successCount === totalCount,
      results: results
    };

  } catch (error) {
    console.error('💥 خطأ في الإرسال المتوازي:', error);
    return {
      success: false,
      results: []
    };
  }
};

// للتوافق مع النظام القديم - نسخة محسنة
export const recordBulkAttendance = async (
  students: { name: string; status: AttendanceStatus; notes?: string }[],
  period: string = 'العصر'
): Promise<{ success: boolean; results: any[] }> => {
  // استخدام النظام المحسن الجديد
  return await recordBulkAttendanceFast(students, period);
};

// دالة التوافق القديمة
export const recordAttendance = recordBulkAttendance;

// الدوال المساعدة للتعامل مع التاريخ
const getTodayDate = (): string => {
  // الحصول على التاريخ في المنطقة الزمنية السعودية (UTC+3)
  const now = new Date();
  const saudiOffset = 3 * 60; // 3 ساعات بالدقائق
  const saudiTime = new Date(now.getTime() + (saudiOffset * 60 * 1000));
  return saudiTime.toISOString().split('T')[0];
};

const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // إذا كان التاريخ يحتوي على وقت وأوفست منطقة زمنية
  if (dateStr.includes('T')) {
    // تحويل التاريخ للمنطقة الزمنية المحلية ثم استخراج التاريخ فقط
    const localDate = new Date(dateStr);
    
    // تحويل للمنطقة الزمنية السعودية (UTC+3)
    const saudiOffset = 3 * 60; // 3 ساعات بالدقائق
    const saudiTime = new Date(localDate.getTime() + (saudiOffset * 60 * 1000));
    
    return saudiTime.toISOString().split('T')[0];
  }
  
  return dateStr.split('T')[0]; // إزالة الوقت والمنطقة الزمنية
};

const isDateToday = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const normalizedDate = normalizeDate(dateStr);
  const today = getTodayDate();
  
  console.log(`🕒 مقارنة التواريخ: ${dateStr} -> ${normalizedDate} vs ${today}`);
  
  return normalizedDate === today;
};

// جلب حضور اليوم للطلاب مع التحقق الصارم من التاريخ وإدارة التخزين المحلي
export const getTodayAttendance = async (teacherId?: string, mosqueId?: string): Promise<{[studentName: string]: AttendanceStatus}> => {
  try {
    const today = getTodayDate();
    console.log('🔍 جلب حضور اليوم:', today, 'للمعلم:', teacherId, 'في المسجد:', mosqueId);
      // تنظيف البيانات القديمة أولاً
    clearOldAttendanceCache();
    
    // محاولة جلب البيانات من التخزين المحلي إذا كانت لليوم الحالي
    // تم تعطيل التخزين المحلي مؤقتاً لضمان جلب البيانات المحدثة
    // const cachedData = getCachedAttendanceData();
    // if (cachedData && Object.keys(cachedData).length > 0) {
    //   console.log('📱 استخدام البيانات المحفوظة محلياً');
    //   return cachedData;
    // }

    // بناء URL مع فلترة حسب المعلم والمسجد
    const params = new URLSearchParams();
    params.append('date', today);
    if (teacherId) {
      params.append('teacher_id', teacherId);
      console.log('🔒 تطبيق فلترة حسب المعلم:', teacherId);
    }
    if (mosqueId) {
      params.append('mosque_id', mosqueId);    console.log('🔒 تطبيق فلترة حسب المسجد:', mosqueId);
    }

    const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      console.warn('❌ فشل في جلب بيانات الحضور:', response.status);
      return {};
    }
    
    const data = await response.json();
    console.log('📥 بيانات الحضور المستلمة:', data);
    
    // تحويل البيانات لتنسيق مناسب
    const attendanceMap: {[studentName: string]: AttendanceStatus} = {};
    
    // استخراج السجلات من تنسيقات مختلفة
    let records = null;
    
    if (data.attendance_records && Array.isArray(data.attendance_records)) {
      records = data.attendance_records;
    } else if (data.البيانات && Array.isArray(data.البيانات)) {
      records = data.البيانات;
    } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
      // Laravel pagination response format
      records = data.data.data;
    } else if (data.data && Array.isArray(data.data)) {
      records = data.data;
    } else if (Array.isArray(data)) {
      records = data;
    } else if (data && typeof data === 'object') {
      // إذا كانت البيانات object، ابحث عن arrays بداخله
      const possibleArrays = Object.values(data).filter(value => Array.isArray(value));
      if (possibleArrays.length > 0) {
        records = possibleArrays[0];
      }
    }
    
    console.log('📋 السجلات المستخرجة:', records?.length || 0, 'سجل');

    if (records && Array.isArray(records)) {
      let validRecordsCount = 0;
      let ignoredRecordsCount = 0;
      
      records.forEach((record: any) => {
        if (!record || typeof record !== 'object') {
          console.warn('⚠️ سجل غير صالح:', record);
          return;
        }
        
        // التحقق من التاريخ أولاً
        const recordDate = record.date || record.تاريخ || record.attendance_date;
        
        if (!recordDate) {
          console.warn('⚠️ سجل بدون تاريخ، سيتم تجاهله:', record);
          ignoredRecordsCount++;
          return;
        }
        
        // التحقق الصارم من أن السجل لليوم الحالي فقط
        if (!isDateToday(recordDate)) {
          console.log(`🗓️ تجاهل سجل لتاريخ قديم: ${normalizeDate(recordDate)} (المطلوب: ${today})`);
          ignoredRecordsCount++;
          return;
        }
        
        // استخراج اسم الطالب
        let studentName = record.student_name || record.name || record.اسم_الطالب;
        
        // إذا لم نجد الاسم مباشرة، ابحث في record.student
        if (!studentName && record.student && typeof record.student === 'object') {
          studentName = record.student.name || record.student.اسم || record.student.student_name;
        }
        
        const status = record.status || record.الحالة || record.attendance_status;
        
        if (studentName && status) {
          attendanceMap[studentName] = convertStatusToArabic(status);
          validRecordsCount++;
          console.log(`✅ تم تحديد حضور ${studentName}: ${status} لتاريخ ${normalizeDate(recordDate)}`);
        } else {
          console.warn('⚠️ لم يتم العثور على اسم الطالب أو الحالة في السجل:', record);
          ignoredRecordsCount++;
        }
      });
      
      console.log(`📊 ملخص معالجة السجلات: ${validRecordsCount} صالح، ${ignoredRecordsCount} مُتجاهل`);
    } else {
      console.warn('❌ تنسيق البيانات غير مدعوم:', typeof data);
    }
      // تسجيل النتيجة النهائية
    const recordsCount = Object.keys(attendanceMap).length;
    if (recordsCount === 0) {
      console.log('⚠️ لا توجد سجلات حضور صالحة لليوم الحالي');
    } else {
      console.log(`✅ تم العثور على ${recordsCount} سجل حضور صالح لليوم الحالي`);
      // حفظ البيانات في التخزين المحلي
      cacheAttendanceData(attendanceMap);
    }
    
    return attendanceMap;
    
  } catch (error) {
    console.error('💥 خطأ في جلب بيانات الحضور:', error);
    return {};
  }
};

// التحقق من وجود التحضير لليوم الحالي مع التحقق الصارم من التاريخ
export const hasAttendanceForToday = async (teacherId?: string, mosqueId?: string): Promise<boolean> => {
  try {
    const today = getTodayDate();
    console.log('🔍 فحص وجود التحضير لتاريخ:', today, 'للمعلم:', teacherId, 'في المسجد:', mosqueId);
    
    // بناء URL مع فلترة حسب المعلم والمسجد
    const params = new URLSearchParams();
    params.append('date', today);
    if (teacherId) {
      params.append('teacher_id', teacherId);
    }
    if (mosqueId) {
      params.append('mosque_id', mosqueId);
    }
      // استدعاء API مباشر للتحقق من وجود سجلات لليوم الحالي فقط
    const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      console.warn('❌ فشل في جلب بيانات الحضور للتحقق:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('📥 بيانات الفحص المستلمة:', data);
    
    // استخراج السجلات من تنسيقات مختلفة
    let records = null;
    if (data.attendance_records && Array.isArray(data.attendance_records)) {
      records = data.attendance_records;
    } else if (data.البيانات && Array.isArray(data.البيانات)) {
      records = data.البيانات;
    } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
      records = data.data.data;
    } else if (data.data && Array.isArray(data.data)) {
      records = data.data;
    } else if (Array.isArray(data)) {
      records = data;
    }
    
    // التحقق من وجود سجلات صالحة لليوم الحالي فقط
    let validRecordsCount = 0;
    let totalRecords = 0;
    
    if (records && Array.isArray(records)) {
      totalRecords = records.length;
      
      validRecordsCount = records.filter(record => {
        if (!record || typeof record !== 'object') {
          console.warn('⚠️ سجل غير صالح:', record);
          return false;
        }
        
        // التحقق من التاريخ
        const recordDate = record.date || record.تاريخ || record.attendance_date;
        if (!recordDate) {
          console.warn('⚠️ سجل بدون تاريخ:', record);
          return false;
        }
        
        // التحقق الصارم من أن السجل لليوم الحالي
        const isToday = isDateToday(recordDate);
        
        if (isToday) {
          const studentName = record.student_name || record.name || 'غير محدد';
          console.log('✅ تم العثور على سجل صالح:', {
            date: recordDate,
            normalized: normalizeDate(recordDate),
            today: today,
            student: studentName
          });
        } else {
          console.log('🗓️ سجل لتاريخ قديم:', {
            date: recordDate,
            normalized: normalizeDate(recordDate),
            today: today
          });
        }
        
        return isToday;
      }).length;
    }
    
    const hasRecords = validRecordsCount > 0;
    
    console.log('📊 نتيجة فحص التحضير:', {
      today,
      totalRecords,
      validRecordsForToday: validRecordsCount,
      hasRecords,
      conclusion: hasRecords ? '✅ يوجد تحضير لليوم' : '❌ لا يوجد تحضير لليوم'
    });
    
    return hasRecords;
  } catch (error) {
    console.error('💥 خطأ في فحص وجود التحضير:', error);
    // في حالة الخطأ، نفترض عدم وجود التحضير للسلامة
    return false;
  }
};

// جلب حضور طالب معين لليوم مع التحقق الصارم من التاريخ
export const getStudentTodayAttendance = async (studentName: string, teacherId?: string, mosqueId?: string): Promise<AttendanceStatus | null> => {
  try {
    const today = getTodayDate();
    console.log(`🔍 البحث عن حضور الطالب ${studentName} لتاريخ ${today}، المعلم: ${teacherId}، المسجد: ${mosqueId}`);
    
    // بناء URL مع فلترة حسب المعلم والمسجد
    const params = new URLSearchParams();
    params.append('date', today);
    params.append('student_name', studentName);
    if (teacherId) {
      params.append('teacher_id', teacherId);
    }
    if (mosqueId) {
      params.append('mosque_id', mosqueId);
    }
      const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      console.warn(`❌ فشل في جلب حضور الطالب ${studentName}:`, response.status);
      return null;
    }

    const data = await response.json();
    console.log(`📥 بيانات حضور الطالب ${studentName}:`, data);
    
    // استخراج السجلات
    const records = data.البيانات || data.data || data.attendance_records || [];
    
    if (!Array.isArray(records)) {
      console.warn('❌ تنسيق البيانات غير صالح:', typeof records);
      return null;
    }
    
    // البحث عن سجل صالح لليوم الحالي
    const todayRecord = records.find(record => {
      if (!record || typeof record !== 'object') return false;
      
      // التحقق من التاريخ
      const recordDate = record.date || record.تاريخ || record.attendance_date;
      if (!recordDate) return false;
      
      // التأكد من أن السجل لليوم الحالي
      return isDateToday(recordDate);
    });
    
    if (todayRecord) {
      const status = convertStatusToArabic(todayRecord.status || todayRecord.الحالة);
      console.log(`✅ تم العثور على حضور الطالب ${studentName}: ${status}`);
      return status;
    }
    
    console.log(`❌ لم يتم العثور على حضور الطالب ${studentName} لليوم الحالي`);
    return null;
    
  } catch (error) {
    console.error(`💥 خطأ في جلب حضور الطالب ${studentName}:`, error);
    return null;
  }
};

// إدارة التخزين المحلي للحضور
const ATTENDANCE_CACHE_KEY = 'attendance_cache';
const CACHE_DATE_KEY = 'attendance_cache_date';

// تنظيف البيانات المحفوظة محلياً إذا كانت قديمة
export const clearOldAttendanceCache = (): void => {
  try {
    const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
    const today = getTodayDate();
    
    if (cachedDate && cachedDate !== today) {
      console.log(`🧹 تنظيف البيانات المحفوظة القديمة (${cachedDate}) واستبدالها ببيانات ${today}`);
      localStorage.removeItem(ATTENDANCE_CACHE_KEY);
      localStorage.removeItem(CACHE_DATE_KEY);
      
      // تنظيف أي مفاتيح أخرى متعلقة بالحضور
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('attendance') || key.includes('حضور'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        if (key !== CACHE_DATE_KEY) { // تجنب إزالة المفتاح الذي نستخدمه للتحقق
          localStorage.removeItem(key);
          console.log(`🗑️ تم حذف البيانات المحفوظة: ${key}`);
        }
      });
    }
  } catch (error) {
    console.error('💥 خطأ في تنظيف البيانات المحفوظة:', error);
  }
};

// حفظ بيانات الحضور مع تاريخ اليوم
export const cacheAttendanceData = (data: {[studentName: string]: AttendanceStatus}): void => {
  try {
    const today = getTodayDate();
    localStorage.setItem(ATTENDANCE_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_DATE_KEY, today);
    console.log(`💾 تم حفظ بيانات الحضور لتاريخ ${today}`);
  } catch (error) {
    console.error('💥 خطأ في حفظ بيانات الحضور:', error);
  }
};

// جلب بيانات الحضور المحفوظة (فقط إذا كانت لليوم الحالي)
export const getCachedAttendanceData = (): {[studentName: string]: AttendanceStatus} | null => {
  try {
    const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
    const today = getTodayDate();
    
    if (cachedDate !== today) {
      console.log(`🚫 البيانات المحفوظة قديمة (${cachedDate}), سيتم تجاهلها`);
      return null;
    }
    
    const cachedData = localStorage.getItem(ATTENDANCE_CACHE_KEY);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      console.log(`📱 تم استرجاع البيانات المحفوظة لتاريخ ${today}`);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('💥 خطأ في جلب البيانات المحفوظة:', error);
    return null;
  }
};

// فرض تحديث بيانات الحضور (تجاهل التخزين المحلي)
export const forceRefreshAttendance = async (teacherId?: string, mosqueId?: string): Promise<{[studentName: string]: AttendanceStatus}> => {
  try {
    const today = getTodayDate();
    console.log('🔄 فرض تحديث بيانات الحضور لتاريخ:', today, 'للمعلم:', teacherId, 'في المسجد:', mosqueId);
    
    // تنظيف التخزين المحلي أولاً
    clearOldAttendanceCache();
    
    // بناء URL مع فلترة حسب المعلم والمسجد
    const params = new URLSearchParams();
    params.append('date', today);
    params.append('_t', Date.now().toString()); // منع التخزين المؤقت
    if (teacherId) {
      params.append('teacher_id', teacherId);
      console.log('🔒 تطبيق فلترة حسب المعلم:', teacherId);
    }
    if (mosqueId) {
      params.append('mosque_id', mosqueId);
      console.log('🔒 تطبيق فلترة حسب المسجد:', mosqueId);
    }
      const response = await fetch(`${API_BASE_URL}/attendance/records?${params}`, {
      method: 'GET',
      headers: {
        ...getApiHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });

    if (!response.ok) {
      console.warn('❌ فشل في فرض تحديث بيانات الحضور:', response.status);
      return {};
    }
    
    const data = await response.json();
    console.log('📥 بيانات الحضور المحدثة:', data);
    
    // معالجة البيانات بنفس طريقة getTodayAttendance
    const attendanceMap: {[studentName: string]: AttendanceStatus} = {};
    
    // استخراج السجلات من تنسيقات مختلفة
    let records = null;
    
    if (data.attendance_records && Array.isArray(data.attendance_records)) {
      records = data.attendance_records;
    } else if (data.البيانات && Array.isArray(data.البيانات)) {
      records = data.البيانات;
    } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
      records = data.data.data;
    } else if (data.data && Array.isArray(data.data)) {
      records = data.data;
    } else if (Array.isArray(data)) {
      records = data;
    } else if (data && typeof data === 'object') {
      const possibleArrays = Object.values(data).filter(value => Array.isArray(value));
      if (possibleArrays.length > 0) {
        records = possibleArrays[0];
      }
    }

    if (records && Array.isArray(records)) {
      let validRecordsCount = 0;
      
      records.forEach((record: any) => {
        if (!record || typeof record !== 'object') return;
        
        const recordDate = record.date || record.تاريخ || record.attendance_date;
        if (!recordDate || !isDateToday(recordDate)) return;
        
        let studentName = record.student_name || record.name || record.اسم_الطالب;
        if (!studentName && record.student && typeof record.student === 'object') {
          studentName = record.student.name || record.student.اسم || record.student.student_name;
        }
        
        const status = record.status || record.الحالة || record.attendance_status;
        
        if (studentName && status) {
          attendanceMap[studentName] = convertStatusToArabic(status);
          validRecordsCount++;
        }
      });
      
      console.log(`🔄 تم تحديث ${validRecordsCount} سجل حضور`);
    }
    
    // حفظ البيانات المحدثة
    if (Object.keys(attendanceMap).length > 0) {
      cacheAttendanceData(attendanceMap);
    }
    
    return attendanceMap;
    
  } catch (error) {
    console.error('💥 خطأ في فرض تحديث بيانات الحضور:', error);
    return {};
  }
};

// إرسال التحضير لطالب واحد مع فحص التاريخ الصحيح
export const recordOrUpdateAttendance = async (attendance: AttendanceSubmission): Promise<boolean> => {
  try {
    console.log('🔄 إرسال تحضير طالب مع التحقق من التاريخ:', JSON.stringify(attendance, null, 2));
    
    // التأكد من أن التاريخ صحيح (اليوم الحالي)
    const today = getTodayDate();
    if (attendance.date !== today) {
      console.warn(`⚠️ تاريخ الحضور (${attendance.date}) لا يطابق اليوم الحالي (${today}), سيتم تصحيحه`);
      attendance.date = today;
    }
    
    // استخدام الطريقة البسيطة لتجنب مشاكل التحديث الخاطئ
    console.log('➕ إنشاء سجل حضور جديد لليوم الحالي');
    return await recordSingleAttendance(attendance);
    
  } catch (error) {
    console.error('💥 خطأ في إرسال التحضير:', error);
    return false;
  }
};

// تحديث دالة التحضير المتعدد لاستخدام النظام المحسن
export const recordBulkAttendanceWithUpdate = async (
  students: { name: string; status: AttendanceStatus; notes?: string }[],
  period: string = 'العصر'
): Promise<{ success: boolean; results: any[] }> => {
  try {
    console.log('🚀 استخدام النظام المحسن للتحضير الجماعي');
    
    // استخدام الدالة المحسنة الجديدة
    const result = await recordBulkAttendanceFast(students, period);
    
    // مسح التخزين المحلي لضمان جلب البيانات المحدثة
    console.log('🧹 مسح التخزين المحلي لضمان جلب البيانات المحدثة');
    clearOldAttendanceCache();
    
    return result;
    
  } catch (error) {
    console.error('💥 خطأ في إرسال التحضير المتعدد المحسن:', error);
    return {
      success: false,
      results: []
    };
  }
};
