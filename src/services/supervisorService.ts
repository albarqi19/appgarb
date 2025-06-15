// خدمة المشرف - الربط مع APIs الحقيقية
import { API_BASE_URL, getApiHeaders } from './authService';

// واجهات البيانات للمشرف
export interface SupervisorDashboardData {
  success: boolean;
  message: string;
  data?: {
    welcome_message: string;
    current_date: string;
    system_status: string;
    notifications: {
      new_students: number;
      pending_reports: number;
      upcoming_visits: number;
    };
  };
}

export interface SupervisorTeacher {
  id: number;
  name: string;
  phone: string;
  identity_number: string;
  job_title: string;
  task_type: string;
  work_time: string;
  is_active_user: boolean;
  evaluation: string | null;
  start_date: string | null;
  circle: {
    id: number;
    name: string;
  } | null;
  mosque: {
    id: number;
    name: string;
  } | null;
  mosques: { id: number; name: string; }[]; // المساجد التي يعمل بها المعلم
  circles_count: number; // عدد الحلقات
  students_count: number; // عدد الطلاب
}

export interface SupervisorTeachersResponse {
  success: boolean;
  message: string;
  data: SupervisorTeacher[];
  total_count: number;
  supervised_circles_count?: number;
}

export interface SupervisorStudent {
  id: number;
  name: string;
  phone: string | null;
  guardian_phone: string | null;
  identity_number: string;
  enrollment_date: string;
  circle: {
    id: number;
    name: string;
    mosque: {
      id: number;
      name: string;
    };
    teacher: {
      id: number;
      name: string;
    };
  };
  group: {
    id: number;
    name: string;
  };
  age?: number; // عمر الطالب
  total_score?: number; // الدرجة الكلية للطالب
}

export interface SupervisorStudentsResponse {
  success: boolean;
  message: string;
  data: SupervisorStudent[];
  total_count: number;
  supervised_circles_count?: number;
}

export interface SupervisorCircle {
  id: number;
  name: string;
  mosque: {
    id: number;
    name: string;
    neighborhood: string;
    location?: string; // موقع المسجد
  };
  time_period: string;
  max_students: number;
  current_students_count: number;
  groups_count: number;
}

export interface SupervisorCirclesResponse {
  success: boolean;
  data: SupervisorCircle[];
}

export interface SupervisorStatistics {
  circles_count: number; // عدد الحلقات المشرف عليها
  students_count: number; // عدد الطلاب الإجمالي
  teachers_count: number; // عدد المعلمين
  mosques_count: number; // عدد المساجد المشرف عليها  
  attendance_rate: number; // معدل الحضور
  transfer_requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  performance_metrics?: {
    excellent_students: number;
    good_students: number;
    needs_improvement: number;
    average_score: number;
  };
  recent_activities?: {
    new_students_this_week: number;
    evaluations_pending: number;
    reports_generated: number;
  };
  // إضافة الهياكل الجديدة للبيانات المرجعة من API
  supervisors?: {
    total_students: number;
    total_teachers: number;
    mosques_count: number;
    students_count: number;
    teachers_count: number;
    attendance_rate: number;
    teacher_attendance_rate: number;
    pending_transfers: number;
    transfer_requests: number;
    present_teachers: number;
  };
  circles?: {
    total_mosques: number;
    total_circles: number;
    active_circles: number;
  };
  averages?: {
    students_per_circle: number;
    teachers_per_mosque: number;
  };
}

export interface SupervisorStatisticsResponse {
  success: boolean;
  message: string;
  data: SupervisorStatistics;
}

// === دوال خدمة المشرف ===

/**
 * جلب بيانات لوحة تحكم المشرف
 */
export const getSupervisorDashboard = async (token?: string): Promise<SupervisorDashboardData | null> => {
  try {
    console.log('🎯 جلب بيانات لوحة تحكم المشرف');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisor/dashboard`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب بيانات لوحة تحكم المشرف: ${response.status}`);
      return null;
    }

    const data: SupervisorDashboardData = await response.json();
    console.log('✅ نجح جلب بيانات لوحة تحكم المشرف:', data);
    
    return data;

  } catch (error) {
    console.error('❌ خطأ في جلب بيانات لوحة تحكم المشرف:', error);
    return null;
  }
};

/**
 * جلب معلمي المشرف مع الفلترة
 */
