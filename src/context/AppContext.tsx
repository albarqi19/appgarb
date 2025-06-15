import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { Student } from '../data/students';
import { Mosque } from '../data/mosques';
import { User, UserRole } from '../data/users';
import { PreloadedData, initialPreloadedData, preloadEssentialData } from '../services/preloadService';

interface AppContextProps {
  currentMosque: Mosque | null;
  setCurrentMosque: (mosque: Mosque | null) => void;
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  memorizationMode: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى' | null;
  setMemorizationMode: (mode: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى' | null) => void;
  isSessionActive: boolean;
  setIsSessionActive: (active: boolean) => void;
  themeMode: PaletteMode;
  toggleThemeMode: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  currentRole: UserRole | null;
  setCurrentRole: (role: UserRole | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  // البيانات المحملة مسبقاً
  preloadedData: PreloadedData;
  setPreloadedData: (data: Partial<PreloadedData>) => void;
  updatePreloadedData: (updates: Partial<PreloadedData>) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentMosque, setCurrentMosque] = useState<Mosque | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [memorizationMode, setMemorizationMode] = useState<'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى' | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(() => {
    // محاولة استرجاع بيانات المستخدم من التخزين المحلي
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    // استرجاع الدور الحالي من التخزين المحلي أو استخدام الدور الافتراضي
    const savedRole = localStorage.getItem('currentRole');
    const savedUser = localStorage.getItem('userData');
    if (savedRole && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // التأكد من أن الدور المحفوظ ما زال صالحاً للمستخدم
      if (parsedUser.roles.includes(savedRole)) {
        return savedRole;
      }
    }
    return savedUser ? JSON.parse(savedUser).defaultRole : null;
  });
  const [themeMode, setThemeMode] = useState<PaletteMode>(() => {
    // استرجاع الوضع المفضل من التخزين المحلي أو استخدام الوضع الداكن كافتراضي
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' || savedMode === 'light') ? savedMode : 'dark';
  });

  // حالة البيانات المحملة مسبقاً
  const [preloadedData, setPreloadedDataState] = useState<PreloadedData>(initialPreloadedData);
  
  // حفظ الوضع المفضل في التخزين المحلي عند تغييره
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);
  // حفظ بيانات المستخدم في التخزين المحلي عند تغييرها
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    } else {
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentRole');
    }
  }, [user]);

  // حفظ الدور الحالي في التخزين المحلي عند تغييره
  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('currentRole', currentRole);
    } else {
      localStorage.removeItem('currentRole');
    }
  }, [currentRole]);
  
  // دالة لتبديل الوضع بين الفاتح والمظلم
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => prevMode === 'light' ? 'dark' : 'light');
  };  // دالة تسجيل الخروج
  const logout = () => {
    setUser(null);
    setCurrentRole(null);
    setCurrentMosque(null);
    setSelectedStudent(null);
    setMemorizationMode(null);
    setIsSessionActive(false);
    // إعادة تعيين البيانات المحملة مسبقاً
    setPreloadedDataState(initialPreloadedData);
  };

  // دوال إدارة البيانات المحملة مسبقاً
  const setPreloadedData = (data: Partial<PreloadedData>) => {
    setPreloadedDataState(prev => ({ ...prev, ...data }));
  };
  const updatePreloadedData = (updates: Partial<PreloadedData>) => {
    setPreloadedDataState(prev => ({ ...prev, ...updates }));
  };
  // تشغيل التحميل المسبق السريع عند تسجيل الدخول وتحديد المسجد
  useEffect(() => {
    const runPreloading = async () => {
      if (user && currentMosque && (currentRole === 'teacher' || currentRole === 'supervisor')) {        console.log('⚡ بدء التحميل المسبق السريع للبيانات الأساسية...');
        
        // تعيين حالة التحميل للبيانات الأساسية فقط
        setPreloadedData({
          loadingStatus: {
            students: true,
            attendance: true,
            recitations: false // لن نحمل التسميعات في البداية
          }
        });
        
        try {
          const authToken = localStorage.getItem('authToken');
          const preloadedResult = await preloadEssentialData(
            user.id,
            currentMosque.id,
            authToken || undefined
          );          setPreloadedData({
            ...preloadedResult,
            loadingStatus: {
              students: false,
              attendance: false,
              recitations: false // التسميعات ستحمل في الخلفية
            }
          });
          
          console.log('✅ تم التحميل المسبق السريع بنجاح!', preloadedResult);
            } catch (error) {
          console.error('❌ خطأ في التحميل المسبق السريع:', error);
          // إعادة تعيين حالة التحميل في حالة الخطأ
          setPreloadedData({
            loadingStatus: {
              students: false,
              attendance: false,
              recitations: false
            }
          });
        }
      }
    };

    runPreloading();
  }, [user, currentMosque, currentRole]); // يعيد التشغيل عند تغيير المستخدم أو المسجد أو الدور

  // التحقق من حالة تسجيل الدخول
  const isAuthenticated = user !== null;  return (
    <AppContext.Provider 
      value={{
        currentMosque,
        setCurrentMosque,
        selectedStudent,
        setSelectedStudent,
        memorizationMode,
        setMemorizationMode,
        isSessionActive,
        setIsSessionActive,
        themeMode,
        toggleThemeMode,
        user,
        setUser,
        currentRole,
        setCurrentRole,
        isAuthenticated,
        logout,
        // البيانات المحملة مسبقاً
        preloadedData,
        setPreloadedData,
        updatePreloadedData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
