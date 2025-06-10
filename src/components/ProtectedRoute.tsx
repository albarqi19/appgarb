import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../data/users';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const { isAuthenticated, user, currentRole } = useAppContext();
  const location = useLocation();

  // إذا كان يتطلب تسجيل دخول وغير مسجل دخول
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // إذا كان مسجل دخول ولكن لا يملك الصلاحية المطلوبة
  if (requireAuth && user && currentRole && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(currentRole);
    
    if (!hasRequiredRole) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 2,
          }}
        >
          <Typography variant="h5" color="error">
            ليس لديك صلاحية للوصول إلى هذه الصفحة
          </Typography>
          <Typography variant="body1" color="textSecondary">
            يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ
          </Typography>
        </Box>
      );
    }
  }

  return <>{children}</>;
};

// مكون خاص للصفحات التي تتطلب عدم تسجيل الدخول (مثل صفحة تسجيل الدخول)
export const PublicRoute: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({ 
  children, 
  redirectTo = '/role-selection' 
}) => {
  const { isAuthenticated, user, currentRole } = useAppContext();

  if (isAuthenticated && user) {
    // إذا كان المستخدم لديه أكثر من دور ولم يتم اختيار دور حالي
    if (user.roles.length > 1 && !currentRole) {
      return <Navigate to="/role-selection" replace />;
    }

    // توجيه المستخدم بناءً على دوره الحالي أو الافتراضي
    const roleToUse = currentRole || user.defaultRole;
    let redirectPath = redirectTo;
    
    if (roleToUse === 'teacher') {
      if (user.mosques.length === 1) {
        redirectPath = `/students/${user.mosques[0]}`;
      } else {
        redirectPath = '/mosque-selection';
      }
    } else if (roleToUse === 'parent') {
      redirectPath = '/parent-dashboard';
    } else if (roleToUse === 'student') {
      redirectPath = '/student-dashboard';
    } else if (roleToUse === 'supervisor') {
      redirectPath = '/supervisor-dashboard';
    }

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
