import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Card,
  CardContent, 
  CardHeader, 
  CardActionArea,
  Avatar, 
  IconButton, 
  Box, 
  Divider,
  Badge, 
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Stack,
  CardMedia,
  Button,
  LinearProgress,
  CircularProgress,
  MenuItem,
  Select,  FormControl,
  InputLabel,
  Tab,
  Tabs,
  useTheme,  Fab,
  Popover,
  Fade,
  Zoom,
  Snackbar,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Student, StudentAttendance } from '../data/students';
import { studentAnalytics } from '../data/ai-insights';
import { getMosqueStudents, getTeacherStudents, getTeacherMosqueStudents, getTeacherStudentsViaCircles, StudentWithMosque } from '../services/authService';
import AttendanceManager from '../components/AttendanceManager';
import StudentAbsentAlert from '../components/StudentAbsentAlert';
import { getTodayAttendance, forceRefreshAttendance } from '../services/attendanceService';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import GradeIcon from '@mui/icons-material/Grade';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FaceIcon from '@mui/icons-material/Face';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import InfoIcon from '@mui/icons-material/Info';
import AssignmentIcon from '@mui/icons-material/Assignment';

const StudentsList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMosque, setSelectedStudent, user } = useAppContext();
  const theme = useTheme();const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [displayedStudents, setDisplayedStudents] = useState<Student[]>([]);
  const [apiStudents, setApiStudents] = useState<StudentWithMosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterLevel, setFilterLevel] = useState('all');
  const [activeTab, setActiveTab] = useState(0);  const [hasTeacherCircles, setHasTeacherCircles] = useState<boolean | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
    // حالات نافذة تنبيه الحضور
  const [absentAlertOpen, setAbsentAlertOpen] = useState(false);
  const [selectedStudentForAlert, setSelectedStudentForAlert] = useState<Student | null>(null);
  const [alertAttendanceStatus, setAlertAttendanceStatus] = useState<'غائب' | 'مستأذن'>('غائب');
  const [todayAttendance, setTodayAttendance] = useState<{[studentName: string]: 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن'}>({});  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showAttendanceHint, setShowAttendanceHint] = useState(false);
  
  // إشعار نجاح العمليات
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // مرجع لمنع التحميل المضاعف
  const loadingRef = useRef(false);
  
  // جلب طلاب المسجد من API
  useEffect(() => {    const loadMosqueStudents = async () => {
      if (!currentMosque || !user || loadingRef.current) {
        navigate('/');
        return;
      }      try {        console.log('🔄 جلب الطلاب والتحضير معاً لتحسين الأداء...');
        console.log('جلب طلاب المعلم مباشرة:', user?.id);
        console.log('بيانات المستخدم الحالي:', user);
        setLoading(true);        // جلب الطلاب والتحضير بشكل متوازي (في نفس الوقت)
        const [students, attendanceData] = await Promise.all([
          getTeacherStudentsViaCircles(user.id, undefined, currentMosque?.id), // إضافة معامل المسجد
          getTodayAttendance(user?.id, currentMosque?.id)
        ]);

        console.log('طلاب المعلم المحملين من API:', students);
        console.log('عدد الطلاب المستلمين:', students?.length || 0);
        console.log('📊 البيانات المستلمة من API:', attendanceData);
        console.log('👥 عدد الطلاب في بيانات التحضير:', Object.keys(attendanceData).length);
        
        // التحقق من وجود حلقات للمعلم
        if (students && students.length === 0) {
          setHasTeacherCircles(false);
        } else {
          setHasTeacherCircles(true);
        }        // تحويل البيانات من API إلى تنسيق محلي (البيانات مُفلترة مسبقاً حسب المسجد)
        const convertedStudents: Student[] = students.map((student: any) => ({
          id: student.id,
          name: student.name || 'غير محدد',
          age: student.age || 0,
          mosqueId: String(student.mosque?.id || currentMosque.id),
          circleId: student.circleId || '',
          level: student.level || 'متوسط',
          attendanceRate: student.attendanceRate || 85,
          attendance: [{
            date: new Date().toISOString().split('T')[0],
            status: 'حاضر' as 'حاضر' | 'غائب'
          }],
          memorization: [],
          currentMemorization: {
            surahName: student.currentMemorization?.surahName || 'البقرة',
            fromAyah: student.currentMemorization?.fromAyah || 1,
            toAyah: student.currentMemorization?.toAyah || 1
          },
          totalScore: student.totalScore || 80,
          phone: student.phone,
          parentPhone: student.parentPhone
        }));
        
        console.log('✅ طلاب المعلم في المسجد المحدد (مُفلترة مسبقاً):', convertedStudents.length);
        console.log('🔍 تفاصيل الطلاب:');
        convertedStudents.forEach((student, index) => {
          console.log(`طالب ${index + 1}: ${student.name}, المسجد: ${currentMosque.id}`);
        });
        
        setFilteredStudents(convertedStudents); // البيانات مُفلترة مسبقاً من API
        
        // تحديث بيانات التحضير فوراً (تم جلبها مع الطلاب)
        setTodayAttendance(attendanceData);
        
        // عرض تفاصيل للتشخيص
        if (Object.keys(attendanceData).length === 0) {
          console.log('ℹ️ لا توجد بيانات تحضير لليوم الحالي - سيتم عرض الحالة الافتراضية');
        } else {
          console.log('✅ تم تحديث بيانات التحضير بنجاح لـ', Object.keys(attendanceData).length, 'طالب');
          Object.entries(attendanceData).forEach(([studentName, status]) => {
            console.log(`  📝 ${studentName}: ${status}`);
          });
        }
        
      } catch (error) {
        console.error('خطأ في جلب طلاب المسجد:', error);
        // في حالة الخطأ، عرض رسالة بدلاً من fallback للبيانات المحلية
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };    loadMosqueStudents();
  }, [currentMosque, user, navigate]);

  // مراقبة حالة التحضير لإظهار التأشير
  useEffect(() => {
    if (filteredStudents.length > 0 && hasTeacherCircles === true) {
      // التحقق من وجود تحضير لليوم الحالي
      const hasAttendanceRecords = Object.keys(todayAttendance).length > 0;
      
      if (!hasAttendanceRecords) {
        // إظهار التأشير بعد تأخير قصير للسماح للواجهة بالتحميل
        const timer = setTimeout(() => {
          setShowAttendanceHint(true);
        }, 2000);
        
        return () => clearTimeout(timer);
      } else {
        setShowAttendanceHint(false);
      }
    } else {
      setShowAttendanceHint(false);
    }
  }, [filteredStudents, hasTeacherCircles, todayAttendance]);
  // التعامل مع حالة التنقل من صفحة خيارات التسميع
  useEffect(() => {
    // التحقق من وجود state يشير إلى فتح نافذة التحضير
    if (location.state?.openAttendance && filteredStudents.length > 0) {
      console.log('🔔 فتح نافذة التحضير تلقائياً بناءً على التنقل من صفحة التسميع');
      setAttendanceDialogOpen(true);
      
      // مسح الـ state بعد الاستخدام لتجنب فتح النافذة مرة أخرى
      navigate('/students', { replace: true });
    }
    
    // التحقق من وجود إشعار نجاح
    if (location.state?.showSuccessNotification) {
      const message = location.state.message || 'تمت العملية بنجاح!';
      setSuccessMessage(message);
      setShowSuccessSnackbar(true);
      
      // مسح الـ state بعد الاستخدام
      navigate('/students', { replace: true });
    }
  }, [location.state, filteredStudents.length, navigate]);
  // تطبيق عوامل التصفية والبحث والترتيب
  useEffect(() => {
    if (!currentMosque || filteredStudents.length === 0) {
      setDisplayedStudents([]);
      return;
    }
    
    let result = [...filteredStudents]; // استخدام البيانات المحملة من API
    
    // تصفية حسب المستوى
    if (filterLevel !== 'all') {
      result = result.filter(s => s.level === filterLevel);
    }
      // تصفية حسب حالة الحضور
    if (activeTab === 1) { // الحاضرون
      result = result.filter(s => getAttendanceStatus(s) === 'حاضر');
    } else if (activeTab === 2) { // المتأخرون
      result = result.filter(s => getAttendanceStatus(s) === 'متأخر');
    } else if (activeTab === 3) { // المستأذنون
      result = result.filter(s => getAttendanceStatus(s) === 'مستأذن');
    } else if (activeTab === 4) { // الغائبون
      result = result.filter(s => getAttendanceStatus(s) === 'غائب');
    }
    
    // تصفية حسب البحث
    if (searchQuery.trim() !== '') {
      result = result.filter(s => s.name.includes(searchQuery.trim()));
    }
    
    // ترتيب النتائج
    result = sortStudents(result, sortBy);
    
    setDisplayedStudents(result);
  }, [searchQuery, currentMosque, sortBy, filterLevel, activeTab, filteredStudents, todayAttendance]);

  // دالة ترتيب الطلاب
  const sortStudents = (students: Student[], sortKey: string): Student[] => {
    return [...students].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          return b.totalScore - a.totalScore;
        case 'attendance':
          return b.attendanceRate - a.attendanceRate;
        case 'progress':
          const progressA = studentAnalytics[a.id]?.progress.lastMonth || 0;
          const progressB = studentAnalytics[b.id]?.progress.lastMonth || 0;
          return progressB - progressA;
        default:
          return 0;
      }
    });
  };  // تعامل مع اختيار الطالب للتسميع
  const handleStudentSelection = (student: Student) => {
    const attendanceStatus = getAttendanceStatus(student);
    
    // منع الدخول للطلاب الغائبين فقط
    if (attendanceStatus === 'غائب') {
      setSelectedStudentForAlert(student);
      setAlertAttendanceStatus('غائب');
      setAbsentAlertOpen(true);
      return;
    }
    
    // تحذير للطلاب المستأذنين فقط (المتأخرون يمكنهم المتابعة مباشرة)
    if (attendanceStatus === 'مستأذن') {
      setSelectedStudentForAlert(student);
      setAlertAttendanceStatus('مستأذن');
      setAbsentAlertOpen(true);
      return;
    }

    // المتابعة للطلاب الحاضرين والمتأخرين مباشرة
    setSelectedStudent(student);
    navigate('/memorization-options');
  };

  // المتابعة للتسميع رغم التأخير أو الاستئذان
  const handleContinueToMemorization = () => {
    if (selectedStudentForAlert) {
      setSelectedStudent(selectedStudentForAlert);
      setAbsentAlertOpen(false);
      setSelectedStudentForAlert(null);
      navigate('/memorization-options');
    }
  };

  // فتح نافذة التحضير من تنبيه الحضور
  const handleOpenAttendanceFromAlert = () => {
    setAbsentAlertOpen(false);
    setSelectedStudentForAlert(null);
    setAttendanceDialogOpen(true);
  };// تعامل مع تغيير حالة الحضور
  const handleAttendanceToggle = (event: React.MouseEvent, studentId: string) => {
    event.stopPropagation();
      // البحث عن الطالب
    const student = filteredStudents.find(s => s.id === studentId);
    if (!student) return;
    
    // الحصول على الحالة الحالية
    const currentStatus = getAttendanceStatus(student);
    
    // التنقل بين الحالات: حاضر -> متأخر -> مستأذن -> غائب -> حاضر
    let newStatus: 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن';
    switch (currentStatus) {
      case 'حاضر':
        newStatus = 'متأخر';
        break;
      case 'متأخر':
        newStatus = 'مستأذن';
        break;
      case 'مستأذن':
        newStatus = 'غائب';
        break;
      case 'غائب':
      default:
        newStatus = 'حاضر';
        break;
    }
    
    // تحديث البيانات المحلية
    setTodayAttendance(prev => ({
      ...prev,
      [student.name]: newStatus
    }));
    
    // تحديث بيانات الطالب المحلية أيضاً
    const updatedStudents = filteredStudents.map(s => {
      if (s.id === studentId) {
        const updatedAttendance = {
          date: new Date().toISOString().split('T')[0],
          status: newStatus,
          time: new Date().toTimeString().split(' ')[0]
        };
        
        return {
          ...s,
          attendance: [updatedAttendance, ...s.attendance.slice(1)]
        };
      }
      return s;
    });
    
    setFilteredStudents(updatedStudents);
  };// احصل على حالة الحضور الحالية للطالب
  const getAttendanceStatus = (student: Student) => {
    // أولاً تحقق من بيانات التحضير الحقيقية لليوم
    if (todayAttendance[student.name]) {
      return todayAttendance[student.name];
    }
    
    // إذا كان يتم تحميل البيانات، لا تُظهر حالة افتراضية
    if (loadingAttendance) {
      return null; // سيتم التعامل مع هذا في UI
    }
    
    // إذا لم توجد بيانات حقيقية، استخدم البيانات المحلية
    const lastAttendance = student.attendance[0];
    return lastAttendance ? lastAttendance.status : 'غائب';
  };
  // الحصول على لون حالة الحضور
  const getAttendanceColor = (status: string | null) => {
    if (!status) return 'default';
    switch (status) {
      case 'حاضر': return 'success';
      case 'متأخر': return 'warning';
      case 'مستأذن': return 'info';
      case 'غائب': return 'error';
      default: return 'default';
    }
  };

  // الحصول على أيقونة حالة الحضور
  const getAttendanceIcon = (status: string | null) => {
    if (!status) return <InfoIcon />;
    switch (status) {
      case 'حاضر': return <CheckCircleIcon />;
      case 'متأخر': return <AssessmentIcon />;
      case 'مستأذن': return <InfoIcon />;
      case 'غائب': return <CancelIcon />;
      default: return <CancelIcon />;
    }
  };

  // الحصول على رمز اتجاه التقدم للطالب من تحليل الذكاء الاصطناعي
  const getTrendIcon = (studentId: string) => {
    const analytics = studentAnalytics[studentId];
    if (!analytics) return <TrendingFlatIcon color="info" />;
    
    switch(analytics.progress.trend) {
      case 'up': 
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="info" />;
    }
  };  // إحصائيات الطلاب
  const stats = useMemo(() => {
    const total = displayedStudents.length;
    const present = displayedStudents.filter(s => getAttendanceStatus(s) === 'حاضر').length;
    const late = displayedStudents.filter(s => getAttendanceStatus(s) === 'متأخر').length;
    const excused = displayedStudents.filter(s => getAttendanceStatus(s) === 'مستأذن').length;
    const absent = displayedStudents.filter(s => getAttendanceStatus(s) === 'غائب').length;
    const excellentStudents = displayedStudents.filter(s => s.totalScore >= 90).length;
    
    return { total, present, late, excused, absent, excellentStudents };
  }, [displayedStudents, todayAttendance]);
  // دالة فتح نافذة التحضير
  const handleOpenAttendance = () => {
    setShowAttendanceHint(false); // إخفاء التأشير عند فتح التحضير
    setAttendanceDialogOpen(true);
  };

  // دالة إغلاق نافذة التحضير
  const handleCloseAttendance = () => {
    setAttendanceDialogOpen(false);
  };// دالة نجاح إرسال التحضير
  const handleAttendanceSuccess = async () => {
    console.log('✅ تم إرسال التحضير بنجاح، فرض إعادة تحميل البيانات من الخادم...');
    setLoadingAttendance(true);
    
    try {
      // فرض إعادة تحميل بيانات التحضير من قاعدة البيانات (تجاهل التخزين المحلي)
      await forceLoadTodayAttendance();
    } catch (error) {
      console.error('خطأ في إعادة تحميل بيانات الحضور:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // فرض تحميل بيانات التحضير لليوم الحالي (تجاهل التخزين المحلي)
  const forceLoadTodayAttendance = async () => {
    try {      console.log('🔄 فرض إعادة تحميل بيانات التحضير من الخادم (تجاهل التخزين المحلي)...');
      
      const attendanceData = await forceRefreshAttendance(user?.id, currentMosque?.id);
      
      console.log('📊 البيانات المحدثة من الخادم:', attendanceData);      console.log('👥 عدد الطلاب في البيانات المحدثة:', Object.keys(attendanceData).length);
      
      // تحديث الحالة فوراً
      setTodayAttendance(attendanceData);
      
      // إخفاء التأشير بعد إرسال التحضير بنجاح
      if (Object.keys(attendanceData).length > 0) {
        setShowAttendanceHint(false);
      }
      
      // عرض تفاصيل إضافية للتشخيص
      if (Object.keys(attendanceData).length === 0) {
        console.log('ℹ️ لا توجد بيانات تحضير محدثة لليوم الحالي');
      } else {
        console.log('✅ تم تحديث بيانات التحضير بنجاح من الخادم لـ', Object.keys(attendanceData).length, 'طالب');
        Object.entries(attendanceData).forEach(([studentName, status]) => {
          console.log(`  📝 ${studentName}: ${status}`);
        });
      }
      
    } catch (error) {
      console.error('❌ خطأ في فرض إعادة تحميل بيانات التحضير:', error);
      
      // في حالة الخطأ، استخدم التحميل التقليدي كحل احتياطي
      console.log('🔄 محاولة التحميل التقليدي كحل احتياطي...');
      await loadTodayAttendance();
    }
  };

// تحميل بيانات التحضير لليوم الحالي
  const loadTodayAttendance = async () => {
    try {
      console.log('🔄 جلب بيانات التحضير لليوم الحالي...');
      
      const attendanceData = await getTodayAttendance(user?.id, currentMosque?.id);
      
      console.log('📊 البيانات المستلمة من API:', attendanceData);
      console.log('👥 عدد الطلاب في بيانات التحضير:', Object.keys(attendanceData).length);
      
      // تحديث الحالة فوراً
      setTodayAttendance(attendanceData);
      
      // عرض تفاصيل إضافية للتشخيص
      if (Object.keys(attendanceData).length === 0) {
        console.log('ℹ️ لا توجد بيانات تحضير لليوم الحالي - سيتم عرض الحالة الافتراضية');
      } else {
        console.log('✅ تم تحديث بيانات التحضير بنجاح لـ', Object.keys(attendanceData).length, 'طالب');
        Object.entries(attendanceData).forEach(([studentName, status]) => {
          console.log(`  📝 ${studentName}: ${status}`);
        });
      }
      
    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات التحضير:', error);
      
      // في حالة الخطأ، استخدم قاموس فارغ بدلاً من ترك الحالة القديمة
      setTodayAttendance({});
      
      // معلومات تشخيصية مختصرة
      if (error instanceof Error) {
        console.error('💬 رسالة الخطأ:', error.message);
      }    }  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 10, 
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="lg">
        {/* رأس الصفحة */}
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
          <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.1 }}>
            {/* نمط زخرفي بالخلفية */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,20 L40,20 M20,0 L20,40" stroke="#FFF" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="15" fill="none" stroke="#FFF" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ mr: 2, color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                طلاب {currentMosque?.name}
              </Typography>              <Typography variant="body1" sx={{ opacity: 0.8, mt: 0.5 }}>
                إدارة شؤون الطلاب والتسميع
              </Typography>              <Chip 
                label="يعرض طلاب المعلم" 
                size="small" 
                sx={{ 
                  mt: 1, 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  '& .MuiChip-label': { fontSize: '0.75rem' }
                }} 
              />
            </Box>
          </Box>
        </Paper>        {/* إحصائيات وفلاتر */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* إحصائيات */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 3,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ textAlign: 'center', p: 1, minWidth: 100 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.light', 
                    width: 45, 
                    height: 45, 
                    mb: 1,
                    mx: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">إجمالي الطلاب</Typography>
              </Box>
                <Box sx={{ textAlign: 'center', p: 1, minWidth: 100 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'success.light', 
                    width: 45, 
                    height: 45, 
                    mb: 1,
                    mx: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{stats.present}</Typography>
                <Typography variant="body2" color="text.secondary">حاضر</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 1, minWidth: 100 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'warning.light', 
                    width: 45, 
                    height: 45, 
                    mb: 1,
                    mx: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  <AssessmentIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{stats.late}</Typography>
                <Typography variant="body2" color="text.secondary">متأخر</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', p: 1, minWidth: 100 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'info.light', 
                    width: 45, 
                    height: 45, 
                    mb: 1,
                    mx: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  <InfoIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{stats.excused}</Typography>
                <Typography variant="body2" color="text.secondary">مستأذن</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 1, minWidth: 100 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'error.light', 
                    width: 45, 
                    height: 45, 
                    mb: 1,
                    mx: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  <CancelIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{stats.absent}</Typography>
                <Typography variant="body2" color="text.secondary">غائب</Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center', p: 1, minWidth: 100 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'warning.light', 
                    width: 45, 
                    height: 45, 
                    mb: 1,
                    mx: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  <GradeIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{stats.excellentStudents}</Typography>
                <Typography variant="body2" color="text.secondary">الطلاب المتميزون</Typography>
              </Box>
            </Paper>
          </Grid>          {/* بحث - يظهر فقط في الشاشات الكبيرة */}
          <Grid item xs={12} sm={6} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="بحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
                size="medium"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* أدوات التصفية والترتيب */}
        <Box sx={{ mb: 3 }}>
          <Paper
            elevation={0}
            sx={{ 
              p: 2, 
              borderRadius: 3,
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: '48px',
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: 3
                    }
                  }}
                >
                  <Tab label="الكل" />
                  <Tab label="الحاضرون" />
                  <Tab label="المتأخرون" />
                  <Tab label="المستأذنون" />
                  <Tab label="الغائبون" />
                </Tabs>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>ترتيب حسب</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="ترتيب حسب"
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="name">الاسم</MenuItem>
                    <MenuItem value="score">الدرجة</MenuItem>
                    <MenuItem value="attendance">الحضور</MenuItem>
                    <MenuItem value="progress">التقدم</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>المستوى</InputLabel>
                  <Select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    label="المستوى"
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterListIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">جميع المستويات</MenuItem>
                    <MenuItem value="مبتدئ">مبتدئ</MenuItem>
                    <MenuItem value="متوسط">متوسط</MenuItem>
                    <MenuItem value="متقدم">متقدم</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Box>        {/* قائمة الطلاب */}
        {loading ? (
          // حالة التحميل
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.light'
                  }}
                >
                  <PersonIcon fontSize="large" />
                </Avatar>
                
                <Typography variant="h6" color="text.primary" gutterBottom>
                  جاري تحميل بيانات الطلاب...
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  يتم البحث عن الحلقات والطلاب المُسندين إليك
                </Typography>
                
                <LinearProgress 
                  sx={{ 
                    width: '60%', 
                    mx: 'auto',
                    height: 6,
                    borderRadius: 3
                  }} 
                />
              </Paper>
            </Grid>
          </Grid>        ) : (
          <>
            {/* قائمة الطلاب - مع مسافة علوية كافية */}
            <Box sx={{ mt: 4 }}>
              {displayedStudents.length > 0 ? (
                <>
                  {/* عرض البطاقات في الشاشات الكبيرة */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Grid container spacing={3}>
                    {displayedStudents.map(student => {
                      const attendanceStatus = getAttendanceStatus(student);
                      const analytics = studentAnalytics[student.id];
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={student.id}>
                      <Card 
                        sx={{ 
                          borderRadius: 3,
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={() => handleStudentSelection(student)}
                      >
                        <Box 
                          sx={{ 
                            height: 15, 
                            width: '100%', 
                            bgcolor: attendanceStatus === 'حاضر' ? 'success.main' :
                                    attendanceStatus === 'متأخر' ? 'warning.main' :
                                    attendanceStatus === 'مستأذن' ? 'info.main' : 'error.main',
                            position: 'absolute',
                            top: 0,
                            zIndex: 1
                          }}
                        />
                        
                        <CardHeader
                          avatar={
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                width: 50,
                                height: 50,
                                boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                                border: '2px solid white'
                              }}
                            >
                              {student.name ? student.name.charAt(0) : '؟'}
                            </Avatar>
                          }
                          title={
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                              {student.name}
                            </Typography>
                          }
                          subheader={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <FaceIcon fontSize="small" color="disabled" />
                              <Typography variant="body2" color="text.secondary">
                                {student.level} | {student.age} سنة
                              </Typography>
                            </Stack>
                          }
                          sx={{ pt: 4, pb: 1 }}
                        />
                        
                        <CardContent sx={{ pt: 0 }}>
                          <Box sx={{ mt: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <MenuBookIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                                الحفظ الحالي:
                              </Typography>
                              <Chip 
                                label={student.totalScore >= 90 ? "ممتاز" : student.totalScore >= 75 ? "جيد جداً" : "متوسط"} 
                                color={student.totalScore >= 90 ? "success" : student.totalScore >= 75 ? "primary" : "warning"}
                                size="small"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </Box>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 1, 
                                bgcolor: 'background.default',
                                borderRadius: 2,
                                textAlign: 'center',
                                borderColor: 'divider'
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium">
                                سورة {student.currentMemorization.surahName} ({student.currentMemorization.fromAyah}-{student.currentMemorization.toAyah})
                              </Typography>
                            </Paper>
                          </Box>
                          
                          <Divider sx={{ my: 1 }} />
                          
                          {analytics && (
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">التقدم الشهري</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getTrendIcon(student.id)}
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      ml: 0.5,
                                      color: analytics.progress.trend === 'up' ? 'success.main' : 
                                             analytics.progress.trend === 'down' ? 'error.main' : 
                                             'info.main'
                                    }}
                                  >
                                    {analytics.progress.lastMonth > 0 ? `+${analytics.progress.lastMonth}%` : 
                                     analytics.progress.lastMonth < 0 ? `${analytics.progress.lastMonth}%` : 'مستقر'}
                                  </Typography>
                                </Box>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.max(0, Math.min(100, 50 + analytics.progress.lastMonth/2))} 
                                sx={{ height: 6, borderRadius: 3 }}
                                color={analytics.progress.trend === 'up' ? 'success' : 
                                      analytics.progress.trend === 'down' ? 'error' : 'info'}
                              />
                            </Box>
                          )}
                          
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Tooltip title={`الدرجة: ${student.totalScore}%`}>
                              <Chip 
                                icon={<GradeIcon />}
                                label={`${student.totalScore}%`} 
                                color={student.totalScore >= 90 ? "success" : student.totalScore >= 75 ? "primary" : "warning"}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>

                            <Tooltip title={`حالة الحضور اليوم`}>
                              {loadingAttendance ? (
                                <Chip 
                                  icon={<CircularProgress size={16} />}
                                  label="جاري التحديث..."
                                  color="info"
                                  size="small"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip 
                                  label={attendanceStatus || 'غير محدد'}
                                  color={
                                    attendanceStatus === 'حاضر' ? "success" : 
                                    attendanceStatus === 'متأخر' ? "warning" :
                                    attendanceStatus === 'مستأذن' ? "info" : 
                                    "error"
                                  }
                                  size="small"
                                  sx={{ 
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                  }}
                                />
                              )}
                            </Tooltip>

                            <Tooltip title={`نسبة الحضور: ${student.attendanceRate}%`}>
                              <Chip 
                                icon={<CalendarTodayIcon />}
                                label={`${student.attendanceRate}%`}
                                variant="outlined" 
                                color={student.attendanceRate > 90 ? "success" : student.attendanceRate > 75 ? "info" : "warning"}
                                size="small"
                              />
                            </Tooltip>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>            {/* عرض القائمة المضغوطة في الجوال */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2,
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
                }}
              >
                {displayedStudents.map((student, index) => {
                  const attendanceStatus = getAttendanceStatus(student);

                  return (                    <Card
                      key={student.id}
                      sx={{ 
                        mb: index === displayedStudents.length - 1 ? 0 : 2,
                        borderRadius: 2,
                        boxShadow: 'none',
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                        overflow: 'visible',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.3s ease',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        bgcolor: attendanceStatus === 'حاضر' ? 'success.main' :
                                attendanceStatus === 'متأخر' ? 'warning.main' :
                                attendanceStatus === 'مستأذن' ? 'info.main' : 'error.main',
                        borderRadius: '0 3px 3px 0'
                      }
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleStudentSelection(student)}
                      sx={{ p: 2 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* صورة الطالب */}
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            bgcolor: 'primary.main',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          {student.name ? student.name.charAt(0) : '؟'}
                        </Avatar>
                        
                        {/* معلومات الطالب */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              mb: 0.3,
                              fontSize: '1rem',
                              color: 'text.primary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {student.name}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              mb: 0.8,
                              fontSize: '0.8rem',
                              display: 'block'
                            }}
                          >
                            {student.age} سنة
                          </Typography>
                            {/* الحفظ الحالي */}
                          <Box 
                            sx={{ 
                              bgcolor: 'background.default',
                              borderRadius: 2,
                              p: 0.8,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'primary.main',
                                fontWeight: 'medium',
                                fontSize: '0.7rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block'
                              }}
                            >
                              📖 {student.currentMemorization.surahName} ({student.currentMemorization.fromAyah}-{student.currentMemorization.toAyah})
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* معلومات الحضور والدرجات */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'flex-end' }}>
                          {/* الدرجة */}
                          <Chip
                            size="small"
                            label={`${student.totalScore}%`}
                            sx={{
                              bgcolor: student.totalScore >= 90 ? 'success.light' : 
                                      student.totalScore >= 75 ? 'primary.light' : 'warning.light',
                              color: student.totalScore >= 90 ? 'success.dark' : 
                                    student.totalScore >= 75 ? 'primary.dark' : 'warning.dark',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 20,
                              minWidth: 45
                            }}
                          />
                          
                          {/* حالة الحضور */}
                          <Chip
                            size="small"
                            icon={getAttendanceIcon(attendanceStatus)}
                            label={attendanceStatus || 'غير محدد'}
                            sx={{
                              bgcolor: attendanceStatus === 'حاضر' ? 'success.light' :
                                      attendanceStatus === 'متأخر' ? 'warning.light' :
                                      attendanceStatus === 'مستأذن' ? 'info.light' : 'error.light',
                              color: attendanceStatus === 'حاضر' ? 'success.dark' :
                                    attendanceStatus === 'متأخر' ? 'warning.dark' :
                                    attendanceStatus === 'مستأذن' ? 'info.dark' : 'error.dark',
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              height: 20,
                              minWidth: 65,
                              '& .MuiChip-icon': {
                                fontSize: '0.8rem'
                              }
                            }}
                          />
                          
                          {/* نسبة الحضور */}
                          <Chip
                            size="small"
                            label={`${student.attendanceRate}%`}
                            sx={{
                              bgcolor: student.attendanceRate > 90 ? 'success.light' : 
                                      student.attendanceRate > 75 ? 'info.light' : 'warning.light',
                              color: student.attendanceRate > 90 ? 'success.dark' : 
                                    student.attendanceRate > 75 ? 'info.dark' : 'warning.dark',
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              height: 20,
                              minWidth: 45
                            }}
                          />
                        </Box>
                      </Box>                    </CardActionArea>
                  </Card>
                );
              })}
              </Paper>
            </Box>
          </>
        ) : (
                // حالة عدم وجود طلاب أو حلقات
                <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                border: `1px dashed ${theme.palette.divider}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
              }}
            >
              {hasTeacherCircles === false ? (
                // حالة عدم وجود حلقات للمعلم
                <>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: 'info.light',
                      fontSize: '2rem'
                    }}
                  >
                    <GroupAddIcon fontSize="large" />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                    لا توجد حلقات مُسندة إليك حتى الآن
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                    لعرض الطلاب، يجب أن تكون مُعيناً كمعلم لحلقة قرآنية واحدة على الأقل. 
                    تواصل مع إدارة المسجد لتعيينك كمعلم في إحدى الحلقات.
                  </Typography>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      mb: 4,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      maxWidth: 500,
                      mx: 'auto'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <InfoIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        كيفية إضافة حلقة قرآنية:
                      </Typography>
                    </Box>
                    
                    <Box component="ol" sx={{ textAlign: 'right', pl: 0, '& li': { mb: 1 } }}>
                      <Typography component="li" variant="body2" color="text.secondary">
                        تواصل مع إدارة المسجد أو مدير النظام
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        اطلب إنشاء حلقة قرآنية جديدة
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        سيتم تعيينك كمعلم للحلقة المُنشأة
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        بعدها يمكنك إضافة الطلاب للحلقة
                      </Typography>
                    </Box>
                  </Paper>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => navigate('/')}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        py: 1.5
                      }}
                    >
                      العودة للوحة الرئيسية
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      onClick={() => window.location.reload()}
                      sx={{ 
                        borderRadius: 2,
                        px: 4,
                        py: 1.5
                      }}
                    >
                      تحديث الصفحة
                    </Button>
                  </Stack>
                </>
              ) : (
                // حالة عدم وجود طلاب (للتصفية أو البحث)
                <>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'warning.light'
                    }}
                  >
                    <SearchIcon fontSize="large" />
                  </Avatar>
                  
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    لا يوجد طلاب بالمعايير المحددة
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    جرب تغيير معايير البحث أو الفلترة لعرض المزيد من النتائج
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setSearchQuery('');
                      setFilterLevel('all');
                      setActiveTab(0);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    عرض جميع الطلاب                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        )}
            </Box>
          </>
        )}

        {/* زر التحضير العائم - يظهر فقط عند وجود طلاب */}
        {filteredStudents.length > 0 && hasTeacherCircles === true && (
          <Fab
            color="primary"
            aria-label="تحضير الطلاب"
            onClick={handleOpenAttendance}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              boxShadow: '0 8px 20px rgba(30, 111, 142, 0.3)',
              '&:hover': {
                boxShadow: '0 12px 28px rgba(30, 111, 142, 0.4)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            <AssignmentIcon />
          </Fab>
        )}

        {/* تأشير لطيف للتحضير */}
        <Zoom in={showAttendanceHint} timeout={500}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 90,
              right: 20,
              zIndex: 1300,
              pointerEvents: 'none'
            }}
          >
            <Fade in={showAttendanceHint} timeout={800}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(30, 111, 142, 0.3)',
                  fontSize: '0.9rem',
                  fontWeight: 'medium',
                  animation: 'pulse 2s infinite',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    right: 20,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid',
                    borderTopColor: 'primary.main'
                  },
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 0.9
                    },
                    '50%': {
                      transform: 'scale(1.05)',
                      opacity: 1
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 0.9
                    }
                  }
                }}
              >
                من هنا التحضير 👆
              </Box>
            </Fade>
          </Box>
        </Zoom>{/* نافذة إدارة التحضير */}
        <AttendanceManager
          open={attendanceDialogOpen}
          onClose={handleCloseAttendance}
          students={filteredStudents}
          teacherId={user?.id?.toString() || ''}
          onSuccess={handleAttendanceSuccess}
          initialAttendance={todayAttendance}
        />        {/* نافذة تنبيه حالة الحضور */}
        <StudentAbsentAlert
          open={absentAlertOpen}
          onClose={() => {
            setAbsentAlertOpen(false);
            setSelectedStudentForAlert(null);
          }}
          onOpenAttendance={handleOpenAttendanceFromAlert}
          studentName={selectedStudentForAlert?.name || ''}
          attendanceStatus={alertAttendanceStatus}
          onContinue={alertAttendanceStatus !== 'غائب' ? handleContinueToMemorization : undefined}
        />

        {/* إشعار نجاح العمليات */}
        <Snackbar
          open={showSuccessSnackbar}
          onClose={() => setShowSuccessSnackbar(false)}
          autoHideDuration={2000}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
        >
          <Alert 
            onClose={() => setShowSuccessSnackbar(false)} 
            severity="success" 
            variant="filled"
            icon={<CheckCircleIcon />}
            sx={{ 
              borderRadius: 2,
              fontWeight: 'medium',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default StudentsList;
