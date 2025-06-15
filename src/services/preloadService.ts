// خدمة التحميل المسبق للبيانات - تحسين تجربة المستخدم
import { getLastRecitationByType } from './recitationService';
import { getTeacherStudentsViaCircles } from './authService';
import { getTodayAttendance } from './attendanceService';

// واجهة البيانات المحملة مسبقاً
export interface PreloadedData {
  students: any[] | null;
  attendance: any | null;
  lastRecitations: {
    [studentId: string]: {
      حفظ: any | null;
      'مراجعة صغرى': any | null;
      'مراجعة كبرى': any | null;
    };
  };
  loadingStatus: {
    students: boolean;
    attendance: boolean;
    recitations: boolean;
  };
  lastUpdate: Date | null;
}

// البيانات الأولية
export const initialPreloadedData: PreloadedData = {
  students: null,
  attendance: null,
  lastRecitations: {},
  loadingStatus: {
    students: false,
    attendance: false,
    recitations: false
  },
  lastUpdate: null
};

/**
 * تحميل مسبق لقائمة الطلاب
 */
export const preloadStudents = async (
  teacherId: string, 
  mosqueId?: string,
  token?: string
): Promise<any[] | null> => {
  try {
    console.log('🔄 تحميل مسبق: جلب قائمة الطلاب...');
    
    const students = await getTeacherStudentsViaCircles(teacherId, token, mosqueId);
    
    console.log(`✅ تم تحميل ${students?.length || 0} طالب مسبقاً`);
    return students || [];
    
  } catch (error) {
    console.error('❌ خطأ في التحميل المسبق للطلاب:', error);
    return null;
  }
};

/**
 * تحميل مسبق لبيانات التحضير
 */
export const preloadAttendance = async (
  teacherId?: string,
  mosqueId?: string
): Promise<any | null> => {
  try {
    console.log('🔄 تحميل مسبق: جلب بيانات التحضير...');
    
    const attendance = await getTodayAttendance(teacherId, mosqueId);
    
    console.log(`✅ تم تحميل بيانات التحضير لـ ${Object.keys(attendance || {}).length} طالب`);
    return attendance;
    
  } catch (error) {
    console.error('❌ خطأ في التحميل المسبق للتحضير:', error);
    return null;
  }
};

/**
 * تحميل مسبق لآخر تسميع لجميع الطلاب
 */
export const preloadLastRecitations = async (
  students: any[]
): Promise<{ [studentId: string]: any }> => {
  try {
    console.log('🔄 تحميل مسبق: جلب آخر التسميعات...');
    
    const recitationPromises = students.map(async (student) => {
      const studentId = parseInt(student.id);
      const types = ['حفظ', 'مراجعة صغرى', 'مراجعة كبرى'];
      
      const studentRecitations = await Promise.all(
        types.map(async (type) => {
          const data = await getLastRecitationByType(studentId, type);
          return { type, data };
        })
      );

      const recitationsObj = {
        حفظ: null,
        'مراجعة صغرى': null,
        'مراجعة كبرى': null
      };

      studentRecitations.forEach(({ type, data }) => {
        recitationsObj[type as keyof typeof recitationsObj] = data;
      });

      return { studentId: student.id, recitations: recitationsObj };
    });

    const results = await Promise.all(recitationPromises);
    
    const lastRecitations: { [studentId: string]: any } = {};
    results.forEach(({ studentId, recitations }) => {
      lastRecitations[studentId] = recitations;
    });

    console.log(`✅ تم تحميل آخر التسميعات لـ ${students.length} طالب`);
    return lastRecitations;
    
  } catch (error) {
    console.error('❌ خطأ في التحميل المسبق للتسميعات:', error);
    return {};
  }
};

/**
 * تحميل مسبق سريع للبيانات الأساسية (بدون التسميعات)
 */
export const preloadEssentialData = async (
  teacherId: string,
  mosqueId?: string,
  token?: string
): Promise<Partial<PreloadedData>> => {
  console.log('🚀 بدء التحميل المسبق للبيانات الأساسية...');
  
  const startTime = Date.now();
  
  try {
    // تحميل الطلاب والتحضير فقط (بدون التسميعات للسرعة)
    const [students, attendance] = await Promise.all([
      preloadStudents(teacherId, mosqueId, token),
      preloadAttendance(teacherId, mosqueId)
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ انتهى التحميل المسبق للبيانات الأساسية في ${duration}ms`);
    
    return {
      students,
      attendance,
      lastRecitations: {}, // فارغ في البداية
      loadingStatus: {
        students: false,
        attendance: false,
        recitations: false // سيتم تحديثه لاحقاً
      },
      lastUpdate: new Date()
    };
    
  } catch (error) {
    console.error('❌ خطأ في التحميل المسبق للبيانات الأساسية:', error);
    return {
      students: null,
      attendance: null,
      lastRecitations: {},
      loadingStatus: {
        students: false,
        attendance: false,
        recitations: false
      },
      lastUpdate: null
    };
  }
};

/**
 * تحميل مسبق شامل لجميع البيانات (للتوافق مع النظام القديم)
 */
export const preloadAllData = async (
  teacherId: string,
  mosqueId?: string,
  token?: string
): Promise<Partial<PreloadedData>> => {
  console.log('🚀 بدء التحميل المسبق الشامل...');
  
  // تحميل البيانات الأساسية أولاً
  const essentialData = await preloadEssentialData(teacherId, mosqueId, token);
  
  // تحميل التسميعات في الخلفية (بدون انتظار)
  if (essentialData.students && essentialData.students.length > 0) {
    console.log('🔄 بدء تحميل التسميعات في الخلفية...');
    
    // تحديث حالة تحميل التسميعات
    essentialData.loadingStatus = {
      ...essentialData.loadingStatus!,
      recitations: true
    };
    
    // تحميل التسميعات في الخلفية
    preloadLastRecitations(essentialData.students).then(lastRecitations => {
      console.log('🎉 انتهى تحميل التسميعات في الخلفية');
      // يمكن تحديث البيانات هنا أو ترك هذا للمكونات التي تحتاجها
    }).catch(error => {
      console.error('❌ خطأ في تحميل التسميعات في الخلفية:', error);
    });
  }
  
  return essentialData;
};

/**
 * فحص ما إذا كانت البيانات تحتاج إعادة تحميل
 */
export const shouldReloadData = (lastUpdate: Date | null, maxAgeMinutes: number = 5): boolean => {
  if (!lastUpdate) return true;
  
  const now = new Date();
  const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
  
  return diffMinutes > maxAgeMinutes;
};