export const getSupervisorTeachers = async (supervisorId?: number, token?: string): Promise<SupervisorTeacher[]> => {
  try {
    console.log('🎯 جلب معلمي المشرف:', supervisorId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // بناء URL مع معامل المشرف
    let url = `${API_BASE_URL}/supervisor/teachers`;
    if (supervisorId) {
      url += `?supervisor_id=${supervisorId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب معلمي المشرف: ${response.status}`);
      return [];
    }

    const data: SupervisorTeachersResponse = await response.json();
    console.log('✅ نجح جلب معلمي المشرف:', data);
    
    if (data.success && data.data) {
      console.log(`📊 تم جلب ${data.total_count} معلم للمشرف ${supervisorId}`);
      return data.data;
    }

    return [];

  } catch (error) {
    console.error('❌ خطأ في جلب معلمي المشرف:', error);
    return [];
  }
};

/**
 * جلب طلاب المشرف مع الفلترة
 */
export const getSupervisorStudents = async (supervisorId?: number, token?: string): Promise<SupervisorStudent[]> => {
  try {
    console.log('🎯 جلب طلاب المشرف:', supervisorId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // بناء URL مع معامل المشرف
    let url = `${API_BASE_URL}/supervisor/students`;
    if (supervisorId) {
      url += `?supervisor_id=${supervisorId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب طلاب المشرف: ${response.status}`);
      return [];
    }

    const data: SupervisorStudentsResponse = await response.json();
    console.log('✅ نجح جلب طلاب المشرف:', data);
    
    if (data.success && data.data) {
      console.log(`📊 تم جلب ${data.total_count} طالب للمشرف ${supervisorId}`);
      return data.data;
    }

    return [];

  } catch (error) {
    console.error('❌ خطأ في جلب طلاب المشرف:', error);
    return [];
  }
};

/**
 * جلب حلقات المشرف مع الفلترة
 */
export const getSupervisorCircles = async (supervisorId?: number, token?: string): Promise<SupervisorCircle[]> => {
  try {
    console.log('🎯 جلب حلقات المشرف:', supervisorId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // بناء URL مع معامل المشرف
    let url = `${API_BASE_URL}/supervisor/circles`;
    if (supervisorId) {
      url += `?supervisor_id=${supervisorId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب حلقات المشرف: ${response.status}`);
      return [];
    }

    const data: SupervisorCirclesResponse = await response.json();
    console.log('✅ نجح جلب حلقات المشرف:', data);
    
    if (data.success && data.data) {
      console.log(`📊 تم جلب ${data.data.length} حلقة للمشرف ${supervisorId}`);
      return data.data;
    }

    return [];

  } catch (error) {
    console.error('❌ خطأ في جلب حلقات المشرف:', error);
    return [];
  }
};

/**
 * جلب إحصائيات المشرفين - محدثة لاستخدام الـ endpoint الصحيح
 */
export const getSupervisorStatistics = async (token?: string): Promise<SupervisorStatistics | null> => {
  try {
    console.log('🎯 جلب إحصائيات المشرفين');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }    // استخدام الـ endpoint الصحيح للمشرف حسب التوثيق
    const response = await fetch(`${API_BASE_URL}/supervisors/statistics`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب إحصائيات المشرفين: ${response.status}`);
      // إرجاع بيانات تجريبية في حالة فشل API
      return {
        circles_count: 0,
        students_count: 0,
        teachers_count: 0,
        mosques_count: 0,
        attendance_rate: 0,
        transfer_requests: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          completed: 0
        }
      };
    }

    const data: SupervisorStatisticsResponse = await response.json();
    console.log('✅ نجح جلب إحصائيات المشرفين:', data);
    
    if (data.success && data.data) {
      return data.data;
    }

    return null;

  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات المشرفين:', error);
    // إرجاع بيانات افتراضية في حالة الخطأ
    return {
      circles_count: 0,
      students_count: 0,
      teachers_count: 0,
      mosques_count: 0,
      attendance_rate: 0,
      transfer_requests: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        completed: 0
      }
    };
  }
};

/**
 * طلب نقل طالب - حسب التوثيق
 */
export const requestStudentTransfer = async (transferData: any, token?: string): Promise<boolean> => {
  try {
    console.log('📤 إرسال طلب نقل طالب:', transferData);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/student-transfer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transferData)
    });

    if (!response.ok) {
      console.error(`فشل في إرسال طلب النقل: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ تم إرسال طلب النقل بنجاح:', data);
    
    return data.success;

  } catch (error) {
    console.error('❌ خطأ في إرسال طلب النقل:', error);
    return false;
  }
};

