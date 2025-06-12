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
  total_supervisors: number;
  active_supervisors: number;
  total_mosques: number;
  total_circles: number;
  total_teachers: number;
  total_students: number;
  attendance_rate: number;
  performance_metrics: {
    excellent_students: number;
    good_students: number;
    needs_improvement: number;
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
 * جلب إحصائيات المشرفين
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
    }

    const response = await fetch(`${API_BASE_URL}/supervisors/statistics`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب إحصائيات المشرفين: ${response.status}`);
      return null;
    }

    const data: SupervisorStatisticsResponse = await response.json();
    console.log('✅ نجح جلب إحصائيات المشرفين:', data);
    
    if (data.success && data.data) {
      return data.data;
    }

    return null;

  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات المشرفين:', error);
    return null;
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
  convertApiCircleToLocal
};
