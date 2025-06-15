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

// جلب حضور اليوم للطلاب باستخدام API الجديد المحسن
export const getTodayAttendance = async (teacherId?: string, mosqueId?: string): Promise<{[studentName: string]: AttendanceStatus}> => {
  try {
    console.log('🔍 جلب حضور اليوم للمعلم:', teacherId, 'في المسجد:', mosqueId);
    
    // تنظيف البيانات القديمة أولاً
    clearOldAttendanceCache();
    
    // التحقق من وجود المعاملات المطلوبة
    if (!mosqueId || !teacherId) {
      console.warn('⚠️ معرف المسجد أو المعلم مفقود');
      return {};
    }

    // استخدام API الجديد المُفلتر مسبقاً من الخادم
    console.log('🚀 استخدام API الحضور الجديد المُفلتر مسبقاً...');
    const apiUrl = `${API_BASE_URL}/mosques/${mosqueId}/attendance-today?teacher_id=${teacherId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      console.warn('❌ فشل في جلب بيانات الحضور:', response.status);
      return {};
    }

    const data = await response.json();
    console.log('📥 بيانات الحضور من API الجديد:', data);
    
    // التحقق من تنسيق الاستجابة
    if (!data.success || !data.data || !data.data.attendance) {
      console.warn('⚠️ تنسيق الاستجابة غير صحيح');
      return {};
    }

    const attendanceMap: {[studentName: string]: AttendanceStatus} = {};
    
    // تحويل البيانات النظيفة من الخادم (بدون حاجة للفلترة)
    Object.entries(data.data.attendance).forEach(([studentName, status]) => {
      // تحويل "غير مسجل" إلى الحالة الافتراضية
      if (status === 'غير مسجل') {
        attendanceMap[studentName] = 'حاضر'; // افتراضي
      } else {
        attendanceMap[studentName] = convertStatusToArabic(status as string);
      }
    });
    
    console.log(`✅ تم جلب حضور ${Object.keys(attendanceMap).length} طالب من API الجديد المُفلتر`);
    
    // حفظ البيانات في التخزين المحلي
    if (Object.keys(attendanceMap).length > 0) {
      cacheAttendanceData(attendanceMap);
    }
    
    return attendanceMap;
    
  } catch (error) {
    console.error('💥 خطأ في جلب بيانات الحضور:', error);
    return {};
  }
};

// التحقق من وجود التحضير لليوم الحالي باستخدام API الجديد المُفلتر
export const hasAttendanceForToday = async (teacherId?: string, mosqueId?: string): Promise<boolean> => {
  try {
    const today = getTodayDate();
    console.log('🔍 فحص وجود التحضير لتاريخ:', today, 'للمعلم:', teacherId, 'في المسجد:', mosqueId);
    
    // التحقق من وجود المعاملات المطلوبة
    if (!mosqueId || !teacherId) {
      console.warn('⚠️ معرف المسجد أو المعلم مفقود للفحص');
      return false;
    }

    // استخدام API الجديد المُفلتر مسبقاً للتحقق من وجود البيانات
    console.log('🚀 فحص وجود البيانات من API الجديد المُفلتر...');
    const apiUrl = `${API_BASE_URL}/mosques/${mosqueId}/attendance-today?teacher_id=${teacherId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      console.warn('❌ فشل في جلب بيانات الحضور للفحص:', response.status);
      return false;
    }

    const data = await response.json();
    console.log('📥 بيانات الفحص المستلمة من API الجديد:', data);
    
    // التحقق من وجود بيانات صالحة
    if (!data.success || !data.data || !data.data.attendance) {
      console.log('❌ لم يتم العثور على بيانات حضور صالحة');
      return false;
    }

    // حساب عدد الطلاب الذين لديهم حضور مسجل (ليس "غير مسجل")
    const attendanceEntries = Object.entries(data.data.attendance);
    const registeredCount = attendanceEntries.filter(([_, status]) => status !== 'غير مسجل').length;
    
    const hasRecords = registeredCount > 0;
    
    console.log('📊 نتيجة فحص التحضير:', {
      today,
      totalStudents: attendanceEntries.length,
      registeredStudents: registeredCount,
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

// جلب حضور طالب معين لليوم باستخدام بيانات الحضور المُفلترة مسبقاً
export const getStudentTodayAttendance = async (studentName: string, teacherId?: string, mosqueId?: string): Promise<AttendanceStatus | null> => {
  try {
    console.log(`🔍 البحث عن حضور الطالب ${studentName} للمعلم: ${teacherId}، المسجد: ${mosqueId}`);
    
    // استخدام دالة جلب الحضور المُفلترة الجديدة
    const todayAttendance = await getTodayAttendance(teacherId, mosqueId);
    
    // البحث عن الطالب في البيانات المُفلترة
    if (todayAttendance[studentName]) {
      const status = todayAttendance[studentName];
      console.log(`✅ تم العثور على حضور الطالب ${studentName}: ${status}`);
      return status;
    }
    
    console.log(`❌ لم يتم العثور على حضور الطالب ${studentName} في البيانات المُفلترة`);
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

// فرض تحديث بيانات الحضور باستخدام API الجديد المُفلتر (تجاهل التخزين المحلي)
export const forceRefreshAttendance = async (teacherId?: string, mosqueId?: string): Promise<{[studentName: string]: AttendanceStatus}> => {
  try {
    console.log('🔄 فرض تحديث بيانات الحضور للمعلم:', teacherId, 'في المسجد:', mosqueId);
    
    // تنظيف التخزين المحلي أولاً
    clearOldAttendanceCache();
    
    // التحقق من وجود المعاملات المطلوبة
    if (!mosqueId || !teacherId) {
      console.warn('⚠️ معرف المسجد أو المعلم مفقود');
      return {};
    }

    // استخدام API الجديد المُفلتر مسبقاً مع منع التخزين المؤقت
    console.log('🚀 فرض تحديث من API الجديد المُفلتر...');
    const apiUrl = `${API_BASE_URL}/mosques/${mosqueId}/attendance-today?teacher_id=${teacherId}&_t=${Date.now()}`;
    
    const response = await fetch(apiUrl, {
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
    console.log('📥 بيانات الحضور المحدثة من API الجديد:', data);
    
    // التحقق من تنسيق الاستجابة
    if (!data.success || !data.data || !data.data.attendance) {
      console.warn('⚠️ تنسيق الاستجابة غير صحيح');
      return {};
    }

    const attendanceMap: {[studentName: string]: AttendanceStatus} = {};
    
    // تحويل البيانات النظيفة من الخادم (بدون حاجة للفلترة)
    Object.entries(data.data.attendance).forEach(([studentName, status]) => {
      // تحويل "غير مسجل" إلى الحالة الافتراضية
      if (status === 'غير مسجل') {
        attendanceMap[studentName] = 'حاضر'; // افتراضي
      } else {
        attendanceMap[studentName] = convertStatusToArabic(status as string);
      }
    });
    
    console.log(`🔄 تم فرض تحديث حضور ${Object.keys(attendanceMap).length} طالب من API الجديد المُفلتر`);
    
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
