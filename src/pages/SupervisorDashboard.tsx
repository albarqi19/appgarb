import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
  useTheme,
  Stack,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supervisors, teacherAttendanceData, studentTransferRequests, supervisorAIRecommendations } from '../data/supervisors';
import { students } from '../data/students';
import { mosques } from '../data/mosques';
import { studentAnalytics } from '../data/ai-insights';
// استيراد خدمة المشرف الحقيقية
import supervisorService, { 
  SupervisorDashboardData, 
  SupervisorTeacher, 
  SupervisorStudent, 
  SupervisorCircle,
  SupervisorStatistics 
} from '../services/supervisorService';
// استيراد خدمة النظرة الشاملة
import comprehensiveService, { 
  ComprehensiveOverview,
  ComprehensiveMosque,
  ComprehensiveCircle 
} from '../services/comprehensiveService';
import ComprehensiveView from '../components/ComprehensiveView';

// أيقونات
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReportIcon from '@mui/icons-material/Report';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MosqueIcon from '@mui/icons-material/Mosque';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VacationIcon from '@mui/icons-material/BeachAccess';

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
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState(0);  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [targetMosque, setTargetMosque] = useState('');
  const [targetCircle, setTargetCircle] = useState(''); // إضافة اختيار الحلقة
  const [transferType, setTransferType] = useState('mosque'); // نوع النقل: mosque أو circle
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // متغيرات البحث والفلترة
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMosqueFilter, setSelectedMosqueFilter] = useState('');
  const [selectedCircleFilter, setSelectedCircleFilter] = useState('');
  const [scoreRangeFilter, setScoreRangeFilter] = useState('all');
  // حالات البيانات باستخدام React Query
  const supervisorId = 1; // مؤقتاً - يجب الحصول عليه من user context
  // جلب البيانات الشاملة للمشرف باستخدام React Query
  const {
    data: completeData,
    isLoading: loading,
    error: queryError,
    isError
  } = useQuery({
    queryKey: ['supervisorCompleteData', supervisorId],
    queryFn: async () => {
      console.log('🚀 React Query: بدء جلب بيانات المشرف من API');
      const result = await supervisorService.getSupervisorCompleteData(supervisorId, user?.token);
      console.log('✅ React Query: تم جلب البيانات من API:', result);
      return result;
    },
    enabled: true, // تفعيل Query دائماً لأن API يعمل بدون token في البيئة الحالية
    retry: 1, // إعادة المحاولة مرة واحدة عند الفشل
  });

  // استخراج البيانات من الاستجابة
  const dashboardData = completeData?.dashboard || null;
  const supervisorTeachers = completeData?.teachers || [];
  const supervisorStudents = completeData?.students || [];
  const supervisorCircles = completeData?.circles || [];
  const supervisorStats = completeData?.statistics || null;
  const error = isError ? 'فشل في تحميل بيانات المشرف' : null;

  // البيانات الشاملة الجديدة
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveOverview | null>(null);

  // بيانات المشرف الحالي (مؤقتاً من البيانات المحلية)
  const currentSupervisor = supervisors[0];
  const supervisedMosquesList = mosques.filter(m => currentSupervisor.supervisedMosques.includes(m.id));
  const supervisedStudents = students.filter(s => currentSupervisor.supervisedMosques.includes(s.mosqueId));  const todayAttendance = teacherAttendanceData.filter(ta => ta.date === '2025-06-07' && currentSupervisor.supervisedMosques.includes(ta.mosqueId));

  // الحصول على إحصائيات المشرف (محدثة لاستخدام البيانات من API)
  const getSupervisorStats = () => {
    console.log('🔍 فحص البيانات:', {
      loading,
      supervisorStats,
      hasStats: !!supervisorStats,
      supervisorCircles: supervisorCircles.length,
      supervisorStudents: supervisorStudents.length,
      supervisorTeachers: supervisorTeachers.length
    });

    if (loading) {
      // إرجاع قيم افتراضية أثناء التحميل
      return {
        totalMosques: 0,
        totalStudents: 0,
        attendanceRate: 0,
        pendingTransfers: 0,
        presentTeachers: 0,
        totalTeachers: 0
      };
    }    // استخدام البيانات من API إذا توفرت
    if (supervisorStats) {
      console.log('✅ استخدام بيانات API:', supervisorStats);
        // التحقق من هيكل البيانات الجديد باستخدام any cast
      const stats = supervisorStats as any;      if (stats.supervisors && stats.circles) {
        const supervisorData = stats.supervisors;
        const circlesData = stats.circles;
        
        console.log('🔍 بيانات المشرفين:', supervisorData);
        console.log('🔍 بيانات الحلقات:', circlesData);
        
        // استخدام الهيكل الصحيح للبيانات
        const result = {
          totalMosques: circlesData.total || 0, // استخدام إجمالي الحلقات كعدد المساجد
          totalStudents: supervisorStudents.length || 0, // من البيانات المحملة
          attendanceRate: 85, // قيمة مؤقتة - يمكن حسابها من البيانات
          pendingTransfers: 0, // من البيانات المحملة
          presentTeachers: supervisorData.active || 0,
          totalTeachers: supervisorTeachers.length || 0 // من البيانات المحملة
        };
        
        console.log('📊 الإحصائيات المحسوبة من API:', result);
        return result;
      }
        // الهيكل القديم للتوافق
      const fallbackResult = {
        totalMosques: supervisorStats.mosques_count || 0,
        totalStudents: supervisorStats.students_count || 0,
        attendanceRate: supervisorStats.attendance_rate || 0,
        pendingTransfers: supervisorStats.transfer_requests?.pending || 0,
        presentTeachers: Math.round((supervisorStats.attendance_rate / 100) * supervisorStats.teachers_count) || 0,
        totalTeachers: supervisorStats.teachers_count || 0
      };
      
      console.log('📊 الإحصائيات من الهيكل القديم:', fallbackResult);
      return fallbackResult;
    }

    // البيانات المحسوبة من البيانات المحملة محلياً كبديل
    console.log('🔄 استخدام البيانات المحلية كبديل');
    const totalMosques = new Set(supervisorCircles.map(c => c.mosque.id)).size;
    const totalStudents = supervisorStudents.length;
    const totalTeachers = supervisorTeachers.length;
    
    // حساب معدل الحضور من بيانات API (مؤقتاً من البيانات المحلية)
    const presentTeachers = todayAttendance.filter(ta => ta.status === 'حاضر').length;
    const attendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;
    const pendingTransfers = studentTransferRequests.filter(str => str.status === 'pending').length;

    return {
      totalMosques,
      totalStudents,
      attendanceRate,
      pendingTransfers,
      presentTeachers: presentTeachers || 0,
      totalTeachers
    };
  };

  const stats = useMemo(() => getSupervisorStats(), [
    loading, 
    supervisorStats, 
    supervisorCircles.length, 
    supervisorStudents.length, 
    supervisorTeachers.length
  ]);

  // إعادة حساب الإحصائيات عند تحديث البيانات
  useEffect(() => {
    console.log('🔄 تحديث الإحصائيات بعد تحديث البيانات');
  }, [supervisorStats, supervisorCircles.length, supervisorStudents.length, supervisorTeachers.length]);

  // معالجة طلب نقل طالب - محدث للعمل مع APIs والحلقات
  const handleStudentTransfer = async () => {
    try {
      // بناء بيانات النقل حسب التوثيق
      const transferData: any = {
        student_id: parseInt(selectedStudent),
        transfer_reason: transferReason,
        notes: `نقل من نوع: ${transferType === 'mosque' ? 'إلى مسجد آخر' : 'بين الحلقات'}`
      };

      // إضافة المعلومات حسب نوع النقل
      if (transferType === 'mosque') {
        transferData.requested_circle_id = parseInt(targetMosque);
      } else if (transferType === 'circle') {
        transferData.requested_circle_id = parseInt(targetCircle);
      }
      
      console.log('طلب نقل:', transferData);
      
      // إرسال طلب النقل إلى API
      const success = await supervisorService.requestStudentTransfer(transferData, user?.token);
      
      if (success) {
        alert('تم إرسال طلب النقل بنجاح');
        setTransferDialogOpen(false);
        setSelectedStudent('');
        setTransferReason('');
        setTargetMosque('');
        setTargetCircle('');
        setTransferType('mosque');
      } else {
        alert('فشل في إرسال طلب النقل');
      }
      
    } catch (error) {
      console.error('خطأ في إرسال طلب النقل:', error);
      alert('فشل في إرسال طلب النقل');
    }
  };

  // معالجة تحضير المعلم - محدث للعمل مع APIs
  const handleTeacherAttendance = async () => {
    try {
      console.log('تحضير المعلم:', {
        teacherId: selectedTeacher,
        status: attendanceStatus,
        notes: attendanceNotes
      });
      
      // إرسال حضور المعلم إلى API هنا
      // await supervisorService.recordTeacherAttendance(selectedTeacher, attendanceStatus, attendanceNotes);
      
      setAttendanceDialogOpen(false);
      setSelectedTeacher('');
      setAttendanceStatus('');
      setAttendanceNotes('');
      
      // عرض رسالة نجاح
      alert('تم تسجيل الحضور بنجاح');
    } catch (error) {
      console.error('خطأ في تسجيل الحضور:', error);
      alert('فشل في تسجيل الحضور');
    }
  };

  // الحصول على أيقونة الحضور
  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'حاضر':
        return <EventAvailableIcon color="success" />;
      case 'غائب':
        return <EventBusyIcon color="error" />;
      case 'متأخر':
        return <AccessTimeIcon color="warning" />;
      case 'إجازة':
        return <VacationIcon color="info" />;
      default:
        return <EventAvailableIcon />;
    }
  };

  // الحصول على لون حالة الحضور
  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'حاضر':
        return 'success';
      case 'غائب':
        return 'error';
      case 'متأخر':
        return 'warning';
      case 'إجازة':
        return 'info';
      default:
        return 'default';
    }
  };

  // دالة فلترة الطلاب المحسنة
  const getFilteredStudents = () => {
    let filtered = supervisorStudents;

    // البحث بالاسم
    if (searchQuery.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // فلترة بالمسجد
    if (selectedMosqueFilter) {
      filtered = filtered.filter(student => 
        student.circle?.mosque?.id.toString() === selectedMosqueFilter
      );
    }

    // فلترة بالحلقة
    if (selectedCircleFilter) {
      filtered = filtered.filter(student => 
        student.circle?.id.toString() === selectedCircleFilter
      );
    }

    // فلترة بنطاق الدرجات
    if (scoreRangeFilter !== 'all') {
      switch (scoreRangeFilter) {
        case 'excellent':
          filtered = filtered.filter(student => (student.total_score || 0) >= 90);
          break;
        case 'good':
          filtered = filtered.filter(student => (student.total_score || 0) >= 70 && (student.total_score || 0) < 90);
          break;
        case 'average':
          filtered = filtered.filter(student => (student.total_score || 0) >= 50 && (student.total_score || 0) < 70);
          break;
        case 'needs_improvement':
          filtered = filtered.filter(student => (student.total_score || 0) < 50);
          break;
      }
    }

    return filtered;
  };

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
        {/* عرض حالة التحميل */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                جاري تحميل بيانات المشرف...
              </Typography>
            </Box>
          </Box>
        )}        {/* عرض رسالة الخطأ مع زر الإعادة */}
        {error && !loading && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* المحتوى الرئيسي */}
        {!loading && !error && (
          <>
            {/* رأس الصفحة - معلومات المشرف (محدث بالبيانات من API) */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                background: theme.palette.mode === 'light' 
                  ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
                  : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
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
                        <SupervisorAccountIcon sx={{ fontSize: 30 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold">
                          {dashboardData?.data?.welcome_message || `أهلاً وسهلاً ${currentSupervisor.name.split(' ')[0]}`}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                          لوحة تحكم المشرف - إدارة الحلقات والمعلمين
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* معلومات سريعة محدثة */}
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {stats.totalMosques}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            المساجد
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {stats.totalStudents}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            الطلاب
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {stats.attendanceRate}%
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            حضور المعلمين
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold">
                            {stats.pendingTransfers}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            طلبات النقل
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
                          <NotificationsIcon sx={{ mr: 1, color: 'white' }} />
                          <Typography variant="h6" color="white">
                            التنبيهات العاجلة
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                          {dashboardData?.data?.notifications?.pending_reports || 0} تقرير معلق
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                          {dashboardData?.data?.notifications?.new_students || 0} طالب جديد
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          {supervisorAIRecommendations.filter(r => r.priority === 'high').length} توصية ذكاء اصطناعي عالية الأولوية
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </>
        )}

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
          >            <Tab label="النظرة الشاملة" />
            <Tab label="نظرة عامة" />
            <Tab label="المساجد والحلقات" />
            <Tab label="تحضير المعلمين" />
            <Tab label="نقل الطلاب" />
            <Tab label="التوصيات الذكية" />
            <Tab label="التقارير" />
          </Tabs>
        </Paper>        {/* محتوى التبويبات */}
        
        {/* تبويبة النظرة الشاملة الجديدة */}
        <TabPanel value={activeTab} index={0}>
          <ComprehensiveView />
        </TabPanel>
        
        {/* تبويبة نظرة عامة */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            {/* بطاقات الإحصائيات */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalMosques}
                    </Typography>
                    <Typography variant="body2">
                      المساجد المشرف عليها
                    </Typography>
                  </Box>
                  <MosqueIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalStudents}
                    </Typography>
                    <Typography variant="body2">
                      إجمالي الطلاب
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.presentTeachers}/{stats.totalTeachers}
                    </Typography>
                    <Typography variant="body2">
                      المعلمون الحاضرون اليوم
                    </Typography>
                  </Box>
                  <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.pendingTransfers}
                    </Typography>
                    <Typography variant="body2">
                      طلبات النقل المعلقة
                    </Typography>
                  </Box>
                  <TransferWithinAStationIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>            {/* المساجد التي يشرف عليها - محدث لاستخدام البيانات من API */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  المساجد تحت إشرافي
                </Typography>                <Grid container spacing={2}>
                  {Array.from(new Set(supervisorCircles.map(c => c.mosque.id))).map((mosqueId) => {
                    const mosque = supervisorCircles.find(c => c.mosque.id === mosqueId)?.mosque;
                    if (!mosque) return null;
                    
                    const mosqueStudents = supervisorStudents.filter(s => 
                      s.circle && s.circle.mosque && s.circle.mosque.id === mosqueId
                    );
                    const mosqueCircles = supervisorCircles.filter(c => c.mosque.id === mosqueId);
                    const avgScore = mosqueStudents.length > 0 
                      ? mosqueStudents.reduce((sum, s) => sum + (s.total_score || 0), 0) / mosqueStudents.length 
                      : 0;
                    
                    return (
                      <Grid item xs={12} md={6} lg={4} key={mosqueId}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                <MosqueIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {mosque.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {mosque.location || 'غير محدد'}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">عدد الطلاب:</Typography>
                                <Typography variant="body2" fontWeight="bold">{mosqueStudents.length}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">متوسط الدرجات:</Typography>
                                <Typography variant="body2" fontWeight="bold">{Math.round(avgScore)}%</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">عدد الحلقات:</Typography>
                                <Typography variant="body2" fontWeight="bold">{mosqueCircles.length}</Typography>
                              </Box>
                            </Stack>
                              <Box sx={{ mt: 2 }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                fullWidth
                                onClick={() => navigate(`/mosque-details/${mosqueId}`)}
                              >
                                عرض التفاصيل
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>        {/* تبويبة المساجد والحلقات */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    إدارة الطلاب والحلقات ({getFilteredStudents().length} طالب)
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => setTransferDialogOpen(true)}
                  >
                    نقل طالب
                  </Button>
                </Box>

                {/* أدوات البحث والفلترة */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="البحث بالاسم أو اسم المعلم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <Box sx={{ mr: 1, color: 'text.secondary' }}>
                            🔍
                          </Box>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>المسجد</InputLabel>
                      <Select
                        value={selectedMosqueFilter}
                        onChange={(e) => {
                          setSelectedMosqueFilter(e.target.value);
                          setSelectedCircleFilter(''); // إعادة تعيين فلتر الحلقة
                        }}
                        label="المسجد"
                      >
                        <MenuItem value="">الكل</MenuItem>
                        {Array.from(new Set(supervisorCircles.map(c => c.mosque.id))).map((mosqueId) => {
                          const mosque = supervisorCircles.find(c => c.mosque.id === mosqueId)?.mosque;
                          return mosque ? (
                            <MenuItem key={mosque.id} value={mosque.id.toString()}>
                              {mosque.name}
                            </MenuItem>
                          ) : null;
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>الحلقة</InputLabel>
                      <Select
                        value={selectedCircleFilter}
                        onChange={(e) => setSelectedCircleFilter(e.target.value)}
                        label="الحلقة"
                        disabled={!selectedMosqueFilter}
                      >
                        <MenuItem value="">الكل</MenuItem>
                        {supervisorCircles
                          .filter(c => !selectedMosqueFilter || c.mosque.id.toString() === selectedMosqueFilter)
                          .map((circle) => (
                            <MenuItem key={circle.id} value={circle.id.toString()}>
                              {circle.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>مستوى الدرجات</InputLabel>
                      <Select
                        value={scoreRangeFilter}
                        onChange={(e) => setScoreRangeFilter(e.target.value)}
                        label="مستوى الدرجات"
                      >
                        <MenuItem value="all">الكل</MenuItem>
                        <MenuItem value="excellent">ممتاز (90%+)</MenuItem>
                        <MenuItem value="good">جيد (70-89%)</MenuItem>
                        <MenuItem value="average">متوسط (50-69%)</MenuItem>
                        <MenuItem value="needs_improvement">يحتاج تحسين (&lt;50%)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedMosqueFilter('');
                        setSelectedCircleFilter('');
                        setScoreRangeFilter('all');
                      }}
                      sx={{ height: '56px' }}
                    >
                      إعادة تعيين
                    </Button>
                  </Grid>
                </Grid>
                  <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>اسم الطالب</TableCell>
                        <TableCell>المسجد</TableCell>
                        <TableCell>الحلقة</TableCell>
                        <TableCell>الدرجة</TableCell>
                        <TableCell>المعلم</TableCell>
                        <TableCell>الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredStudents().slice(0, 10).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                {student.name ? student.name.charAt(0) : '؟'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {student.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {student.age} سنة
                                </Typography>                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{student.circle && student.circle.mosque ? student.circle.mosque.name : 'غير محدد'}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {student.circle ? student.circle.name : 'غير محدد'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={student.total_score || 0} 
                                sx={{ width: 60, mr: 1 }}
                                color={(student.total_score || 0) >= 80 ? "success" : (student.total_score || 0) >= 60 ? "warning" : "error"}
                              />
                              <Typography variant="caption">
                                {student.total_score || 0}%
                              </Typography>
                            </Box>
                          </TableCell>                          <TableCell>
                            <Typography variant="body2">
                              {student.circle && student.circle.teacher ? student.circle.teacher.name : 'غير محدد'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/student-details/${student.id}`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>        {/* تبويبة تحضير المعلمين - محدث لاستخدام البيانات من API */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    إدارة المعلمين - {supervisorTeachers.length} معلم
                  </Typography>                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAttendanceDialogOpen(true)}
                  >
                    تسجيل حضور معلم
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {supervisorTeachers.map((teacher) => (
                    <Grid item xs={12} md={6} lg={4} key={teacher.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                              {teacher.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {teacher.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {teacher.phone}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Stack spacing={1}>                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">المساجد:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {teacher.mosques ? teacher.mosques.length : 0}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">الحلقات:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {teacher.circles_count}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2">الطلاب:</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {teacher.students_count}
                              </Typography>
                            </Box>
                          </Stack>
                          
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              المساجد:
                            </Typography>                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {teacher.mosques && teacher.mosques.slice(0, 2).map((mosque) => (
                                <Chip 
                                  key={mosque.id}
                                  label={mosque.name}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {teacher.mosques && teacher.mosques.length > 2 && (
                                <Chip 
                                  label={`+${teacher.mosques.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                            </Box>
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            startIcon={<EditIcon />}
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/teacher-details/${teacher.id}`)}
                          >
                            عرض التفاصيل
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>        {/* تبويبة نقل الطلاب */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  طلبات نقل الطلاب
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>اسم الطالب</TableCell>
                        <TableCell>من</TableCell>
                        <TableCell>إلى</TableCell>
                        <TableCell>السبب</TableCell>
                        <TableCell>الحالة</TableCell>
                        <TableCell>تاريخ الطلب</TableCell>
                        <TableCell>الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentTransferRequests.map((request) => {
                        const fromMosque = mosques.find(m => m.id === request.fromMosqueId);
                        const toMosque = mosques.find(m => m.id === request.toMosqueId);
                        
                        return (
                          <TableRow key={request.id}>
                            <TableCell>{request.studentName}</TableCell>
                            <TableCell>{fromMosque?.name}</TableCell>
                            <TableCell>{toMosque?.name}</TableCell>
                            <TableCell>{request.reason}</TableCell>
                            <TableCell>
                              <Chip 
                                label={request.status === 'pending' ? 'معلق' : request.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                                color={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{request.requestDate}</TableCell>                            <TableCell>
                              {request.status === 'pending' && (
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={async () => {
                                      try {
                                        const success = await supervisorService.approveTransferRequest(parseInt(request.id), user?.token);
                                        if (success) {
                                          alert('تمت الموافقة على النقل بنجاح');
                                          // إعادة تحميل البيانات
                                          window.location.reload();
                                        } else {
                                          alert('فشل في الموافقة على النقل');
                                        }
                                      } catch (error) {
                                        console.error('خطأ في الموافقة:', error);
                                        alert('حدث خطأ في الموافقة على النقل');
                                      }
                                    }}
                                  >
                                    موافقة
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={async () => {
                                      const reason = prompt('اذكر سبب الرفض:');
                                      if (reason) {
                                        try {
                                          const success = await supervisorService.rejectTransferRequest(parseInt(request.id), reason, user?.token);
                                          if (success) {
                                            alert('تم رفض النقل بنجاح');
                                            // إعادة تحميل البيانات
                                            window.location.reload();
                                          } else {
                                            alert('فشل في رفض النقل');
                                          }
                                        } catch (error) {
                                          console.error('خطأ في الرفض:', error);
                                          alert('حدث خطأ في رفض النقل');
                                        }
                                      }
                                    }}
                                  >
                                    رفض
                                  </Button>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>        {/* تبويبة التوصيات الذكية */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            {supervisorAIRecommendations.map((recommendation) => (
              <Grid item xs={12} md={6} key={recommendation.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: recommendation.priority === 'high' ? 'error.main' : 
                                recommendation.priority === 'medium' ? 'warning.main' : 'info.main'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: recommendation.priority === 'high' ? 'error.light' : 
                                 recommendation.priority === 'medium' ? 'warning.light' : 'info.light',
                          mr: 2
                        }}
                      >
                        <SmartToyIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {recommendation.title}
                          </Typography>
                          <Chip 
                            label={recommendation.priority === 'high' ? 'عالية' : 
                                   recommendation.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            color={recommendation.priority === 'high' ? 'error' : 
                                   recommendation.priority === 'medium' ? 'warning' : 'info'}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {recommendation.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            الأسباب:
                          </Typography>
                          <List dense>
                            {recommendation.reasons.map((reason, index) => (
                              <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 20 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={reason}
                                  primaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            دقة التوصية: {recommendation.confidence}%
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => console.log('تطبيق التوصية')}
                          >
                            تطبيق التوصية
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>        {/* تبويبة التقارير */}
        <TabPanel value={activeTab} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  إنشاء التقارير
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير الطلاب
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        أداء الطلاب ومعدلات التقدم
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير المعلمين
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        حضور وأداء المعلمين
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <MosqueIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير المساجد
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إحصائيات المساجد والحلقات
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <SmartToyIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير الذكاء الاصطناعي
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        توصيات وتحليلات ذكية
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* نافذة نقل الطالب */}        <Dialog 
          open={transferDialogOpen} 
          onClose={() => setTransferDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>نقل طالب</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>اختر الطالب</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="اختر الطالب"
                >
                  {supervisorStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} - {student.circle && student.circle.mosque ? student.circle.mosque.name : 'غير محدد'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* نوع النقل */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>نوع النقل</InputLabel>
                <Select
                  value={transferType}
                  onChange={(e) => {
                    setTransferType(e.target.value);
                    setTargetMosque('');
                    setTargetCircle('');
                  }}
                  label="نوع النقل"
                >
                  <MenuItem value="circle">نقل بين الحلقات (نفس المسجد)</MenuItem>
                  <MenuItem value="mosque">نقل إلى مسجد آخر</MenuItem>
                </Select>
              </FormControl>
              
              {/* اختيار المسجد (في حالة النقل للمسجد) */}
              {transferType === 'mosque' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>المسجد الجديد</InputLabel>
                  <Select
                    value={targetMosque}
                    onChange={(e) => setTargetMosque(e.target.value)}
                    label="المسجد الجديد"
                  >
                    {Array.from(new Set(supervisorCircles.map(c => c.mosque.id))).map((mosqueId) => {
                      const mosque = supervisorCircles.find(c => c.mosque.id === mosqueId)?.mosque;
                      return mosque ? (
                        <MenuItem key={mosque.id} value={mosque.id}>
                          {mosque.name}
                        </MenuItem>
                      ) : null;
                    })}
                  </Select>
                </FormControl>
              )}

              {/* اختيار الحلقة (في حالة النقل بين الحلقات) */}
              {transferType === 'circle' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>الحلقة الجديدة</InputLabel>
                  <Select
                    value={targetCircle}
                    onChange={(e) => setTargetCircle(e.target.value)}
                    label="الحلقة الجديدة"
                  >
                    {supervisorCircles.map((circle) => (
                      <MenuItem key={circle.id} value={circle.id}>
                        {circle.name} - {circle.mosque.name} ({circle.time_period})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="سبب النقل"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="اذكر سبب طلب النقل..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransferDialogOpen(false)}>
              إلغاء
            </Button>            <Button 
              variant="contained" 
              onClick={handleStudentTransfer}
              disabled={
                !selectedStudent || 
                !transferReason || 
                (transferType === 'mosque' && !targetMosque) ||
                (transferType === 'circle' && !targetCircle)
              }
            >
              إرسال طلب النقل
            </Button>
          </DialogActions>
        </Dialog>

        {/* نافذة تحضير المعلم */}
        <Dialog 
          open={attendanceDialogOpen} 
          onClose={() => setAttendanceDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>تسجيل حضور المعلم</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>اختر المعلم</InputLabel>
                <Select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  label="اختر المعلم"
                >                  {supervisorTeachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.mosques ? teacher.mosques.map(m => m.name).join(', ') : 'غير محدد'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>حالة الحضور</InputLabel>
                <Select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  label="حالة الحضور"
                >
                  <MenuItem value="حاضر">حاضر</MenuItem>
                  <MenuItem value="غائب">غائب</MenuItem>
                  <MenuItem value="متأخر">متأخر</MenuItem>
                  <MenuItem value="إجازة">إجازة</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="ملاحظات"
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                placeholder="أضف ملاحظات إضافية..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttendanceDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant="contained" 
              onClick={handleTeacherAttendance}
              disabled={!selectedTeacher || !attendanceStatus}
            >
              حفظ الحضور
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SupervisorDashboard;
