// بيانات المستخدمين وتسجيل الدخول - بيانات وهمية لحين الربط مع API

import { Mosque } from './mosques';
import { mosques } from './mosques';

export interface User {
  id: string;
  nationalId: string;
  password: string;
  name: string;
  roles: UserRole[];
  defaultRole: UserRole;
  mosques: string[]; // معرفات المساجد
  profileImage?: string;
  phone?: string;
  email?: string;
  bio?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  token?: string; // إضافة توكن المستخدم
}

export type UserRole = 'teacher' | 'parent' | 'student' | 'supervisor';

export interface LoginResponse {
  user: User;
  token: string;
  redirectPath: string;
}

// بيانات المساجد الوهمية - سنستخدم المساجد من ملف mosques.ts
export const mockMosques: Mosque[] = mosques;

// بيانات المستخدمين الوهمية
export const mockUsers: User[] = [
  {
    id: '1',
    nationalId: '1234567890',
    password: '123456',
    name: 'أحمد محمد العلي',
    roles: ['teacher'],
    defaultRole: 'teacher',
    mosques: ['1', '2'],
    phone: '0501234567',
    email: 'ahmed@example.com',
    createdAt: '2024-01-15',
    lastLogin: '2024-03-20',
    isActive: true,
  },
  {
    id: '2',
    nationalId: '0987654321',
    password: '123456',
    name: 'فاطمة عبدالله النور',
    roles: ['teacher', 'parent'],
    defaultRole: 'teacher',
    mosques: ['1'],
    phone: '0507654321',
    email: 'fatima@example.com',
    createdAt: '2024-01-10',
    lastLogin: '2024-03-19',
    isActive: true,
  },
  {
    id: '3',
    nationalId: '1111111111',
    password: '123456',
    name: 'خالد سعد الرحمن',
    roles: ['parent'],
    defaultRole: 'parent',
    mosques: ['2'],
    phone: '0501111111',
    email: 'khalid@example.com',
    createdAt: '2024-02-01',
    lastLogin: '2024-03-18',
    isActive: true,
  },
  {
    id: '4',
    nationalId: '2222222222',
    password: '123456',
    name: 'عبدالرحمن أحمد الغامدي',
    roles: ['supervisor'],
    defaultRole: 'supervisor',
    mosques: ['1', '2', '3'],
    phone: '0502222222',
    email: 'supervisor@example.com',
    createdAt: '2024-01-01',
    lastLogin: '2024-03-20',
    isActive: true,
  },
  {
    id: '5',
    nationalId: '3333333333',
    password: '123456',
    name: 'محمد علي الزهراني',
    roles: ['teacher'],
    defaultRole: 'teacher',
    mosques: ['3'],
    phone: '0503333333',
    email: 'mohammed@example.com',
    createdAt: '2024-01-20',
    lastLogin: '2024-03-17',
    isActive: true,
  },
  {
    id: '6',
    nationalId: '4444444444',
    password: '123456',
    name: 'يوسف عبدالله الحربي',
    roles: ['student'],
    defaultRole: 'student',
    mosques: ['1'],
    phone: '0504444444',
    email: 'youssef@example.com',
    createdAt: '2024-02-15',
    lastLogin: '2024-03-16',
    isActive: true,
  },
];

// دالة محاكاة تسجيل الدخول
export const mockLogin = async (nationalId: string, password: string): Promise<LoginResponse> => {
  // محاكاة تأخير الشبكة
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = mockUsers.find(u => u.nationalId === nationalId && u.password === password);
  
  if (!user) {
    throw new Error('رقم الهوية أو كلمة المرور غير صحيحة');
  }

  if (!user.isActive) {
    throw new Error('الحساب غير مفعل، يرجى التواصل مع الإدارة');
  }

  // تحديد المسار بناءً على الدور والمساجد
  let redirectPath = '/';
  
  if (user.defaultRole === 'teacher') {
    if (user.mosques.length === 1) {
      // إذا كان المعلم مرتبط بمسجد واحد فقط، يذهب مباشرة لقائمة الطلاب
      redirectPath = `/students/${user.mosques[0]}`;
    } else {
      // إذا كان مرتبط بعدة مساجد، يذهب لاختيار المسجد
      redirectPath = '/mosque-selection';
    }
  } else if (user.defaultRole === 'parent') {
    redirectPath = '/parent-dashboard';
  } else if (user.defaultRole === 'student') {
    redirectPath = '/student-dashboard';
  } else if (user.defaultRole === 'supervisor') {
    redirectPath = '/supervisor-dashboard';
  }

  // إنشاء token وهمي
  const token = `mock_token_${user.id}_${Date.now()}`;

  return {
    user: {
      ...user,
      lastLogin: new Date().toISOString(),
    },
    token,
    redirectPath,
  };
};

// دالة للحصول على معلومات المساجد الخاصة بالمستخدم
export const getUserMosques = (user: User): Mosque[] => {
  return mosques.filter(mosque => user.mosques.includes(mosque.id));
};

// دالة للتحقق من صحة رقم الهوية السعودية
export const validateSaudiNationalId = (nationalId: string): boolean => {
  if (!nationalId || nationalId.length !== 10) {
    return false;
  }

  // التحقق من أن جميع الأرقام صحيحة
  if (!/^\d{10}$/.test(nationalId)) {
    return false;
  }

  // خوارزمية التحقق من رقم الهوية السعودية
  const digits = nationalId.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    if (i % 2 === 0) {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digits[i];
    }
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit === digits[9];
};
