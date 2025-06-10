import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Grid,
  Avatar,
  Stack,
  Fade,
  useTheme,
} from '@mui/material';
import {
  School as TeacherIcon,
  FamilyRestroom as ParentIcon,
  MenuBook as StudentIcon,
  SupervisorAccount as SupervisorIcon,
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../data/users';

interface RoleSelectionProps {
  availableRoles: UserRole[];
  userInfo?: {
    name: string;
    nationalId: string;
  };
  onRoleSelect: (role: UserRole) => void;
  isLoading?: boolean;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ 
  availableRoles, 
  userInfo,
  onRoleSelect, 
  isLoading = false 
}) => {
  const theme = useTheme();  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { user } = useAppContext();

  // استخدام معلومات المستخدم المرسلة أو من السياق
  const displayUserInfo = userInfo || user;
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return {
          label: 'معلم',
          description: 'إدارة الطلاب وجلسات التحفيظ',
          icon: <TeacherIcon />,
          color: '#1976d2'
        };
      case 'parent':
        return {
          label: 'ولي أمر',
          description: 'متابعة تقدم الأطفال في التحفيظ',
          icon: <ParentIcon />,
          color: '#388e3c'
        };
      case 'student':
        return {
          label: 'طالب',
          description: 'المشاركة في جلسات التحفيظ',
          icon: <StudentIcon />,
          color: '#f57c00'
        };
      case 'supervisor':
        return {
          label: 'مشرف',
          description: 'الإشراف على المعلمين والطلاب',
          icon: <SupervisorIcon />,
          color: '#7b1fa2'
        };
      default:
        return {
          label: role,
          description: '',
          icon: <StudentIcon />,
          color: '#666'
        };
    }
  };  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setTimeout(() => {
      onRoleSelect(role);
    }, 300);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Fade in timeout={600}>
          <Card 
            elevation={4}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(17,34,64,0.9) 0%, rgba(10,25,47,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,247,250,0.9) 100%)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* الرأس */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}                >
                  {displayUserInfo?.name.charAt(0)}
                </Avatar>                <Typography variant="h4" component="h1" fontWeight="600" color="primary" gutterBottom>
                  مرحباً {displayUserInfo?.name}
                </Typography>
                {userInfo?.nationalId && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    رقم الهوية: {userInfo.nationalId}
                  </Typography>
                )}
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  اختر الدور الذي تريد الدخول به
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userInfo ? 'لديك أكثر من دور في النظام' : 'يمكنك تغيير الدور لاحقاً من القائمة العلوية'}
                </Typography>
              </Box>

              {/* خيارات الأدوار */}
              <Grid container spacing={3}>
                {availableRoles.map((role) => {
                  const roleInfo = getRoleInfo(role);
                  const isSelected = selectedRole === role;
                  
                  return (
                    <Grid item xs={12} sm={6} key={role}>
                      <Card
                        elevation={isSelected ? 8 : 2}                        sx={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                          borderColor: isSelected ? 'primary.main' : 'transparent',
                          border: 2,
                          opacity: isLoading ? 0.6 : 1,
                          '&:hover': {
                            transform: isLoading ? 'scale(1)' : 'scale(1.02)',
                            elevation: 6,
                            borderColor: 'primary.light',
                          }
                        }}
                        onClick={() => !isLoading && handleRoleSelect(role)}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              mx: 'auto',
                              mb: 2,
                              bgcolor: roleInfo.color,
                              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                              transition: 'transform 0.3s ease',
                            }}
                          >
                            {roleInfo.icon}
                          </Avatar>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            gutterBottom
                            color={isSelected ? 'primary.main' : 'text.primary'}
                          >
                            {roleInfo.label}
                          </Typography>                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ lineHeight: 1.6 }}
                          >
                            {isLoading && selectedRole === role ? 'جاري تسجيل الدخول...' : roleInfo.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* معلومات إضافية */}              <Box 
                sx={{ 
                  mt: 4, 
                  p: 2, 
                  bgcolor: 'info.light', 
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" color="info.dark">
                  {isLoading ? '🔄 جاري تسجيل الدخول...' : '💡 نصيحة: يمكنك التبديل بين الأدوار في أي وقت من خلال النقر على اسمك في الشريط العلوي'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default RoleSelection;