/**
 * تسجيل حضور معلم - حسب التوثيق
 */
export const recordTeacherAttendance = async (attendanceData: any, token?: string): Promise<boolean> => {
  try {
    console.log('📋 تسجيل حضور معلم:', attendanceData);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/teacher-attendance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(attendanceData)
    });

    if (!response.ok) {
      console.error(`فشل في تسجيل الحضور: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ تم تسجيل الحضور بنجاح:', data);
    
    return data.success;

  } catch (error) {
    console.error('❌ خطأ في تسجيل الحضور:', error);
    return false;
  }
};

/**
 * جلب طلبات النقل - حسب التوثيق
 */
export const getTransferRequests = async (token?: string): Promise<any[]> => {
  try {
    console.log('📋 جلب طلبات النقل');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/transfer-requests`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب طلبات النقل: ${response.status}`);
      return [];
    }    const data = await response.json();
    console.log('✅ تم جلب طلبات النقل:', data);
    
    return data.success ? data.data : [];

  } catch (error) {
    console.error('❌ خطأ في جلب طلبات النقل:', error);
    return [];
  }
};

/**
 * جلب جميع بيانات المشرف - دالة شاملة
 */
export const getSupervisorCompleteData = async (supervisorId: number, token?: string) => {
  try {
    console.log('🚀 جلب البيانات الشاملة للمشرف:', supervisorId);
    
    // جلب جميع البيانات بشكل متوازي
    const [dashboard, teachers, students, circles, statistics] = await Promise.all([
      getSupervisorDashboard(token),
      getSupervisorTeachers(supervisorId, token),
      getSupervisorStudents(supervisorId, token),
      getSupervisorCircles(supervisorId, token),
      getSupervisorStatistics(token)
    ]);

    const result = {
      dashboard,
      teachers,
      students,
      circles,
      statistics,
      // إحصائيات محسوبة
      computed: {
        totalTeachers: teachers.length,
        totalStudents: students.length,
        totalCircles: circles.length,
        activeMosques: new Set(circles.map(c => c.mosque.id)).size,
        avgStudentsPerCircle: circles.length > 0 ? 
          circles.reduce((sum, c) => sum + c.current_students_count, 0) / circles.length : 0
      }
    };

    console.log('✅ تم جلب البيانات الشاملة للمشرف بنجاح:', result);
    return result;

  } catch (error) {
    console.error('❌ خطأ في جلب البيانات الشاملة للمشرف:', error);
    return {
      dashboard: null,
      teachers: [],
      students: [],
      circles: [],
      statistics: null,
      computed: {
        totalTeachers: 0,
        totalStudents: 0,
        totalCircles: 0,
        activeMosques: 0,
        avgStudentsPerCircle: 0
      }
    };
  }
};

/**
 * إنشاء تقرير لمعلم - حسب التوثيق
 */
export const createTeacherReport = async (reportData: any, token?: string): Promise<boolean> => {
  try {
    console.log('📋 إنشاء تقرير للمعلم:', reportData);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/teacher-report`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      console.error(`فشل في إنشاء تقرير المعلم: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ تم إنشاء تقرير المعلم بنجاح:', data);
    
    return data.success;

  } catch (error) {
    console.error('❌ خطأ في إنشاء تقرير المعلم:', error);
    return false;
  }
};

/**
 * الحصول على تقرير شامل لمعلم - حسب التوثيق
 */
export const getTeacherReport = async (teacherId: number, token?: string): Promise<any | null> => {
  try {
    console.log('📊 جلب تقرير المعلم:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/teacher-report/${teacherId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب تقرير المعلم: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('✅ تم جلب تقرير المعلم بنجاح:', data);
    
    return data.success ? data.data : null;

  } catch (error) {
    console.error('❌ خطأ في جلب تقرير المعلم:', error);
    return null;
  }
};

/**
 * إنشاء تقييم جديد لمعلم - حسب التوثيق
 */
export const createTeacherEvaluation = async (evaluationData: any, token?: string): Promise<boolean> => {
  try {
    console.log('⭐ إنشاء تقييم للمعلم:', evaluationData);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/teacher-evaluations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(evaluationData)
    });

    if (!response.ok) {
      console.error(`فشل في إنشاء تقييم المعلم: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ تم إنشاء تقييم المعلم بنجاح:', data);
    
    return data.success;

  } catch (error) {
    console.error('❌ خطأ في إنشاء تقييم المعلم:', error);
    return false;
  }
};

/**
 * الحصول على تقييمات معلم محدد - حسب التوثيق
 */
export const getTeacherEvaluations = async (teacherId: number, token?: string): Promise<any | null> => {
  try {
    console.log('🔍 جلب تقييمات المعلم:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/teacher-evaluations/${teacherId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب تقييمات المعلم: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('✅ تم جلب تقييمات المعلم بنجاح:', data);
    
    return data.success ? data.data : null;

  } catch (error) {
    console.error('❌ خطأ في جلب تقييمات المعلم:', error);
    return null;
  }
};

/**
 * الموافقة على طلب نقل - حسب التوثيق
 */
export const approveTransferRequest = async (requestId: number, token?: string): Promise<boolean> => {
  try {
    console.log('✅ الموافقة على طلب النقل:', requestId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/transfer-requests/${requestId}/approve`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      console.error(`فشل في الموافقة على النقل: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ تمت الموافقة على النقل بنجاح:', data);
    
    return data.success;

  } catch (error) {
    console.error('❌ خطأ في الموافقة على النقل:', error);
    return false;
  }
};

/**
 * رفض طلب نقل - حسب التوثيق
 */
export const rejectTransferRequest = async (requestId: number, reason: string, token?: string): Promise<boolean> => {
  try {
    console.log('❌ رفض طلب النقل:', requestId, reason);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/transfer-requests/${requestId}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason })
    });

    if (!response.ok) {
      console.error(`فشل في رفض النقل: ${response.status}`);
      return false;
    }

    const data = await response.json();
    console.log('✅ تم رفض النقل بنجاح:', data);
    
    return data.success;

  } catch (error) {
    console.error('❌ خطأ في رفض النقل:', error);
    return false;
  }
};

