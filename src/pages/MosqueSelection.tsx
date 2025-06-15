import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea, 
  Grid, 
  Box, 
  Paper,
  Avatar,
  Button,
  Stack,
  useTheme,
  CircularProgress,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mosques } from '../data/mosques';
import { getUserMosques } from '../data/users';
import { getAllMosques, getTeacherMosques, Mosque as APIMosque } from '../services/authService';
import WorkingHoursAlert from '../components/WorkingHoursAlert';
import MosqueIcon from '@mui/icons-material/Mosque';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const MosqueSelection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setCurrentMosque, user } = useAppContext();
  // State for mosques from API
  const [apiMosques, setApiMosques] = useState<APIMosque[]>([]);
  const [loading, setLoading] = useState(true);
    // Load teacher mosques only
  // صفحة اختيار المسجد - عرض مساجد المعلم فقط
  useEffect(() => {
    const loadMosques = async () => {
      if (!user?.id) {
        console.log('لا يوجد معرف مستخدم، الانتقال للصفحة الرئيسية');
        navigate('/');
        return;
      }      try {
        console.log('تحميل مساجد المعلم في صفحة الاختيار، معرف المعلم:', user.id);
        setLoading(true);
          // جلب مساجد المعلم فقط
        console.log('جلب مساجد المعلم المخصصة له');
        const mosquesData = await getTeacherMosques(user.id);
          console.log('مساجد المعلم المحملة من API:', mosquesData);
        console.log('عدد المساجد المحملة:', mosquesData.length);
        setApiMosques(mosquesData);
        console.log('تم تحديث state بالمساجد');
      } catch (error) {
        console.error('خطأ في تحميل مساجد المعلم:', error);
        setApiMosques([]);
      } finally {
        console.log('انتهاء التحميل، تعيين loading = false');
        setLoading(false);
      }
    };    loadMosques();
  }, [user]);  // تحميل عند تغيير بيانات المستخدم
  // استخدام مساجد المعلم فقط من API
  const finalMosques = apiMosques;    // Debug logging  
  console.log('بيانات المستخدم في صفحة اختيار المسجد:', user);
  console.log('مساجد المعلم المحملة من API (apiMosques):', apiMosques);
  console.log('المساجد النهائية للعرض (finalMosques):', finalMosques);
  console.log('حالة التحميل (loading):', loading);
  console.log('عدد المساجد النهائية:', finalMosques.length);
  console.log('تفاصيل البيانات:', JSON.stringify(finalMosques, null, 2));  const handleMosqueSelection = (mosqueId: string) => {
    console.log('تم اختيار مسجد بمعرف:', mosqueId);
    console.log('البحث في المساجد:', apiMosques);
    const selectedAPI = apiMosques.find(m => m.id?.toString() === mosqueId);
    console.log('المسجد المختار:', selectedAPI);
    if (selectedAPI) {
      // تحويل مسجد API إلى تنسيق محلي للتوافق
      const localMosque = {
        id: selectedAPI.id?.toString() || mosqueId,
        name: selectedAPI.mosque_name || selectedAPI.اسم_المسجد || 'غير محدد',
        location: selectedAPI.district || selectedAPI.الحي || selectedAPI.street || selectedAPI.الشارع || 'غير محدد',
        studentsCount: 0 // سيتم جلبه منفصلاً
      };
      setCurrentMosque(localMosque);    navigate(`/students/${mosqueId}`);
    } else {
      console.error('لم يتم العثور على المسجد المحدد في مساجد API:', mosqueId);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Paper
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 5, 
          borderRadius: 3, 
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(120deg, #e7f5fd 0%, #d1e8fb 50%, #c0e0fb 100%)'
            : 'linear-gradient(120deg, rgba(30,111,142,0.1) 0%, rgba(30,111,142,0.2) 50%, rgba(30,111,142,0.3) 100%)',
          position: 'relative',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)',
          zIndex: 1
        }}
      >
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, transform: 'rotate(10deg)' }}>
          <MosqueIcon sx={{ fontSize: 180 }} />
        </Box>
        <Typography 
          variant="h3" 
          gutterBottom 
          align="center" 
          fontWeight="bold" 
          color="primary.dark"
          sx={{ 
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            mb: 2
          }}        >
          اختر مدرستك القرآنية
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary" 
          paragraph
          sx={{ 
            maxWidth: '600px',
            mx: 'auto', 
            fontSize: '1.1rem',
            fontWeight: 500
          }}
        >          اختر من المدارس القرآنية المُسندة إليك لإدارة طلابك ومتابعة تقدمهم في الحفظ والمراجعة
        </Typography>        {/* أزرار التنقل - مخفية مؤقتاً */}
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="center" 
          sx={{ 
            mt: 3,
            position: 'relative',
            zIndex: 10,
            display: 'none' // إخفاء الأزرار مؤقتاً
          }}
        >
          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/student-dashboard')}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              cursor: 'pointer',
              borderWidth: 2,
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 11,
              pointerEvents: 'auto',
              userSelect: 'none',
              '&:hover': {
                backgroundColor: 'success.light',
                color: 'white',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }
            }}
          >
            واجهة الطالب
          </Button>

          <Button
            variant="outlined"
            size="large"
            disabled={false}
            startIcon={<FamilyRestroomIcon />}
            onClick={() => {
              navigate('/parent-dashboard');
            }}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              cursor: 'pointer',
              borderWidth: 2,
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 11,
              pointerEvents: 'auto',
              userSelect: 'none',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }
            }}
          >
            واجهة ولي الأمر
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<SupervisorAccountIcon />}
            onClick={() => navigate('/supervisor-dashboard')}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              borderColor: 'success.main',
              color: 'success.main',
              borderWidth: 2,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'success.main',
                color: 'white',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }
            }}
          >
            واجهة المشرف
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<MosqueIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            لوحة تحكم المعلم
          </Button>
        </Stack>      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />            <Typography variant="h6" color="text.secondary">
              جاري تحميل مساجدك...
            </Typography>
          </Stack>
        </Box>
      ) : finalMosques.length === 0 ? (        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Stack spacing={2} alignItems="center">
            <MosqueIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
            <Typography variant="h6" color="text.secondary">
              لا توجد مساجد مُسندة إليك
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
              لا يبدو أنك مُعين كمعلم في أي مسجد حتى الآن. 
              تواصل مع إدارة المسجد لتعيينك كمعلم في إحدى الحلقات.
            </Typography>
          </Stack>        </Box>
      ) : (        <>
          {/* عرض البطاقات للجميع */}
          <Grid container spacing={4}>
            {finalMosques.map((mosque) => (
              <Grid item xs={12} sm={6} md={4} key={mosque.id}>
                <Card 
                  elevation={4} 
                  className="card-hover"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    top: -100,
                    left: -100,
                    background: 'linear-gradient(45deg, rgba(30, 111, 142, 0.1), rgba(30, 111, 142, 0.05))'
                  }} />
                    <CardActionArea 
                    onClick={() => handleMosqueSelection((mosque.id?.toString() || mosque.id)?.toString())}
                    sx={{ flexGrow: 1, p: 2 }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        mb: 2,
                        mt: 2,
                        position: 'relative'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          width: 90, 
                          height: 90,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          border: '4px solid rgba(255,255,255,0.9)'
                        }}
                      >
                        <MosqueIcon sx={{ fontSize: 50 }} />
                      </Avatar>
                    </Box>
                    <CardContent>                      <Typography variant="h5" component="h2" align="center" fontWeight="bold">
                        {(mosque.mosque_name && mosque.mosque_name !== 'مسجد بدون اسم') 
                          ? mosque.mosque_name 
                          : (mosque.اسم_المسجد && mosque.اسم_المسجد !== 'مسجد بدون اسم') 
                            ? mosque.اسم_المسجد 
                            : `مسجد رقم ${mosque.id}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        {(mosque.district && mosque.district !== 'الحي غير محدد') 
                          ? mosque.district 
                          : (mosque.الحي && mosque.الحي !== 'الحي غير محدد') 
                            ? mosque.الحي 
                            : 'الموقع: يُرجى تحديث بيانات المسجد'}
                      </Typography>                      {(mosque.street || mosque.الشارع) && (mosque.street || mosque.الشارع) !== (mosque.district || mosque.الحي) && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                          {mosque.street || mosque.الشارع}
                        </Typography>
                      )}
                      
                      {/* عرض معرف المسجد للمطورين */}
                      <Typography variant="caption" color="text.disabled" align="center" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        معرف المسجد: {mosque.id}
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          mt: 2,
                          p: 1,
                          bgcolor: 'background.default',
                          borderRadius: 2
                        }}
                      >
                        <PersonIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body1" fontWeight="medium">
                          إدارة الطلاب
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}          </Grid>
        </>
      )}

        {/* تنبيه وقت الدوام */}
      <WorkingHoursAlert />
    </Container>
  );
};

export default MosqueSelection;
