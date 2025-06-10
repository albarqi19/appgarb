import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { loginWithRoleCheck, getLoginFunction } from '../services/authService';
import { useAppContext } from '../context/AppContext';
import RoleSelection from '../components/RoleSelection';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setUser, setCurrentRole } = useAppContext();
    const [formData, setFormData] = useState({
    nationalId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [multipleRoles, setMultipleRoles] = useState<string[] | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; nationalId: string } | null>(null);

  // إزالة الأخطاء عند تغيير البيانات
  useEffect(() => {
    if (error) setError(null);
  }, [formData.nationalId, formData.password, error]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (field === 'nationalId') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [field]: numbersOnly }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.nationalId) {
      setError('يرجى إدخال رقم الهوية');
      return;
    }
    
    if (!formData.password) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }

    setIsLoading(true);
    setError(null);    try {
      // محاولة تسجيل الدخول مع فحص الأدوار المتعددة
      const response = await loginWithRoleCheck({
        nationalId: formData.nationalId,
        password: formData.password
      });
      
      // التحقق من نوع الاستجابة
      if ('multipleRoles' in response) {
        // المستخدم لديه أدوار متعددة - عرض صفحة اختيار الدور
        setMultipleRoles(response.multipleRoles);
        setUserInfo({
          name: 'مستخدم', // سنحصل على الاسم من أول محاولة تسجيل دخول ناجحة
          nationalId: formData.nationalId
        });
        setIsLoading(false);
        return;
      }
      
      // المستخدم لديه دور واحد فقط - تسجيل دخول مباشر
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setCurrentRole(response.user.defaultRole);
      
      navigate(response.redirectPath);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول');    } finally {
      setIsLoading(false);
    }
  };

  // دالة التعامل مع اختيار الدور
  const handleRoleSelect = async (selectedRole: string) => {
    if (!userInfo) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // الحصول على دالة تسجيل الدخول المناسبة للدور المحدد
      const loginFunction = getLoginFunction(selectedRole);
      const response = await loginFunction({
        nationalId: userInfo.nationalId,
        password: formData.password
      });
      
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setCurrentRole(selectedRole as any);
      
      navigate(response.redirectPath);
      
    } catch (err) {
      console.error('Role selection error:', err);
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول بالدور المحدد');
      // العودة لصفحة تسجيل الدخول
      setMultipleRoles(null);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // إذا كان المستخدم لديه أدوار متعددة، عرض صفحة اختيار الدور
  if (multipleRoles && userInfo) {
    return (
      <RoleSelection
        availableRoles={multipleRoles as any}
        userInfo={userInfo}
        onRoleSelect={handleRoleSelect}
        isLoading={isLoading}
      />
    );
  }

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
      <Container maxWidth="sm">
        <Card 
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* الرأس */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LoginIcon sx={{ fontSize: 30, color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h1" fontWeight="600" color="primary" gutterBottom>
                تسجيل الدخول
              </Typography>
              <Typography variant="body2" color="text.secondary">
                منصة غرب لتحفيظ القرآن الكريم
              </Typography>
            </Box>

            {/* نموذج تسجيل الدخول */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* رقم الهوية */}
                <TextField
                  fullWidth
                  label="رقم الهوية الوطنية"
                  value={formData.nationalId}
                  onChange={handleInputChange('nationalId')}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle color="action" />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="1234567890"
                  inputProps={{ maxLength: 10, inputMode: 'numeric' }}
                />

                {/* كلمة المرور */}
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  disabled={isLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* رسالة الخطأ */}
                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                {/* زر تسجيل الدخول */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                  }}
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </Stack>
            </Box>            {/* معلومات API */}
            <Paper 
              sx={{ 
                mt: 4, 
                p: 2, 
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
                تسجيل دخول متعدد الأدوار عبر API:
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                يتم الآن الاتصال بـ API الخلفي لجميع أنواع المستخدمين:<br/>
                • المعلمون: /auth/teacher/login<br/>
                • الطلاب: /auth/student/login<br/>
                • أولياء الأمور: /auth/parent/login<br/>
                • المشرفون: /auth/supervisor/login<br/>
                استخدم بيانات الاعتماد الصحيحة حسب نوع المستخدم
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
