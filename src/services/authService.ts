// خدمات المصادقة والتواصل مع API
import { User, LoginResponse as UserLoginResponse, UserRole } from '../data/users';
import { Circle } from '../data/circles';

// إعدادات API
export const API_BASE_URL = 'http://localhost:8000/api';

// دالة مساعدة للحصول على headers مع دعم ngrok
export const getApiHeaders = (includeAuth: boolean = false, token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
  
  if (includeAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// واجهة تسجيل الدخول العامة لجميع أنواع المستخدمين
export interface LoginRequest {
  nationalId: string;
  password: string;
  userType?: 'teacher' | 'student' | 'parent' | 'supervisor'; // نوع المستخدم اختياري
}

export interface APILoginResponse {
  success: boolean;
  message: string;
  data?: {
    user_type: string;
    user_id: number;
    name: string;
    identity_number: string;
    must_change_password: boolean;
    token: string;
    expires_at?: string;
    phone?: string;
    email?: string;
    bio?: string;
    created_at?: string;
  };
  errors?: any;
}

// واجهة تسجيل الدخول للمعلم (للتوافق مع الكود القديم)
export interface TeacherLoginRequest extends LoginRequest {}
export interface TeacherLoginResponse extends APILoginResponse {}

// واجهة استجابة الأدوار المتعددة
export interface MultiRoleLoginResponse {
  multipleRoles: UserRole[];
}

// واجهة استجابة الحلقات
export interface CirclesResponse {
  // التنسيق الإنجليزي
  success?: boolean;
  message?: string;
  data?: Circle[];
  errors?: any;
  // التنسيق العربي
  نجح?: boolean;
  رسالة?: string;
  البيانات?: Circle[] | {
    الحلقات?: Circle[];
  };
}

// واجهة المسجد (تدعم كلا التنسيقين العربي والإنجليزي)
export interface Mosque {
  id: string | number;
  // الحقول الإنجليزية
  mosque_name?: string;
  district?: string;
  street?: string;
  phone?: string;
  // الحقول العربية
  اسم_المسجد?: string;
  الحي?: string;
  الشارع?: string;
  رقم_الاتصال?: string;
  // الحقول الجديدة من التوثيق
  العنوان?: string;
  النوع?: string;
  address?: string;
  type?: string;
  coordinates?: {
    latitude?: string;
    longitude?: string;
    map_link?: string;
  };
  created_at?: string;
  updated_at?: string;
}

// واجهة استجابة المساجد
export interface MosquesResponse {
  نجح: boolean;
  رسالة: string;
  البيانات?: Mosque[] | { data: Mosque[] };
  معلومات_التصفح?: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

// واجهة استجابة مسجد واحد
export interface MosqueResponse {
  نجح: boolean;
  رسالة: string;
  البيانات?: Mosque;
}

// واجهة ربط المعلم بالمسجد
export interface AssignTeacherRequest {
  teacher_id: number;
  notes?: string;
}

export interface AssignTeacherResponse {
  نجح: boolean;
  رسالة: string;
  البيانات?: {
    المعلم: {
      id: number;
      الاسم: string;
      رقم_الهوية: string;
      رقم_الجوال: string;
    };
    المسجد: {
      id: string;
      اسم_المسجد: string;
      الحي: string;
    };
    تاريخ_الربط: string;
    ملاحظات?: string;
  };
}

// واجهة بيانات الطالب مع المسجد
export interface StudentWithMosque {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  parent_phone?: string;
  mosque_id: string;
  mosque_name?: string;
  memorized_parts?: number;
  current_surah?: string;
  notes?: string;
  created_at?: string;
}

// واجهة استجابة الطلاب
export interface StudentsResponse {
  نجح: boolean;
  رسالة: string;
  البيانات?: StudentWithMosque[];
  معلومات_التصفح?: {
    current_page: number;
    total: number;
    per_page: number;
  };
}

// دالة تسجيل دخول المعلم
export const PIloginTeacher = async (credentials: TeacherLoginRequest): Promise<UserLoginResponse> => {  try {    console.log('محاولة تسجيل دخول المعلم:', credentials.nationalId);
    
    const requestBody = {
      identity_number: credentials.nationalId,
      password: credentials.password,
    };
    
    console.log('البيانات المرسلة إلى API:', requestBody);
      const response = await fetch(`${API_BASE_URL}/auth/teacher/login`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });    const data: TeacherLoginResponse = await response.json();
      console.log('حالة الاستجابة:', response.status);
    console.log('استجابة API:', data);
    console.log('بنية data.data:', data.data);

    if (!response.ok) {
      // طباعة تفاصيل الأخطاء للتشخيص
      if (data.errors) {
        console.log('أخطاء التحقق:', data.errors);
      }
      throw new Error(data.message || `خطأ HTTP: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.message || 'بيانات غير صحيحة');
    }    // تحويل البيانات من API إلى تنسيق التطبيق
    const user: User = {
      id: data.data.user_id?.toString() || '1',
      nationalId: data.data.identity_number || credentials.nationalId,
      password: '', // لا نحفظ كلمة المرور
      name: data.data.name || 'مستخدم',      roles: data.data.user_type ? [data.data.user_type as any] : ['teacher'],
      defaultRole: (data.data.user_type as any) || 'teacher',
      mosques: [], // سيتم تحميل المساجد لاحقاً من API المساجد
      phone: data.data.phone || '',
      email: data.data.email || '',
      bio: data.data.bio || '',
      createdAt: data.data.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    // تحديد مسار التوجيه حسب الدور
    let redirectPath = '/';
    if (user.roles.includes('teacher')) {
      redirectPath = user.roles.length > 1 ? '/role-selection' : '/dashboard';
    } else if (user.roles.includes('parent')) {
      redirectPath = '/parent-dashboard';
    } else if (user.roles.includes('supervisor')) {
      redirectPath = '/supervisor-dashboard';
    } else if (user.roles.includes('student')) {
      redirectPath = '/student-dashboard';
    }    return {
      user,
      token: data.data.token,
      redirectPath,
    };

  } catch (error) {
    console.error('خطأ في تسجيل دخول المعلم:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// دالة تسجيل دخول الطالب
export const loginStudent = async (credentials: LoginRequest): Promise<UserLoginResponse> => {
  try {
    console.log('محاولة تسجيل دخول الطالب:', credentials.nationalId);
    
    const requestBody = {
      identity_number: credentials.nationalId,
      password: credentials.password,
    };
      const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data: APILoginResponse = await response.json();
    console.log('استجابة API للطالب:', data);

    if (!response.ok) {
      if (data.errors) {
        console.log('أخطاء التحقق:', data.errors);
      }
      throw new Error(data.message || `خطأ HTTP: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.message || 'بيانات غير صحيحة');
    }

    const user: User = {
      id: data.data.user_id?.toString() || '1',
      nationalId: data.data.identity_number || credentials.nationalId,
      password: '',
      name: data.data.name || 'طالب',
      roles: ['student'],
      defaultRole: 'student',
      mosques: [],
      phone: data.data.phone || '',
      email: data.data.email || '',
      bio: data.data.bio || '',
      createdAt: data.data.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    return {
      user,
      token: data.data.token,
      redirectPath: '/student-dashboard',
    };

  } catch (error) {
    console.error('خطأ في تسجيل دخول الطالب:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// دالة تسجيل دخول ولي الأمر
export const loginParent = async (credentials: LoginRequest): Promise<UserLoginResponse> => {
  try {
    console.log('محاولة تسجيل دخول ولي الأمر:', credentials.nationalId);
    
    const requestBody = {
      identity_number: credentials.nationalId,
      password: credentials.password,
    };
      const response = await fetch(`${API_BASE_URL}/auth/parent/login`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data: APILoginResponse = await response.json();
    console.log('استجابة API لولي الأمر:', data);

    if (!response.ok) {
      if (data.errors) {
        console.log('أخطاء التحقق:', data.errors);
      }
      throw new Error(data.message || `خطأ HTTP: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.message || 'بيانات غير صحيحة');
    }

    const user: User = {
      id: data.data.user_id?.toString() || '1',
      nationalId: data.data.identity_number || credentials.nationalId,
      password: '',
      name: data.data.name || 'ولي أمر',
      roles: ['parent'],
      defaultRole: 'parent',
      mosques: [],
      phone: data.data.phone || '',
      email: data.data.email || '',
      bio: data.data.bio || '',
      createdAt: data.data.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    return {
      user,
      token: data.data.token,
      redirectPath: '/parent-dashboard',
    };

  } catch (error) {
    console.error('خطأ في تسجيل دخول ولي الأمر:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// دالة تسجيل دخول المشرف
export const loginSupervisor = async (credentials: LoginRequest): Promise<UserLoginResponse> => {
  try {
    console.log('محاولة تسجيل دخول المشرف:', credentials.nationalId);
    
    const requestBody = {
      identity_number: credentials.nationalId,
      password: credentials.password,
    };
      const response = await fetch(`${API_BASE_URL}/auth/supervisor/login`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data: APILoginResponse = await response.json();
    console.log('استجابة API للمشرف:', data);

    if (!response.ok) {
      if (data.errors) {
        console.log('أخطاء التحقق:', data.errors);
      }
      throw new Error(data.message || `خطأ HTTP: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.message || 'بيانات غير صحيحة');
    }

    const user: User = {
      id: data.data.user_id?.toString() || '1',
      nationalId: data.data.identity_number || credentials.nationalId,
      password: '',
      name: data.data.name || 'مشرف',
      roles: ['supervisor'],
      defaultRole: 'supervisor',
      mosques: [],
      phone: data.data.phone || '',
      email: data.data.email || '',
      bio: data.data.bio || '',
      createdAt: data.data.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    };

    return {
      user,
      token: data.data.token,
      redirectPath: '/supervisor-dashboard',
    };

  } catch (error) {
    console.error('خطأ في تسجيل دخول المشرف:', error);
    throw error instanceof Error ? error : new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// دالة تسجيل دخول عامة تجرب جميع أنواع المستخدمين
export const loginUniversal = async (credentials: LoginRequest): Promise<UserLoginResponse> => {
  console.log('محاولة تسجيل دخول عام للمستخدم:', credentials.nationalId);
    // قائمة دوال تسجيل الدخول للأنواع المختلفة
  const loginFunctions = [
    { name: 'teacher', fn: PIloginTeacher },
    { name: 'student', fn: loginStudent },
    { name: 'parent', fn: loginParent },
    { name: 'supervisor', fn: loginSupervisor }
  ];

  // إذا تم تحديد نوع المستخدم، جرب هذا النوع أولاً
  if (credentials.userType) {
    const specificLogin = loginFunctions.find(l => l.name === credentials.userType);
    if (specificLogin) {
      try {
        console.log(`جاري المحاولة مع نوع المستخدم المحدد: ${credentials.userType}`);
        return await specificLogin.fn(credentials);
      } catch (error) {
        console.log(`فشل تسجيل الدخول كـ ${credentials.userType}:`, error);
        // لا نرمي الخطأ هنا، سنجرب الأنواع الأخرى
      }
    }
  }

  // جرب جميع أنواع المستخدمين
  for (const loginType of loginFunctions) {
    // تخطي النوع المحدد إذا تم تجربته مسبقاً
    if (credentials.userType && loginType.name === credentials.userType) {
      continue;
    }

    try {
      console.log(`جاري المحاولة مع نوع المستخدم: ${loginType.name}`);
      const result = await loginType.fn(credentials);
      console.log(`نجح تسجيل الدخول كـ ${loginType.name}`);
      return result;
    } catch (error) {
      console.log(`فشل تسجيل الدخول كـ ${loginType.name}:`, error);
      // استمر في المحاولة مع النوع التالي
    }
  }

  // إذا فشلت جميع المحاولات
  throw new Error('بيانات تسجيل الدخول غير صحيحة أو المستخدم غير موجود');
};

// دالة تسجيل الخروج
export const logout = async (token: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
  }
};

// دالة التحقق من صحة التوكن
export const verifyToken = async (token: string): Promise<User | null> => {
  try {    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getApiHeaders(true, token),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      return null;
    }

    return {
      id: data.data.id,
      nationalId: data.data.nationalId,
      password: '',
      name: data.data.name,
      roles: data.data.roles || ['teacher'],
      defaultRole: data.data.defaultRole || 'teacher',
      mosques: data.data.mosques || [],
      phone: data.data.phone,
      email: data.data.email,
      bio: data.data.bio,
      createdAt: data.data.createdAt || new Date().toISOString(),
      lastLogin: data.data.lastLogin,
      isActive: data.data.isActive !== false,
    };

  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return null;
  }
};

// دالة جلب الحلقات الخاصة بالمعلم
export const getTeacherCircles = async (teacherId: string, token?: string): Promise<Circle[]> => {
  try {
    console.log('جلب حلقات المعلم:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }    // جرب endpoint الجديد أولاً
    let response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/circles`, {
      method: 'GET',
      headers: getApiHeaders(!!token, token),
    });

    if (!response.ok) {
      // جرب endpoint البديل
      console.log('جرب endpoint البديل للحلقات...');
      response = await fetch(`${API_BASE_URL}/circles/teacher/${teacherId}`, {
        method: 'GET',
        headers: getApiHeaders(!!token, token),
      });
    }

    if (!response.ok) {
      console.error('فشل في جلب حلقات المعلم من API:', response.status);
      return [];
    }

    const data: CirclesResponse = await response.json();
    console.log('استجابة API للحلقات:', data);    // دعم تنسيقات مختلفة للاستجابة
    let circlesData: any[] = [];
    
    if (data.success && data.data) {
      circlesData = data.data;
    } else if (data.نجح && data.البيانات) {
      // تنسيق عربي
      if (Array.isArray(data.البيانات)) {
        circlesData = data.البيانات;
      } else if (data.البيانات.الحلقات) {
        circlesData = data.البيانات.الحلقات;
      }
    }

    if (circlesData.length === 0) {
      console.log('لم يتم العثور على حلقات للمعلم');
      return [];
    }

    // تحويل البيانات إلى تنسيق موحد
    const circles = circlesData.map((circle: any) => ({
      id: circle.id?.toString() || '',
      name: circle.اسم_الحلقة || circle.name || 'غير محدد',
      mosqueId: circle.معرف_المسجد || circle.mosque_id || circle.المسجد?.id || '1',
      mosqueName: circle.اسم_المسجد || circle.mosque_name || circle.المسجد?.اسم || 'غير محدد',
      level: circle.المستوى || circle.level || 'غير محدد',
      studentsCount: circle.عدد_الطلاب || circle.students_count || 0,
      isActive: circle.نشط === 'نعم' || circle.is_active === true,
      schedule: circle.الجدول || circle.schedule || null
    }));

    console.log(`تم جلب ${circles.length} حلقة للمعلم ${teacherId}`);
    return circles;

  } catch (error) {
    console.error('خطأ في جلب حلقات المعلم من API:', error);
    return [];
  }
};

// دالة جلب جميع الحلقات
export const getAllCircles = async (token?: string): Promise<Circle[]> => {
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
      const response = await fetch(`${API_BASE_URL}/circles`, {
      method: 'GET',
      headers: getApiHeaders(!!token, token),
    });if (!response.ok) {
      console.error('فشل في جلب جميع الحلقات من API:', response.status);
      return [];
    }

    const data: CirclesResponse = await response.json();

    if (!data.success || !data.data) {
      console.error('استجابة غير صحيحة من API للحلقات:', data);
      return [];
    }

    return data.data;

  } catch (error) {
    console.error('خطأ في جلب الحلقات من API:', error);
    return [];
  }
};

// دالة جلب الطلاب الخاصة بالمعلم
export const getTeacherStudents = async (teacherId: string, token?: string) => {
  try {
    console.log('جلب طلاب المعلم:', teacherId);

    // جرب endpoints مختلفة حسب التوثيق
    const endpoints = [
      `/students?teacher_id=${teacherId}`,
      `/teachers/${teacherId}/students`,
      `/teacher/${teacherId}/students`
    ];
    
    let data = null;
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`محاولة استدعاء: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: getApiHeaders(!!token, token),
        });

        if (response.ok) {
          data = await response.json();
          console.log(`نجح استدعاء ${endpoint}:`, data);
          break;
        } else {
          console.warn(`فشل ${endpoint} مع كود:`, response.status);
          lastError = `HTTP ${response.status}`;
        }
      } catch (error) {
        console.warn(`خطأ في ${endpoint}:`, error);
        lastError = error;
      }
    }

    if (!data) {
      console.error('فشل جميع endpoints:', lastError);
      return [];
    }
    
    console.log('استجابة API للطلاب:', data);
    
    // إضافة logs مفصلة للتشخيص
    console.log('خصائص البيانات المتاحة:', Object.keys(data));
    console.log('data.نجح:', data.نجح);
    console.log('data.الطلاب:', data.الطلاب);
    if (data.الطلاب) {
      console.log('نوع data.الطلاب:', typeof data.الطلاب);
      console.log('هل data.الطلاب array؟', Array.isArray(data.الطلاب));
      console.log('طول data.الطلاب:', data.الطلاب?.length);
    }
      // التحقق من تنسيقات مختلفة للاستجابة
    let studentsArray = [];
    
    // تنسيق 1: البيانات مباشرة في data.الطلاب (التنسيق الصحيح حاليًا)
    if (data.نجح && data.الطلاب && Array.isArray(data.الطلاب)) {
      studentsArray = data.الطلاب;
      console.log('تم العثور على الطلاب في data.الطلاب:', studentsArray.length);
    }
    // تنسيق 2: البيانات مباشرة في data.data.الطلاب (حسب ملف معلم وطالب)
    else if (data.success && data.data && data.data.الطلاب) {
      studentsArray = data.data.الطلاب;
    }
    // تنسيق 3: البيانات في data.البيانات (حسب التوثيق العربي)
    else if (data.نجح && data.البيانات && Array.isArray(data.البيانات)) {
      studentsArray = data.البيانات;
    }
    // تنسيق 4: البيانات مباشرة في data (فرضية أخرى)
    else if (Array.isArray(data)) {
      studentsArray = data;
    }
    // تنسيق 5: البيانات في data.data مباشرة
    else if (data.data && Array.isArray(data.data)) {
      studentsArray = data.data;
    }
    
    if (studentsArray.length === 0) {
      console.log('لا توجد بيانات طلاب أو مصفوفة فارغة');
      return [];
    }
    
    // تحويل البيانات حسب التنسيق المستلم
    const convertedStudents = studentsArray.map((student: any) => ({
      id: student.id?.toString() || Math.random().toString(),
      name: student.الاسم || student.name || 'غير محدد',
      age: student.العمر || student.age || 0,
      mosque_id: student.معرف_المسجد || student.mosque_id || '1',
      phone: student.رقم_الهاتف || student.phone,
      parent_phone: student.رقم_ولي_الأمر || student.parent_phone,
      current_surah: student.المنهج_الحالي?.السورة_الحالية || student.current_surah,
      attendance_rate: student.إحصائيات_الحضور?.نسبة_الحضور ? 
        parseFloat(student.إحصائيات_الحضور.نسبة_الحضور.replace('%', '')) : 
        (student.attendance_rate || 85)
    }));
    
    console.log('الطلاب بعد التحويل:', convertedStudents);
    return convertedStudents;
    
  } catch (error) {
    console.error('خطأ في جلب طلاب المعلم:', error);
    return [];
  }
};

// دالة جلب الإحصائيات العامة
export const getGeneralStats = async (token?: string) => {
  try {
    console.log('جلب الإحصائيات العامة');
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/reports/general-stats`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب الإحصائيات من API: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('استجابة API للإحصائيات:', data);
    
    if (data.نجح && data.الإحصائيات_العامة) {
      return data.الإحصائيات_العامة;
    }

    return null;

  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    return null;
  }
};

// دالة جلب إحصائيات المعلم الشاملة
export const getTeacherStatistics = async (teacherId: string, token?: string) => {
  try {
    console.log('جلب إحصائيات المعلم:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/stats`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب إحصائيات المعلم: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('استجابة API لإحصائيات المعلم:', data);

    if (!data.نجح && !data.success) {
      console.error('استجابة غير صحيحة من API لإحصائيات المعلم:', data);
      return null;
    }

    return data.البيانات || data.data || null;

  } catch (error) {
    console.error('خطأ في جلب إحصائيات المعلم:', error);
    return null;
  }
};

// دالة جلب سجل حضور المعلم
export const getTeacherAttendance = async (
  teacherId: string, 
  params?: {
    start_date?: string;
    end_date?: string;
    month?: number;
    year?: number;
  },
  token?: string
) => {
  try {
    console.log('جلب سجل حضور المعلم:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // بناء query parameters
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/teachers/${teacherId}/attendance${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب سجل حضور المعلم: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log('استجابة API لسجل حضور المعلم:', data);

    if (!data.نجح && !data.success) {
      console.error('استجابة غير صحيحة من API لسجل حضور المعلم:', data);
      return [];
    }

    return data.البيانات || data.data || [];

  } catch (error) {
    console.error('خطأ في جلب سجل حضور المعلم:', error);
    return [];
  }
};

// ==== دوال مساعدة ====

// دالة توحيد بيانات المسجد من تنسيقات مختلفة
const normalizeMosqueData = (rawMosque: any): Mosque => {
  return {
    id: rawMosque.id?.toString() || rawMosque.id,
    mosque_name: rawMosque.mosque_name || rawMosque.اسم_المسجد || 'مسجد بدون اسم',
    district: rawMosque.district || rawMosque.الحي || rawMosque.العنوان || 'الحي غير محدد',
    street: rawMosque.street || rawMosque.الشارع || undefined,
    phone: rawMosque.phone || rawMosque.رقم_الاتصال || undefined,
    // الاحتفاظ بالحقول العربية أيضاً
    اسم_المسجد: rawMosque.اسم_المسجد || rawMosque.mosque_name,
    الحي: rawMosque.الحي || rawMosque.district,
    الشارع: rawMosque.الشارع || rawMosque.street,
    رقم_الاتصال: rawMosque.رقم_الاتصال || rawMosque.phone,
    // الحقول الجديدة من التوثيق
    العنوان: rawMosque.العنوان || rawMosque.address,
    النوع: rawMosque.النوع || rawMosque.type,
    coordinates: rawMosque.coordinates,
    created_at: rawMosque.created_at,
    updated_at: rawMosque.updated_at,
  };
};

// ==== APIs المساجد الجديدة ====

// دالة جلب جميع المساجد
export const getAllMosques = async (params?: {
  search?: string;
  district?: string;
  per_page?: number;
  page?: number;
}): Promise<Mosque[]> => {
  try {
    console.log('جلب جميع المساجد من API');
    
    // بناء query string
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.district) queryParams.append('district', params.district);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/mosques${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });    if (!response.ok) {
      console.warn(`فشل في جلب المساجد من API: ${response.status}`);
      // لا توجد مساجد افتراضية - النظام يعتمد فقط على API
      return [];
    }    const data: MosquesResponse = await response.json();
    console.log('استجابة API للمساجد:', data);

    if (!data.نجح) {
      console.warn('استجابة غير صحيحة من API للمساجد');
      return [];
    }    // التحقق من وجود البيانات - قد تكون في data.البيانات أو data.البيانات.data
    let rawMosques: any[] = [];
    if (data.البيانات) {
      if (Array.isArray(data.البيانات)) {
        rawMosques = data.البيانات;
      } else if (data.البيانات.data && Array.isArray(data.البيانات.data)) {
        rawMosques = data.البيانات.data;
      } else {
        // إذا كانت البيانات كائن واحد، ضعه في مصفوفة
        rawMosques = [data.البيانات];
      }
    }

    // توحيد البيانات باستخدام الدالة المساعدة
    const mosques: Mosque[] = rawMosques.map(normalizeMosqueData);

    console.log('المساجد المستخرجة والموحدة:', mosques);
    return mosques;} catch (error) {
    console.error('خطأ في جلب المساجد:', error);
    // لا توجد مساجد افتراضية - النظام يعتمد فقط على API
    return [];
  }
};

// دالة جلب تفاصيل مسجد محدد
export const getMosqueById = async (mosqueId: string): Promise<Mosque | null> => {
  try {
    console.log('جلب تفاصيل المسجد:', mosqueId);
    
    const response = await fetch(`${API_BASE_URL}/mosques/${mosqueId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`فشل في جلب تفاصيل المسجد من API: ${response.status}`);
      return null;
    }

    const data: MosqueResponse = await response.json();
    console.log('استجابة API لتفاصيل المسجد:', data);    if (!data.نجح || !data.البيانات) {
      console.warn('استجابة غير صحيحة من API لتفاصيل المسجد');
      return null;
    }    const normalizedMosque = normalizeMosqueData(data.البيانات);
    console.log('المسجد بعد التوحيد:', normalizedMosque);
    return normalizedMosque;
  } catch (error) {
    console.error('خطأ في جلب تفاصيل المسجد:', error);
    return null;
  }
};

// دالة جلب مساجد المعلم مباشرة من API
export const getTeacherMosques = async (teacherId: string, token?: string): Promise<Mosque[]> => {
  try {
    console.log('جلب مساجد المعلم مباشرة:', teacherId);

    // جلب مساجد المعلم مباشرة من API
    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/mosques`, {
      method: 'GET',
      headers: getApiHeaders(!!token, token),
    });if (response.ok) {
      const data: any = await response.json();
      console.log('استجابة API لمساجد المعلم:', data);

      if (data.نجح && data.المساجد && Array.isArray(data.المساجد)) {
        const mosques = data.المساجد.map((mosque: any) => ({
          id: mosque.معرف_المسجد || mosque.id,
          اسم_المسجد: mosque.اسم_المسجد,
          mosque_name: mosque.اسم_المسجد,
          الحي: mosque.الحي || 'غير محدد',
          district: mosque.الحي || 'غير محدد',
          الشارع: mosque.الشارع || '',
          street: mosque.الشارع || '',
          نوع_التكليف: mosque.نوع_التكليف || 'أساسي'
        }));
        
        console.log(`تم جلب ${mosques.length} مسجد للمعلم ${teacherId}`);
        return mosques;
      }
    } else {
      console.warn(`API مساجد المعلم غير متوفر: ${response.status}`);
    }

    // البديل الثاني: محاولة جلب مساجد المعلم من خلال API منفصل للمساجد    // البديل الثاني: محاولة جلب مساجد المعلم من خلال API منفصل للمساجد
    try {
      console.log('محاولة جلب المساجد من خلال getTeacherCircles الأصلي...');
      const teacherCircles = await getTeacherCircles(teacherId, token);
      
      if (teacherCircles.length > 0) {
        // استخراج معرفات المساجد من الحلقات
        const mosqueIds = Array.from(new Set(teacherCircles.map(circle => circle.mosqueId)));
        console.log('معرفات المساجد من الحلقات:', mosqueIds);

        // جلب تفاصيل كل مسجد
        const mosquePromises = mosqueIds.map(id => getMosqueById(id));
        const mosqueResults = await Promise.all(mosquePromises);
        
        // فلترة النتائج الصحيحة فقط
        const validMosques = mosqueResults.filter((mosque): mosque is Mosque => mosque !== null);
        
        console.log('مساجد المعلم من getTeacherCircles:', validMosques);
        return validMosques;
      }
    } catch (circlesError) {
      console.warn('فشل في جلب المساجد من getTeacherCircles:', circlesError);
    }

    console.log('لا توجد مساجد متاحة للمعلم');
    return [];

  } catch (error) {
    console.error('خطأ في جلب مساجد المعلم:', error);
    return [];
  }
};

// دالة البحث عن المساجد القريبة
export const getNearbyMosques = async (params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}): Promise<Mosque[]> => {
  try {
    console.log('البحث عن المساجد القريبة:', params);
    
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      radius: (params.radius || 5).toString(),
      limit: (params.limit || 10).toString(),
    });
    
    const response = await fetch(`${API_BASE_URL}/mosques/nearby/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`فشل في البحث عن المساجد القريبة: ${response.status}`);
      return [];
    }    const data: MosquesResponse = await response.json();
    console.log('استجابة API للمساجد القريبة:', data);

    if (!data.نجح) {
      console.warn('استجابة غير صحيحة من API للمساجد القريبة');
      return [];
    }    // استخراج المساجد من البيانات
    let rawMosques: any[] = [];
    if (data.البيانات) {
      if (Array.isArray(data.البيانات)) {
        rawMosques = data.البيانات;
      } else if (data.البيانات.data && Array.isArray(data.البيانات.data)) {
        rawMosques = data.البيانات.data;
      } else {
        // إذا كانت البيانات كائن واحد، ضعه في مصفوفة
        rawMosques = [data.البيانات];
      }
    }

    // توحيد البيانات
    const mosques = rawMosques.map(normalizeMosqueData);
    return mosques;
  } catch (error) {
    console.error('خطأ في البحث عن المساجد القريبة:', error);
    return [];
  }
};

// دالة جلب إحصائيات المسجد
export const getMosqueStatistics = async (mosqueId: string): Promise<any> => {
  try {
    console.log('جلب إحصائيات المسجد:', mosqueId);
    
    const response = await fetch(`${API_BASE_URL}/mosques/${mosqueId}/statistics`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`فشل في جلب إحصائيات المسجد: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('استجابة API لإحصائيات المسجد:', data);

    if (!data.نجح) {
      console.warn('استجابة غير صحيحة من API لإحصائيات المسجد');
      return null;
    }

    return data.البيانات;
  } catch (error) {
    console.error('خطأ في جلب إحصائيات المسجد:', error);
    return null;
  }
};

// ==== APIs ربط المعلم بالمسجد ====

// دالة ربط معلم بمسجد محدد
export const assignTeacherToMosque = async (
  mosqueId: string, 
  teacherId: number, 
  notes?: string,
  token?: string
): Promise<AssignTeacherResponse> => {
  try {
    console.log('ربط المعلم بالمسجد:', { mosqueId, teacherId, notes });
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      teacher_id: teacherId,
      notes: notes || null
    };
    
    const response = await fetch(`${API_BASE_URL}/mosques/${mosqueId}/assign-teacher`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data: AssignTeacherResponse = await response.json();
    console.log('استجابة API لربط المعلم:', data);

    if (!response.ok) {
      console.error('فشل في ربط المعلم بالمسجد:', response.status, data);
      throw new Error(data.رسالة || `خطأ HTTP: ${response.status}`);
    }

    if (!data.نجح) {
      throw new Error(data.رسالة || 'فشل في ربط المعلم بالمسجد');
    }

    console.log('تم ربط المعلم بالمسجد بنجاح');
    return data;

  } catch (error) {
    console.error('خطأ في ربط المعلم بالمسجد:', error);
    throw error;
  }
};

// دالة إلغاء ربط معلم من مسجد
export const unassignTeacherFromMosque = async (
  mosqueId: string, 
  teacherId: number, 
  reason?: string,
  token?: string
): Promise<AssignTeacherResponse> => {
  try {
    console.log('إلغاء ربط المعلم من المسجد:', { mosqueId, teacherId, reason });
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      teacher_id: teacherId,
      reason: reason || null
    };
    
    const response = await fetch(`${API_BASE_URL}/mosques/${mosqueId}/unassign-teacher`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data: AssignTeacherResponse = await response.json();
    console.log('استجابة API لإلغاء ربط المعلم:', data);

    if (!response.ok) {
      console.error('فشل في إلغاء ربط المعلم:', response.status, data);
      throw new Error(data.رسالة || `خطأ HTTP: ${response.status}`);
    }

    if (!data.نجح) {
      throw new Error(data.رسالة || 'فشل في إلغاء ربط المعلم');
    }

    console.log('تم إلغاء ربط المعلم من المسجد بنجاح');
    return data;

  } catch (error) {
    console.error('خطأ في إلغاء ربط المعلم:', error);
    throw error;
  }
};

// دالة نقل معلم من مسجد إلى آخر
export const transferTeacherBetweenMosques = async (
  fromMosqueId: string,
  toMosqueId: string, 
  teacherId: number, 
  transferReason?: string,
  notes?: string,
  token?: string
): Promise<AssignTeacherResponse> => {
  try {
    console.log('نقل المعلم بين المساجد:', { fromMosqueId, toMosqueId, teacherId });
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      teacher_id: teacherId,
      to_mosque_id: toMosqueId,
      transfer_reason: transferReason || null,
      notes: notes || null
    };
    
    const response = await fetch(`${API_BASE_URL}/mosques/${fromMosqueId}/transfer-teacher`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const data: AssignTeacherResponse = await response.json();
    console.log('استجابة API لنقل المعلم:', data);

    if (!response.ok) {
      console.error('فشل في نقل المعلم:', response.status, data);
      throw new Error(data.رسالة || `خطأ HTTP: ${response.status}`);
    }

    if (!data.نجح) {
      throw new Error(data.رسالة || 'فشل في نقل المعلم');
    }

    console.log('تم نقل المعلم بين المساجد بنجاح');
    return data;

  } catch (error) {
    console.error('خطأ في نقل المعلم:', error);
    throw error;
  }
};

// دالة جلب طلاب مسجد محدد
export const getMosqueStudents = async (
  mosqueId: string, 
  params?: {
    search?: string;
    page?: number;
    per_page?: number;
  },
  token?: string
): Promise<StudentWithMosque[]> => {
  try {
    console.log('جلب طلاب المسجد:', mosqueId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // بناء query parameters
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/mosques/${mosqueId}/students${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error('فشل في جلب طلاب المسجد من API:', response.status);
      return [];
    }

    const data: StudentsResponse = await response.json();
    console.log('استجابة API لطلاب المسجد:', data);
    
    if (!data.نجح || !data.البيانات) {
      console.error('استجابة غير صحيحة من API لطلاب المسجد:', data);
      return [];
    }

    console.log(`تم جلب ${data.البيانات.length} طالب من المسجد ${mosqueId}`);
    return data.البيانات;

  } catch (error) {
    console.error('خطأ في جلب طلاب المسجد:', error);
    return [];
  }
};

// دالة جلب عدد طلاب المسجد فقط (للإحصائيات)
export const getMosqueStudentsCount = async (mosqueId: string, token?: string): Promise<number> => {
  try {
    console.log('جلب عدد طلاب المسجد:', mosqueId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/mosques/${mosqueId}/students/count`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب عدد طلاب المسجد: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    console.log('استجابة API لعدد طلاب المسجد:', data);

    if (data.نجح && typeof data.العدد === 'number') {
      return data.العدد;
    }

    // إذا لم يتوفر API للعدد، نجلب جميع الطلاب ونحسب عددهم
    const students = await getMosqueStudents(mosqueId, undefined, token);
    return students.length;
  } catch (error) {
    console.error('خطأ في جلب عدد طلاب المسجد:', error);
    return 0;
  }
};

// دالة جلب طلاب الحلقات
export const getCircleStudents = async (circleIds: string[], token?: string) => {
  try {
    console.log('جلب طلاب الحلقات:', circleIds);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // جلب من البيانات المحلية إذا فشل API
    const { students } = await import('../data/students');
    const { mosques } = await import('../data/mosques');
    
    const circleStudents = students.filter(student => 
      circleIds.includes(student.circleId || '') && student.mosqueId
    );

    // تحويل البيانات إلى التنسيق المطلوب مع معلومات المسجد
    const convertedStudents = circleStudents.map(student => {
      const mosque = mosques.find(m => m.id === student.mosqueId);
      
      return {
        id: student.id,
        name: student.name || 'غير محدد',
        age: student.age || 0,
        level: student.level || 'غير محدد',
        attendanceRate: student.attendanceRate || 0,
        totalScore: student.totalScore || 0,
        phone: student.phone || '',
        parentPhone: student.parentPhone || '',
        mosque: {
          id: student.mosqueId,
          name: mosque?.name || 'غير محدد',
          location: mosque?.location || 'غير محدد'
        },
        currentMemorization: student.currentMemorization || {
          surahName: 'البقرة',
          fromAyah: 1,
          toAyah: 1
        },
        circleId: student.circleId
      };
    });

    console.log(`تم العثور على ${convertedStudents.length} طالب في الحلقات المحددة`);
    return convertedStudents;
    
  } catch (error) {
    console.error('خطأ في جلب طلاب الحلقات:', error);
    return [];
  }
};

// دالة محدثة لجلب طلاب المعلم حسب المسجد المحدد (endpoint محسن)
export const getTeacherStudentsViaCircles = async (teacherId: string, token?: string, mosqueId?: string) => {
  try {
    console.log('جلب طلاب المعلم للمسجد المحدد:', teacherId, 'مسجد:', mosqueId);

    // استخدام endpoint المحسن للحصول على طلاب المعلم في مسجد محدد
    if (mosqueId) {
      console.log('🎯 استخدام endpoint المحسن:', `/teachers/${teacherId}/mosques/${mosqueId}/students`);
      const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/mosques/${mosqueId}/students`, {
        method: 'GET',
        headers: getApiHeaders(!!token, token),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ استجابة API للطلاب في المسجد المحدد:', data);
        
        if (data.نجح && data.الطلاب && Array.isArray(data.الطلاب)) {
          console.log(`📊 تم جلب ${data.الطلاب.length} طالب للمعلم ${teacherId} في المسجد ${mosqueId}`);
          
          // تحويل البيانات إلى التنسيق المطلوب
          const convertedStudents = data.الطلاب.map((student: any) => ({
            id: student.student_id?.toString() || student.id?.toString() || Math.random().toString(),
            name: student.اسم_الطالب || student.name || 'غير محدد',
            age: student.العمر || student.age || 18,
            level: student.المستوى || 'متوسط',
            attendanceRate: student.نسبة_الحضور || 85,
            totalScore: student.النقاط_الإجمالية || 85,
            phone: student.رقم_الهاتف || '',
            parentPhone: student.رقم_ولي_الأمر || '',
            mosque: {
              id: student.مسجد?.معرف_المسجد || mosqueId,
              name: student.مسجد?.اسم_المسجد || 'غير محدد',
              location: student.مسجد?.العنوان || 'غير محدد'
            },
            currentMemorization: {
              surahName: student.الحفظ_الحالي?.السورة || 'الفاتحة',
              fromAyah: student.الحفظ_الحالي?.من_آية || 1,
              toAyah: student.الحفظ_الحالي?.إلى_آية || 1
            },
            circleId: student.حلقة?.معرف_الحلقة?.toString() || '',
            circleName: student.حلقة?.اسم_الحلقة || 'غير محدد',
            memorizedPages: student.الصفحات_المحفوظة || 0,
            targetPages: student.الصفحات_المستهدفة || 10,
            completionRate: student.نسبة_الإنجاز || 0,
            lastProgress: {
              date: new Date().toISOString().split('T')[0],
              pages: student.آخر_تقدم?.الصفحات || 0
            },
            isActive: student.نشط === 'نعم'
          }));

          return convertedStudents;
        } else {
          console.log('❌ فشل في العثور على بيانات طلاب صالحة:', data);
          return [];
        }
      } else {
        console.warn(`❌ فشل في جلب طلاب المعلم من المسجد المحدد: ${response.status}`);
        return [];
      }
    }

    // إذا لم يتم تحديد المسجد، ارجع قائمة فارغة
    console.log('⚠️ لم يتم تحديد معرف المسجد');
    return [];
    
  } catch (error) {
    console.error('❌ خطأ في جلب طلاب المعلم:', error);
    return [];
  }
};

// دالة جلب مساجد المعلم مع جميع التفاصيل والحلقات والطلاب
export const getTeacherMosquesWithDetails = async (teacherId: string, token?: string) => {
  try {
    console.log('جلب مساجد المعلم مع التفاصيل الشاملة:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/mosques`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب مساجد المعلم مع التفاصيل: ${response.status}`);
      return {
        teacherInfo: null,
        statistics: { mosquesCount: 0, circlesCount: 0, totalStudents: 0 },
        mosques: []
      };
    }

    const data = await response.json();
    console.log('استجابة API لمساجد المعلم مع التفاصيل:', data);

    if (!data.نجح || !data.البيانات) {
      console.error('استجابة غير صحيحة من API لمساجد المعلم:', data);
      return {
        teacherInfo: null,
        statistics: { mosquesCount: 0, circlesCount: 0, totalStudents: 0 },
        mosques: []
      };
    }

    // تحويل البيانات إلى تنسيق موحد
    const result = {
      teacherInfo: data.البيانات.معلومات_المعلم || null,
      statistics: {
        mosquesCount: data.البيانات.الإحصائيات?.عدد_المساجد || 0,
        circlesCount: data.البيانات.الإحصائيات?.عدد_الحلقات || 0,
        totalStudents: data.البيانات.الإحصائيات?.إجمالي_الطلاب || 0
      },
      mosques: (data.البيانات.المساجد || []).map((mosque: any) => ({
        id: mosque.id?.toString() || '',
        name: mosque.اسم_المسجد || mosque.name || 'غير محدد',
        address: mosque.العنوان || mosque.address || 'غير محدد',
        type: mosque.النوع || mosque.type || 'غير محدد',
        circles: (mosque.الحلقات || []).map((circle: any) => ({
          id: circle.id?.toString() || '',
          name: circle.اسم_الحلقة || circle.name || 'غير محدد',
          level: circle.المستوى || circle.level || 'غير محدد',
          studentsCount: circle.عدد_الطلاب || 0,
          activeStudents: circle.الطلاب_النشطون || 0,
          students: (circle.الطلاب || []).map((student: any) => ({
            id: student.id?.toString() || '',
            name: student.الاسم || student.name || 'غير محدد',
            studentNumber: student.رقم_الطالب || student.student_number || '',
            phone: student.رقم_الهاتف || student.phone || '',
            isActive: student.نشط === 'نعم' || student.is_active === true
          }))
        })),
        schedules: (mosque.الجداول || []).map((schedule: any) => ({
          id: schedule.id?.toString() || '',
          day: schedule.اليوم || schedule.day || '',
          startTime: schedule.وقت_البداية || schedule.start_time || '',
          endTime: schedule.وقت_النهاية || schedule.end_time || '',
          sessionType: schedule.نوع_الجلسة || schedule.session_type || '',
          notes: schedule.ملاحظات || schedule.notes || ''
        }))
      }))
    };

    console.log(`تم جلب ${result.mosques.length} مسجد للمعلم ${teacherId} مع ${result.statistics.totalStudents} طالب`);
    return result;

  } catch (error) {
    console.error('خطأ في جلب مساجد المعلم مع التفاصيل:', error);
    return {
      teacherInfo: null,
      statistics: { mosquesCount: 0, circlesCount: 0, totalStudents: 0 },
      mosques: []
    };
  }
};

// دالة جديدة: جلب مساجد المعلم مع التفاصيل الكاملة (وفقاً للتوثيق الجديد)
export const getTeacherMosquesWithFullDetails = async (teacherId: string, token?: string) => {
  try {
    console.log('جلب مساجد المعلم مع التفاصيل الكاملة:', teacherId);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/mosques`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`API مساجد المعلم مع التفاصيل غير متوفر: ${response.status}`);
      return null;
    }

    const data: any = await response.json();
    console.log('استجابة API لمساجد المعلم مع التفاصيل:', data);

    if (!data.نجح || !data.البيانات) {
      console.warn('استجابة غير صحيحة من API لمساجد المعلم مع التفاصيل');
      return null;
    }

    // إرجاع البيانات الكاملة وفقاً للتوثيق
    return {
      teacherInfo: data.البيانات.معلومات_المعلم || null,
      statistics: data.البيانات.الإحصائيات || null,
      mosques: data.البيانات.المساجد || []
    };

  } catch (error) {
    console.error('خطأ في جلب مساجد المعلم مع التفاصيل:', error);
    return null;
  }
};

// دالة جلب طلاب مسجد محدد للمعلم
export const getTeacherMosqueStudents = async (teacherId: string, mosqueId: string, token?: string) => {
  try {
    console.log(`جلب طلاب المعلم ${teacherId} في المسجد ${mosqueId}`);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}/mosques/${mosqueId}/students`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`فشل في جلب طلاب المعلم في المسجد: ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log('استجابة API لطلاب المعلم في المسجد:', data);
      // التحقق من تنسيقات مختلفة للاستجابة
    let studentsArray = [];
    
    // تنسيق الاستجابة الجديد
    if (data.الطلاب && Array.isArray(data.الطلاب)) {
      studentsArray = data.الطلاب;
    }
    // تنسيق عربي
    else if (data.نجح && data.البيانات && Array.isArray(data.البيانات)) {
      studentsArray = data.البيانات;
    }
    // تنسيق إنجليزي
    else if (data.success && data.data && Array.isArray(data.data)) {
      studentsArray = data.data;
    }
    else if (data.students && Array.isArray(data.students)) {
      studentsArray = data.students;
    }
    // البيانات مباشرة
    else if (Array.isArray(data)) {
      studentsArray = data;
    }
    
    if (studentsArray.length === 0) {
      console.log('لا توجد بيانات طلاب للمعلم في هذا المسجد');
      return [];
    }
      // تحويل البيانات حسب التنسيق المستلم
    const convertedStudents = studentsArray.map((student: any) => ({
      id: (student.student_id || student.id)?.toString() || Math.random().toString(),
      name: student.اسم_الطالب || student.الاسم || student.name || 'غير محدد',
      age: student.العمر || student.age || 0,
      mosque_id: mosqueId,
      phone: student.رقم_الهاتف || student.phone,
      parent_phone: student.رقم_ولي_الأمر || student.parent_phone,
      current_surah: student.منهج_حالي?.السورة_الحالية || student.المنهج_الحالي?.السورة_الحالية || student.current_surah || 'غير محدد',
      level: student.المستوى || student.level || 'مبتدئ',
      attendance_rate: student.حضور_الشهر_الحالي?.نسبة_الحضور || student.إحصائيات_الحضور?.نسبة_الحضور ? 
        parseFloat((student.حضور_الشهر_الحالي?.نسبة_الحضور || student.إحصائيات_الحضور?.نسبة_الحضور).toString().replace('%', '')) : 
        (student.attendance_rate || 85),
      totalScore: student.الدرجة_الإجمالية || student.total_score || 80,
      circleId: student.حلقة?.id || student.معرف_الحلقة || student.circle_id,
      circle_name: student.حلقة?.اسم_الحلقة || student.اسم_الحلقة || student.circle_name,
      gender: student.الجنس || student.gender,
      identity_number: student.رقم_الهوية || student.identity_number,
      registration_date: student.تاريخ_التسجيل || student.registration_date,
      notes: student.ملاحظات_المعلم || student.notes,
      is_active: student.نشط === 'نعم' || student.is_active || true
    }));
    
    console.log(`تم جلب ${convertedStudents.length} طالب للمعلم ${teacherId} في المسجد ${mosqueId}:`, convertedStudents);
    return convertedStudents;
    
  } catch (error) {
    console.error('خطأ في جلب طلاب المعلم في المسجد:', error);
    return [];
  }
};

// === دوال API للطلاب ===

// واجهة بيانات الطالب من API
export interface APIStudentData {
  id: number;
  name: string;
  identity_number?: string;
  age?: number;
  phone?: string;
  parent_phone?: string;
  level?: string;
  mosque?: {
    id: number;
    name: string;
  };
}

// واجهة إحصائيات التسميع للطالب
export interface StudentRecitationStats {
  student: {
    id: number;
    name: string;
    identity_number: string;
  };
  total_sessions: number;
  sessions_with_errors: number;
  sessions_without_errors: number;
  error_rate_percentage: number;
  average_grade: number;
  last_session_date: string;
}

// واجهة المنهج اليومي للطالب
export interface StudentDailyCurriculum {
  student: {
    name: string;
    mosque: string;
  };
  current_curriculum: {
    name: string;
    level: string;
    completion_percentage: number;
  };
  daily_curriculum: {
    memorization: {
      id: number;
      type: string;
      content: string;
      expected_days: number;
    } | null;
    minor_review: any;
    major_review: any;
  };
  today_recitations: {
    memorization: any;
    minor_review: any;
    major_review: any;
  };
}

/**
 * الحصول على إحصائيات التسميع للطالب
 */
export async function getStudentRecitationStats(studentId: string | number): Promise<StudentRecitationStats> {
  try {
    console.log('🚀 جلب إحصائيات التسميع للطالب:', studentId);
    
    const response = await fetch(`${API_BASE_URL}/recitation/sessions/stats/student/${studentId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ تم جلب إحصائيات التسميع بنجاح:', data);
    
    return data.data || data;
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات التسميع:', error);
    throw error;
  }
}

/**
 * الحصول على المنهج اليومي للطالب
 */
export async function getStudentDailyCurriculum(studentId: string | number): Promise<StudentDailyCurriculum> {
  try {
    console.log('🚀 جلب المنهج اليومي للطالب:', studentId);
    
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/daily-curriculum`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ تم جلب المنهج اليومي بنجاح:', data);
    
    return data.data || data;
  } catch (error) {
    console.error('❌ خطأ في جلب المنهج اليومي:', error);
    throw error;
  }
}

/**
 * الحصول على معلومات المستخدم الحالي (للطلاب)
 */
export async function getCurrentStudentInfo(userId: string | number): Promise<APIStudentData> {
  try {
    console.log('🚀 جلب معلومات الطالب الحالي:', userId);
    
    // محاولة استخدام endpoint المنهج اليومي للحصول على معلومات الطالب
    const curriculumData = await getStudentDailyCurriculum(userId);
    
    // تحويل البيانات إلى تنسيق موحد
    const studentInfo: APIStudentData = {
      id: Number(userId),
      name: curriculumData.student.name,
      mosque: {
        id: 1, // معرف افتراضي
        name: curriculumData.student.mosque
      }
    };
    
    console.log('✅ تم جلب معلومات الطالب بنجاح:', studentInfo);
    return studentInfo;
    
  } catch (error) {
    console.error('❌ خطأ في جلب معلومات الطالب:', error);
    throw error;
  }
}

/**
 * دالة مجمعة لجلب جميع بيانات الطالب
 */
export async function getStudentDashboardData(studentId: string | number) {
  try {
    console.log('🚀 جلب جميع بيانات داشبورد الطالب:', studentId);
    
    const [recitationStats, dailyCurriculum, studentInfo] = await Promise.all([
      getStudentRecitationStats(studentId),
      getStudentDailyCurriculum(studentId),
      getCurrentStudentInfo(studentId)
    ]);
    
    console.log('✅ تم جلب بيانات الداشبورد بنجاح');
    
    return {
      recitationStats,
      dailyCurriculum,
      studentInfo,
      hasData: !!(recitationStats || dailyCurriculum || studentInfo),
      isUsingFallbackData: false
    };
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الداشبورد:', error);
    throw error;
  }
}

/**
 * فحص الأدوار المتاحة للمستخدم
 */
export async function checkAvailableRoles(credentials: LoginRequest): Promise<UserRole[]> {
  try {
    console.log('🔍 فحص الأدوار المتاحة للمستخدم:', credentials.nationalId);
    
    // محاولة تسجيل الدخول لكل نوع مستخدم لمعرفة الأدوار المتاحة
    const availableRoles: UserRole[] = [];
    
    // اختبار دور المعلم
    try {
      await PIloginTeacher(credentials);
      availableRoles.push('teacher');
    } catch (error) {
      // تجاهل الخطأ - الدور غير متاح
    }
    
    // اختبار دور الطالب
    try {
      await loginStudent(credentials);
      availableRoles.push('student');
    } catch (error) {
      // تجاهل الخطأ - الدور غير متاح
    }
    
    // اختبار دور ولي الأمر
    try {
      await loginParent(credentials);
      availableRoles.push('parent');
    } catch (error) {
      // تجاهل الخطأ - الدور غير متاح
    }
    
    // اختبار دور المشرف
    try {
      await loginSupervisor(credentials);
      availableRoles.push('supervisor');
    } catch (error) {
      // تجاهل الخطأ - الدور غير متاح
    }
    
    console.log('✅ الأدوار المتاحة:', availableRoles);
    return availableRoles;
    
  } catch (error) {
    console.error('❌ خطأ في فحص الأدوار المتاحة:', error);
    throw error;
  }
}

/**
 * تسجيل دخول مع فحص الأدوار المتعددة
 */
export const loginWithRoleCheck = async (
  credentials: LoginRequest
): Promise<UserLoginResponse | MultiRoleLoginResponse> => {  console.log('فحص تسجيل الدخول مع الأدوار المتعددة:', credentials.nationalId);
  
  const availableRoles: UserRole[] = [];
  
  // قائمة دوال تسجيل الدخول للأنواع المختلفة
  const loginFunctions = [
    { name: 'teacher', fn: PIloginTeacher },
    { name: 'student', fn: loginStudent },
    { name: 'parent', fn: loginParent },
    { name: 'supervisor', fn: loginSupervisor }
  ];

  // تجربة كل نوع مستخدم للعثور على الأدوار المتاحة
  for (const loginType of loginFunctions) {
    try {      console.log(`جاري فحص النوع: ${loginType.name}`);
      const result = await loginType.fn(credentials);
      
      availableRoles.push(loginType.name as UserRole);
      
      console.log(`تم العثور على دور: ${loginType.name}`);
    } catch (error) {
      console.log(`لا يوجد دور: ${loginType.name}`);
      // تجاهل الخطأ والمتابعة للنوع التالي
    }
  }

  // إذا لم يتم العثور على أي دور
  if (availableRoles.length === 0) {
    throw new Error('بيانات تسجيل الدخول غير صحيحة');
  }

  // إذا كان هناك دور واحد فقط، قم بتسجيل الدخول مباشرة
  if (availableRoles.length === 1) {
    const role = availableRoles[0];
    const loginFunction = loginFunctions.find(f => f.name === role);
    if (loginFunction) {
      return await loginFunction.fn(credentials);
    }
  }
  // إذا كان هناك أدوار متعددة، أرجع قائمة الأدوار
  return {
    multipleRoles: availableRoles
  };
};

/**
 * الحصول على دالة تسجيل الدخول المناسبة للدور المحدد
 */
export const getLoginFunction = (role: string) => {
  switch (role) {
    case 'teacher':
      return PIloginTeacher;
       case 'student':
      return loginStudent;
    case 'parent':
      return loginParent;
    case 'supervisor':
      return loginSupervisor;
    default:
      throw new Error(`نوع المستخدم غير مدعوم: ${role}`);
  }
};
