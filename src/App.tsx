import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  Toolbar, 
  Container, 
  Typography, 
  GlobalStyles 
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import PageTransition from './components/PageTransition';
import { clearOldAttendanceCache } from './services/attendanceService';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import './App.css';
import { darkTheme, lightTheme } from './theme/theme';

// تحميل مباشر للصفحة الرئيسية لتظهر بسرعة
import HomePage from './pages/HomePage';

// تعريف باقي الصفحات بالتحميل الكسول
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'));
const MosqueSelection = lazy(() => import('./pages/MosqueSelection'));
const StudentsList = lazy(() => import('./pages/StudentsList'));
const StudentDetails = lazy(() => import('./pages/StudentDetails'));
const MemorizationOptions = lazy(() => import('./pages/MemorizationOptions'));
const MemorizationSession = lazy(() => import('./pages/MemorizationSession'));
const CreateRecitationSession = lazy(() => import('./pages/CreateRecitationSession'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const SupervisorDashboard = lazy(() => import('./pages/SupervisorDashboard'));
const TeacherActivityDashboard = lazy(() => import('./pages/TeacherActivityDashboard'));
const TestTeacherAPI = lazy(() => import('./pages/TestTeacherAPI'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const QuranPage = lazy(() => import('./pages/QuranPage'));
const AttendanceLogPage = lazy(() => import('./pages/AttendanceLogPage'));
const MosqueDetails = lazy(() => import('./pages/MosqueDetails'));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const { PublicRoute } = require('./components/ProtectedRoute');

// إنشاء كاش لدعم اللغة العربية واتجاه RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// إعداد React Query Client مع تحسينات للمشرف
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // البيانات صالحة لمدة دقيقتين
      gcTime: 5 * 60 * 1000, // احتفظ بالبيانات في الذاكرة لـ 5 دقائق
      refetchOnWindowFocus: false, // لا تجلب البيانات عند العودة للتطبيق
      retry: 2, // إعادة المحاولة مرتين عند الفشل
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // تأخير متزايد
    },
  },
});

// المكون الرئيسي للتطبيق مع دعم السمة المظلمة
const AppContent = () => {
  const { themeMode } = useAppContext();
  const location = useLocation();

  // تحديد ما إذا كنا في الصفحة الرئيسية
  const isHomePage = location.pathname === '/';

  // تنظيف البيانات القديمة عند بدء التطبيق
  useEffect(() => {
    clearOldAttendanceCache();
  }, []);

  // تعيين سمة الوضع للعنصر HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  // استخدام الثيم المناسب حسب الوضع
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: themeMode === 'dark' ? '#1a3251' : '#f1f1f1',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb': {
            background: currentTheme.palette.primary.light,
            borderRadius: '4px',
            '&:hover': {
              background: currentTheme.palette.primary.main,
            },
          },
          'body': {
            overscrollBehavior: 'none',
          }
        }}
      />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        
        {isHomePage ? (
          // الصفحة الرئيسية - بدون قيود على كامل الشاشة
          <Suspense fallback={<LoadingSpinner message="جاري تحميل الصفحة..." />}>
            <PageTransition>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <HomePage />
                    </PublicRoute>
                  } 
                />
              </Routes>
            </PageTransition>
          </Suspense>
        ) : (
          // باقي الصفحات - مع التخطيط العادي
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              pt: 4,
              pb: 4,
              backgroundImage: themeMode === 'light' 
                ? 'linear-gradient(rgba(245, 249, 252, 0.9), rgba(245, 249, 252, 0.9)), url("/assets/islamic-pattern.svg")'
                : 'linear-gradient(rgba(10, 25, 47, 0.97), rgba(10, 25, 47, 0.97)), url("/assets/islamic-pattern.svg")',
              backgroundAttachment: 'fixed',
              backgroundSize: '500px',
              position: 'relative',
            }}
          >
            <Toolbar /> {/* لإضافة مسافة تحت شريط التنقل */}
            
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Suspense fallback={<LoadingSpinner message="جاري تحميل الصفحة..." />}>
                <PageTransition>
                  <Routes>
                  {/* صفحة تسجيل الدخول - للمستخدمين غير المسجلين */}
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute>
                        <LoginPage />
                      </PublicRoute>
                    } 
                  />
                    {/* صفحة اختيار الدور - للمستخدمين متعددي الأدوار */}
                  <Route 
                    path="/role-selection" 
                    element={
                      <ProtectedRoute>
                        <RoleSelectionPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* صفحة اختيار المسجد - للمعلمين والمشرفين */}
                  <Route 
                    path="/mosque-selection" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
                        <MosqueSelection />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* لوحات التحكم المختلفة */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher']}>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/parent-dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['parent']}>
                        <ParentDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/student-dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/supervisor-dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['supervisor']}>
                        <SupervisorDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/teacher-activity-dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['supervisor']}>
                        <TeacherActivityDashboard />
                      </ProtectedRoute>
                    } 
                  />
                    {/* صفحات الطلاب */}
                  <Route 
                    path="/students" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
                        <StudentsList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/students/:mosqueId" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
                        <StudentsList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/students/:studentId" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'supervisor', 'parent']}>
                        <StudentDetails />
                      </ProtectedRoute>
                    } 
                  />

                  {/* صفحة تفاصيل المسجد */}
                  <Route 
                    path="/mosque-details/:mosqueId" 
                    element={
                      <ProtectedRoute allowedRoles={['supervisor']}>
                        <MosqueDetails />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* صفحة سجل التحضير */}
                  <Route 
                    path="/attendance-log" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'supervisor']}>
                        <AttendanceLogPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* صفحات التحفيظ */}
                  <Route 
                    path="/memorization-options" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'student']}>
                        <MemorizationOptions />
                      </ProtectedRoute>
                    } 
                  />                  <Route 
                    path="/memorization-session" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher', 'student']}>
                        <MemorizationSession />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/create-recitation-session" 
                    element={
                      <ProtectedRoute allowedRoles={['teacher']}>
                        <CreateRecitationSession />
                      </ProtectedRoute>
                    } 
                  />
                    {/* صفحة القرآن */}
                  <Route 
                    path="/quran" 
                    element={
                      <ProtectedRoute>
                        <QuranPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* صفحة الملف الشخصي */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }                  />
                  
                  {/* صفحة قريباً للميزات الجديدة */}
                  <Route 
                    path="/coming-soon" 
                    element={
                      <ProtectedRoute>
                        <ComingSoon />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* إعادة توجيه للصفحات غير الموجودة */}
                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </PageTransition>
            </Suspense>          </Container>
        </Box>
        )}
        
        {/* Footer - إخفاءه في الصفحة الرئيسية */}
        {!isHomePage && (
          <Box 
            component="footer" 
            sx={{ 
              py: 3, 
              textAlign: 'center', 
              borderTop: `1px solid ${themeMode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)'}`,
              bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(10, 25, 47, 0.8)',
              mt: 'auto' 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              منصة غرب | منصة متابعة تحفيظ القرآن الكريم
            </Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

// مكون التطبيق الرئيسي
function App() {  return (
    <CacheProvider value={cacheRtl}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </CacheProvider>
  );
}

export default App;
