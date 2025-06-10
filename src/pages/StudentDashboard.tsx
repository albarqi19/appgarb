import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Button,
  useTheme,
  Stack,
  Tab,
  Tabs,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getStudentDashboardData, StudentRecitationStats, StudentDailyCurriculum, APIStudentData } from '../services/authService';
import { uthmaniSurahs } from '../data/quran-uthmani';

// أيقونات
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MosqueIcon from '@mui/icons-material/Mosque';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BookmarkIcon from '@mui/icons-material/Bookmark';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);
    // حالات البيانات من API
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<{
    recitationStats: StudentRecitationStats | null;
    dailyCurriculum: StudentDailyCurriculum | null;
    studentInfo: APIStudentData | null;
    hasData: boolean;
    isUsingFallbackData?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // جلب بيانات الطالب من API
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) {
        setError('لم يتم العثور على معرف الطالب');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🚀 جلب بيانات الطالب:', user.id);        const data = await getStudentDashboardData(user.id);
        setStudentData(data);
          if (!data.hasData) {
          setError('لا توجد بيانات متوفرة للطالب حالياً');
        }
        
      } catch (err) {
        console.error('❌ خطأ في جلب بيانات الطالب:', err);
        setError('حدث خطأ في جلب البيانات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.id]);

  // الحصول على التسميع القادم (غداً) - يعتمد على البيانات المتاحة
  const getNextMemorization = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // استخدام بيانات المنهج اليومي إذا كانت متوفرة
    if (studentData?.dailyCurriculum?.daily_curriculum?.memorization) {
      const memorization = studentData.dailyCurriculum.daily_curriculum.memorization;
      return {
        date: tomorrow.toLocaleDateString('ar-SA'),
        surahName: memorization.content || 'الفاتحة',
        fromAyah: 1,
        toAyah: 10,
        type: memorization.type || 'حفظ'
      };
    }
    
    // قيم افتراضية إذا لم تكن البيانات متوفرة
    return {
      date: tomorrow.toLocaleDateString('ar-SA'),
      surahName: 'الفاتحة',
      fromAyah: 1,
      toAyah: 10,
      type: 'حفظ' as const
    };
  };

  const nextMemorization = getNextMemorization();

  // الحصول على آخر جلسة تسميع من البيانات المتاحة
  const getLastSession = () => {
    if (studentData?.recitationStats) {
      const stats = studentData.recitationStats;
      return {
        surahName: 'القرآن الكريم', // يمكن تحسين هذا لاحقاً
        date: stats.last_session_date ? new Date(stats.last_session_date).toLocaleDateString('ar-SA') : 'غير محدد',
        type: 'تسميع',
        score: Math.round(stats.average_grade || 0),
        totalErrors: Math.round((stats.total_sessions || 0) * (stats.error_rate_percentage || 0) / 100)
      };
    }
    
    // قيم افتراضية
    return {
      surahName: 'الفاتحة',
      date: new Date().toLocaleDateString('ar-SA'),
      type: 'تسميع',
      score: 85,
      totalErrors: 2
    };
  };

  const lastSession = getLastSession();  // حساب نسبة التقدم في السورة الحالية
  const getCurrentSurahProgress = () => {
    // استخدام بيانات المنهج اليومي إذا كانت متوفرة
    if (studentData?.dailyCurriculum?.current_curriculum) {
      return studentData.dailyCurriculum.current_curriculum.completion_percentage || 0;
    }
    
    // حساب تقريبي بناءً على السورة المحددة
    const surah = uthmaniSurahs.find(s => s.arabicName === nextMemorization.surahName);
    if (!surah) return 0;
    
    const totalAyahs = surah.totalAyahs;
    const completedAyahs = nextMemorization.toAyah;
    return Math.round((completedAyahs / totalAyahs) * 100);
  };

  // الحصول على رمز الاتجاه بناءً على الإحصائيات المتاحة
  const getTrendIcon = () => {
    if (!studentData?.recitationStats) return <TrendingFlatIcon color="info" />;
    
    const stats = studentData.recitationStats;
    const errorRate = stats.error_rate_percentage || 0;
    
    // تقييم الاتجاه بناءً على معدل الأخطاء
    if (errorRate < 10) {
      return <TrendingUpIcon color="success" />;
    } else if (errorRate > 25) {
      return <TrendingDownIcon color="error" />;
    } else {
      return <TrendingFlatIcon color="info" />;
    }
  };

  // عرض حالة التحميل
  if (loading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          pt: 8,
          pb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          جاري تحميل بيانات الطالب...
        </Typography>
      </Box>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          pt: 8,
          pb: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 400 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  // استخراج اسم الطالب من البيانات المتاحة
  const studentName = studentData?.studentInfo?.name || user?.name || 'الطالب';
  const mosqueName = studentData?.studentInfo?.mosque?.name || studentData?.dailyCurriculum?.student?.mosque || 'المسجد';

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 8,
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="lg">
        {/* رأس الصفحة - معلومات الطالب */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)'
              : 'linear-gradient(135deg, #4a9fbe 0%, #1e6f8e 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* خلفية زخرفية */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              zIndex: 0
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      mr: 2,
                      width: 60,
                      height: 60
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 30 }} />
                  </Avatar>                  <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                      أهلاً وسهلاً {studentName.split(' ')[0]}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                      مرحباً بك في منصة غرب لتحفيظ القرآن الكريم
                    </Typography>
                  </Box>
                </Box>
                
                {/* معلومات سريعة */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {studentData?.dailyCurriculum?.current_curriculum?.level || 'متوسط'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        المستوى
                      </Typography>
                    </Box>
                  </Grid>                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {Math.round(studentData?.recitationStats?.average_grade || 85)}%
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        الدرجة الإجمالية
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        85%
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        نسبة الحضور
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {mosqueName.split(' ').slice(-1)[0]}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        المسجد
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CalendarTodayIcon sx={{ mr: 1, color: 'white' }} />
                      <Typography variant="h6" color="white">
                        التسميع القادم
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="white" fontWeight="medium">
                      سورة {nextMemorization.surahName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      الآيات {nextMemorization.fromAyah} - {nextMemorization.toAyah}
                    </Typography>
                    <Chip 
                      label={nextMemorization.date}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* تبويبات المحتوى */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            <Tab label="نظرة عامة" />
            <Tab label="منهجي" />
            <Tab label="تقريري" />
            <Tab label="أخطائي" />
          </Tabs>
        </Paper>

        {/* محتوى التبويبات */}
        
        {/* تبويبة نظرة عامة */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* التسميع القادم - تفصيلي */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EventIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    استعد لتسميع الغد
                  </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  موعد التسميع: {nextMemorization.date}
                </Alert>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    سورة {nextMemorization.surahName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    من الآية {nextMemorization.fromAyah} إلى الآية {nextMemorization.toAyah}
                  </Typography>
                  <Chip 
                    label={nextMemorization.type}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    تقدمك في السورة
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getCurrentSurahProgress()} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getCurrentSurahProgress()}% مكتملة
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  fullWidth
                  onClick={() => navigate('/quran')}
                  sx={{ mt: 2 }}
                >
                  راجع الآيات الآن
                </Button>
              </Paper>
            </Grid>

            {/* آخر جلسة تسميع */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GradeIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    آخر جلسة تسميع
                  </Typography>
                </Box>

                {lastSession && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" fontWeight="medium">
                        سورة {lastSession.surahName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lastSession.date} - {lastSession.type}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          الدرجة
                        </Typography>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {lastSession.score}%
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          عدد الأخطاء
                        </Typography>
                        <Typography variant="h4" color={lastSession.totalErrors > 3 ? "error" : "success"}>
                          {lastSession.totalErrors}
                        </Typography>
                      </Box>
                    </Box>

                    <LinearProgress 
                      variant="determinate" 
                      value={lastSession.score} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        mb: 1
                      }}
                      color={lastSession.score >= 80 ? "success" : lastSession.score >= 60 ? "warning" : "error"}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {lastSession.score >= 80 ? "أداء ممتاز!" : lastSession.score >= 60 ? "أداء جيد" : "يحتاج تحسين"}
                    </Typography>
                  </>
                )}
              </Paper>
            </Grid>

            {/* إحصائيات سريعة */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  إحصائياتي السريعة
                </Typography>                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: 'success.light', mx: 'auto', mb: 1 }}>
                        <MenuBookIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {studentData?.recitationStats?.total_sessions || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        جلسات مكتملة
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mx: 'auto', mb: 1 }}>
                        <CheckCircleIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        85%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        نسبة الحضور
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ bgcolor: 'warning.light', mx: 'auto', mb: 1 }}>
                        <ErrorIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {studentData?.recitationStats?.sessions_with_errors || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        جلسات بها أخطاء
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'info.light', mx: 'auto', mb: 1 }}>
                        {getTrendIcon()}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {studentData?.recitationStats?.error_rate_percentage ? 
                          (studentData.recitationStats.error_rate_percentage < 10 ? 'تحسن' : 
                           studentData.recitationStats.error_rate_percentage > 25 ? 'تراجع' : 'ثابت') : 'ثابت'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        اتجاه الأداء
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* تبويبة منهجي */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  منهجي في التحفيظ
                </Typography>
                  <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    المنهج الحالي: {studentData?.dailyCurriculum?.current_curriculum?.name || nextMemorization.surahName}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={getCurrentSurahProgress()} 
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />                  <Typography variant="caption" color="text.secondary">
                    مستوى: {studentData?.dailyCurriculum?.current_curriculum?.level || 'متوسط'} - 
                    التقدم: {getCurrentSurahProgress()}% مكتمل
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  معلومات التسميع
                </Typography>
                {studentData?.recitationStats ? (
                  <List>
                    <ListItem divider>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.light',
                            width: 32,
                            height: 32
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold">
                            {Math.round(studentData.recitationStats.average_grade || 0)}
                          </Typography>
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary="متوسط الدرجات"
                        secondary={`${Math.round(studentData.recitationStats.average_grade || 0)}% في ${studentData.recitationStats.total_sessions || 0} جلسة`}
                      />
                      <Chip 
                        label={studentData.recitationStats.average_grade >= 80 ? "ممتاز" : studentData.recitationStats.average_grade >= 60 ? "جيد" : "يحتاج تحسين"}
                        size="small"
                        color={studentData.recitationStats.average_grade >= 80 ? "success" : studentData.recitationStats.average_grade >= 60 ? "warning" : "error"}
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'warning.light',
                            width: 32,
                            height: 32
                          }}
                        >
                          <ErrorIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary="معدل الأخطاء"
                        secondary={`${Math.round(studentData.recitationStats.error_rate_percentage || 0)}% معدل الأخطاء`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'info.light',
                            width: 32,
                            height: 32
                          }}
                        >
                          <CalendarTodayIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary="آخر جلسة"
                        secondary={studentData.recitationStats.last_session_date ? 
                          new Date(studentData.recitationStats.last_session_date).toLocaleDateString('ar-SA') : 
                          'لا توجد جلسات مسجلة'
                        }
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    لا توجد بيانات تسميع متوفرة حالياً
                  </Alert>
                )}
              </Paper>
            </Grid>            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: 'fit-content' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  معلومات الحلقة
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <MosqueIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="المسجد"
                      secondary={mosqueName}
                    />
                  </ListItem>                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="المعلم"
                      secondary="الأستاذ محمد الأحمد"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="المستوى"
                      secondary={studentData?.dailyCurriculum?.current_curriculum?.level || 'متوسط'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="أيام التسميع"
                      secondary="السبت - الثلاثاء - الخميس"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>        {/* تبويبة تقريري */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  تقرير أدائي الشامل
                </Typography>
                
                {studentData?.recitationStats ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="success.main">
                        نقاط القوة
                      </Typography>
                      <List dense>
                        {studentData.recitationStats.average_grade >= 80 && (
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary="أداء ممتاز في التسميع بمعدل عالي" />
                          </ListItem>
                        )}
                        {studentData.recitationStats.error_rate_percentage < 15 && (
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary="معدل أخطاء منخفض وأداء مستقر" />
                          </ListItem>
                        )}
                        {studentData.recitationStats.total_sessions >= 10 && (
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary="مواظبة جيدة على جلسات التسميع" />
                          </ListItem>
                        )}
                        {(!studentData.recitationStats.average_grade || studentData.recitationStats.average_grade < 80) && 
                         (!studentData.recitationStats.error_rate_percentage || studentData.recitationStats.error_rate_percentage >= 15) && 
                         (!studentData.recitationStats.total_sessions || studentData.recitationStats.total_sessions < 10) && (
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary="تفاعل إيجابي مع التعلم" />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="warning.main">
                        نقاط التحسين
                      </Typography>
                      <List dense>
                        {studentData.recitationStats.average_grade < 60 && (
                          <ListItem>
                            <ListItemIcon>
                              <ErrorIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText primary="يحتاج إلى تحسين مستوى الحفظ والأداء" />
                          </ListItem>
                        )}
                        {studentData.recitationStats.error_rate_percentage > 25 && (
                          <ListItem>
                            <ListItemIcon>
                              <ErrorIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText primary="العمل على تقليل معدل الأخطاء" />
                          </ListItem>
                        )}
                        {studentData.recitationStats.total_sessions < 5 && (
                          <ListItem>
                            <ListItemIcon>
                              <ErrorIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText primary="زيادة المشاركة في جلسات التسميع" />
                          </ListItem>
                        )}
                        {studentData.recitationStats.average_grade >= 60 && 
                         studentData.recitationStats.error_rate_percentage <= 25 && 
                         studentData.recitationStats.total_sessions >= 5 && (
                          <ListItem>
                            <ListItemIcon>
                              <ErrorIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText primary="المحافظة على التحسن المستمر" />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        توصيات للتحسين
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <BookmarkIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="المراجعة اليومية للمحفوظات السابقة" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BookmarkIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="التركيز على قواعد التجويد أثناء التسميع" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BookmarkIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText primary="الاستعانة بالتسجيلات الصوتية للمشايخ" />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                ) : (
                  <Alert severity="info">
                    لا توجد بيانات كافية لإنشاء تقرير مفصل. يرجى المشاركة في المزيد من جلسات التسميع.
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>        {/* تبويبة أخطائي */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  تحليل أخطائي
                </Typography>
                
                {studentData?.recitationStats ? (
                  <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={4}>
                        <Paper 
                          variant="outlined" 
                          sx={{ p: 2, textAlign: 'center', borderColor: 'error.main', bgcolor: 'error.light', color: 'error.contrastText' }}
                        >
                          <Typography variant="h4" fontWeight="bold">
                            {Math.round((studentData.recitationStats.total_sessions || 0) * (studentData.recitationStats.error_rate_percentage || 0) / 100)}
                          </Typography>
                          <Typography variant="body2">
                            إجمالي الأخطاء
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper 
                          variant="outlined" 
                          sx={{ p: 2, textAlign: 'center', borderColor: 'warning.main', bgcolor: 'warning.light', color: 'warning.contrastText' }}
                        >
                          <Typography variant="h4" fontWeight="bold">
                            {Math.round(studentData.recitationStats.error_rate_percentage || 0)}%
                          </Typography>
                          <Typography variant="body2">
                            معدل الأخطاء
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper 
                          variant="outlined" 
                          sx={{ p: 2, textAlign: 'center', borderColor: 'info.main', bgcolor: 'info.light', color: 'info.contrastText' }}
                        >
                          <Typography variant="h4" fontWeight="bold">
                            {studentData.recitationStats.sessions_with_errors || 0}
                          </Typography>
                          <Typography variant="body2">
                            جلسات بها أخطاء
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      تحليل الأخطاء
                    </Typography>
                    
                    {studentData.recitationStats.error_rate_percentage > 0 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        معدل الأخطاء الحالي: {Math.round(studentData.recitationStats.error_rate_percentage)}%
                        {studentData.recitationStats.error_rate_percentage > 25 && " - يُنصح بمراجعة المعلم لتحسين الأداء"}
                        {studentData.recitationStats.error_rate_percentage <= 10 && " - أداء ممتاز!"}
                      </Alert>
                    ) : (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        ممتاز! لا توجد أخطاء مسجلة في جلسات التسميع الأخيرة
                      </Alert>
                    )}
                    
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Chip 
                            label="إحصائيات"
                            size="small"
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${studentData.recitationStats.total_sessions || 0} جلسة تسميع مكتملة`}
                          secondary={`منها ${studentData.recitationStats.sessions_with_errors || 0} جلسة تحتوي على أخطاء`}
                        />
                      </ListItem>
                      {studentData.recitationStats.last_session_date && (
                        <ListItem>
                          <ListItemIcon>
                            <Chip 
                              label="آخر جلسة"
                              size="small"
                              color="info"
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary="آخر جلسة تسميع"
                            secondary={new Date(studentData.recitationStats.last_session_date).toLocaleDateString('ar-SA')}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemIcon>
                          <Chip 
                            label="توجيه"
                            size="small"
                            color="success"
                          />
                        </ListItemIcon>
                        <ListItemText 
                          primary="للحصول على تفاصيل أكثر عن الأخطاء"
                          secondary="يُنصح بمراجعة المعلم لمعرفة نوع الأخطاء والعمل على تحسينها"
                        />
                      </ListItem>
                    </List>
                  </>
                ) : (
                  <Alert severity="info">
                    لا توجد بيانات أخطاء متوفرة حالياً. ابدأ بجلسات التسميع لتتمكن من تتبع التحسن.
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