// دوال مساعدة لتحويل البيانات

/**
 * تحويل بيانات المعلم من API إلى تنسيق محلي
 */
export const convertApiTeacherToLocal = (apiTeacher: SupervisorTeacher) => {
  return {
    id: apiTeacher.id.toString(),
    name: apiTeacher.name,
    phone: apiTeacher.phone,
    nationalId: apiTeacher.identity_number,
    jobTitle: apiTeacher.job_title,
    workTime: apiTeacher.work_time,
    isActive: apiTeacher.is_active_user,
    circle: apiTeacher.circle ? {
      id: apiTeacher.circle.id.toString(),
      name: apiTeacher.circle.name
    } : null,
    mosque: apiTeacher.mosque ? {
      id: apiTeacher.mosque.id.toString(),
      name: apiTeacher.mosque.name
    } : null
  };
};

/**
 * تحويل بيانات الطالب من API إلى تنسيق محلي
 */
export const convertApiStudentToLocal = (apiStudent: SupervisorStudent) => {
  return {
    id: apiStudent.id.toString(),
    name: apiStudent.name,
    phone: apiStudent.phone,
    guardianPhone: apiStudent.guardian_phone,
    nationalId: apiStudent.identity_number,
    enrollmentDate: apiStudent.enrollment_date,
    circle: {
      id: apiStudent.circle.id.toString(),
      name: apiStudent.circle.name
    },
    group: {
      id: apiStudent.group.id.toString(),
      name: apiStudent.group.name
    }
  };
};

/**
 * تحويل بيانات الحلقة من API إلى تنسيق محلي
 */
export const convertApiCircleToLocal = (apiCircle: SupervisorCircle) => {
  return {
    id: apiCircle.id.toString(),
    name: apiCircle.name,
    mosque: {
      id: apiCircle.mosque.id.toString(),
      name: apiCircle.mosque.name,
      neighborhood: apiCircle.mosque.neighborhood
    },
    timePeriod: apiCircle.time_period,
    maxStudents: apiCircle.max_students,
    currentStudentsCount: apiCircle.current_students_count,
    groupsCount: apiCircle.groups_count
  };
};

export default {
  getSupervisorDashboard,
  getSupervisorTeachers,
  getSupervisorStudents,
  getSupervisorCircles,
  getSupervisorStatistics,
  getSupervisorCompleteData,
  convertApiTeacherToLocal,
  convertApiStudentToLocal,
  convertApiCircleToLocal,
  requestStudentTransfer,
  recordTeacherAttendance,
  getTransferRequests,
  createTeacherReport,
  getTeacherReport,
  createTeacherEvaluation,
  getTeacherEvaluations,
  approveTransferRequest,
  rejectTransferRequest
};
