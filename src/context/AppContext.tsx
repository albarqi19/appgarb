import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { Student } from '../data/students';
import { Mosque } from '../data/mosques';
import { User, UserRole } from '../data/users';

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
  };
  // دالة تسجيل الخروج
  const logout = () => {
    setUser(null);
    setCurrentRole(null);
    setCurrentMosque(null);
    setSelectedStudent(null);
    setMemorizationMode(null);
    setIsSessionActive(false);
  };

  // التحقق من حالة تسجيل الدخول
  const isAuthenticated = user !== null;
  return (    <AppContext.Provider 
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
        logout
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
