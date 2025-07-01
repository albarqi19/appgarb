import React, { useState, useEffect } from 'react';
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
  Button,
  useTheme,
  Stack,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// أيقونات
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import MosqueIcon from '@mui/icons-material/Mosque';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';

// واجهات البيانات
interface TeacherActivity {
  teacher_id: number;
  teacher_name: string;
  phone: string;
  job_title: string;
  circle: {
    id: number;
    name: string;
  };
  mosque: {
    id: number;
    name: string;
  };
  daily_activity: {
    has_activity: boolean;
    attendance_recorded: boolean;
    recitation_recorded: boolean;
    students_count: number;
    attendance_count: number;
    recitation_sessions_count: number;
    recited_students_count: number;
    attendance_percentage: number;
    recitation_percentage: number;
    activity_status: string;
    status_color: string;
    details: {
      attendance_status: string;
      recitation_status: string;
      completion_summary: string;
    };
  };
}

interface ActivitySummary {
  total_teachers: number;
  active_teachers: number;
  attendance_recorded: number;
  recitation_recorded: number;
  completion_rate: number;
  attendance_percentage: number;
  recitation_percentage: number;
}

interface TeacherActivityResponse {
  success: boolean;
  data: {
    date: string;
    supervisor: {
      id: number;
      name: string;
    };
    teachers_activity: TeacherActivity[];
    summary: ActivitySummary;
  };
}

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app';

// دالة بسيطة لتنسيق التاريخ
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// دالة لتنسيق التاريخ للعرض بالعربية
const formatDateForDisplay = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  return date.toLocaleDateString('ar-SA', options);
};

const TeacherActivityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAppContext();
  
  // حالات البيانات
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mosqueFilter, setMosqueFilter] = useState<string>('all');
  
  // معرف المشرف (يجب الحصول عليه من المستخدم المسجل)
  const supervisorId = 1; // استخدام معرف ثابت للاختبار

  // جلب بيانات نشاط المعلمين
  const {
    data: activityData,
    isLoading,
    error,
    refetch
  } = useQuery<TeacherActivityResponse>({
    queryKey: ['teacherActivity', supervisorId, formatDate(selectedDate)],
    queryFn: async () => {
      const dateStr = formatDate(selectedDate);
      
      // إنشاء headers
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      };
      
      // إضافة التصريح إذا كان متوفراً
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/test/teachers-daily-activity?supervisor_id=${supervisorId}&date=${dateStr}`,
        {
          method: 'GET',
          headers
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('خطأ في API:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`فشل في جلب البيانات: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    enabled: !!supervisorId,
    retry: 1
  });

  // تصفية البيانات حسب الفلاتر
  const filteredTeachers = React.useMemo(() => {
    if (!activityData?.data?.teachers_activity) return [];
    
    return activityData.data.teachers_activity.filter(teacher => {
      // فلتر حسب الحالة
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !teacher.daily_activity.has_activity) return false;
        if (statusFilter === 'inactive' && teacher.daily_activity.has_activity) return false;
        if (statusFilter === 'complete' && teacher.daily_activity.activity_status !== 'نشط - مكتمل') return false;
        if (statusFilter === 'partial' && teacher.daily_activity.activity_status !== 'نشط - جزئي') return false;
      }
      
      // فلتر حسب المسجد
      if (mosqueFilter !== 'all' && teacher.mosque.id.toString() !== mosqueFilter) return false;
      
      return true;
    });
  }, [activityData, statusFilter, mosqueFilter]);

  // الحصول على قائمة المساجد الفريدة للفلتر
  const uniqueMosques = React.useMemo(() => {
    if (!activityData?.data?.teachers_activity) return [];
    
    const mosques = new Map();
    activityData.data.teachers_activity.forEach(teacher => {
      mosques.set(teacher.mosque.id, teacher.mosque);
    });
    
    return Array.from(mosques.values());
  }, [activityData]);

  // دالة لتحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return theme.palette.success.main;
      case 'orange': return theme.palette.warning.main;
      case 'red': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  // دالة لتحديد أيقونة الحالة
  const getStatusIcon = (activity: TeacherActivity['daily_activity']) => {
    if (activity.has_activity) {
      if (activity.attendance_recorded && activity.recitation_recorded) {
        return <CheckCircleIcon color="success" />;
      } else {
        return <WarningIcon color="warning" />;
      }
    }
    return <ErrorIcon color="error" />;
  };

  // مكون بطاقة المعلم
  const TeacherCard: React.FC<{ teacher: TeacherActivity }> = ({ teacher }) => (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'light' 
            ? theme.shadows[8]
            : '0 8px 32px rgba(0, 0, 0, 0.5)'
        },
        border: `2px solid ${getStatusColor(teacher.daily_activity.status_color)}`,
        borderRadius: 3,
        background: theme.palette.mode === 'light' 
          ? '#ffffff'
          : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)',
        backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : 'none',
        boxShadow: theme.palette.mode === 'light' 
          ? '0 4px 20px rgba(0, 0, 0, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <CardContent>
        {/* رأس البطاقة */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: getStatusColor(teacher.daily_activity.status_color), mr: 2 }}>
            <PersonIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              {teacher.teacher_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
              <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
              {teacher.phone}
            </Typography>
          </Box>
          {getStatusIcon(teacher.daily_activity)}
        </Box>

        {/* معلومات المسجد والحلقة */}
        <Box mb={2}>
          <Chip
            icon={<MosqueIcon />}
            label={teacher.mosque.name}
            size="small"
            sx={{ mr: 1, mb: 1 }}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<SchoolIcon />}
            label={teacher.circle.name}
            size="small"
            sx={{ mb: 1 }}
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* حالة النشاط */}
        <Box mb={2}>
          <Chip
            label={teacher.daily_activity.activity_status}
            sx={{
              bgcolor: getStatusColor(teacher.daily_activity.status_color),
              color: 'white',
              fontWeight: 'bold',
              width: '100%'
            }}
          />
        </Box>

        {/* الإحصائيات */}
        <Grid container spacing={1} mb={2}>
          <Grid item xs={6}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center', 
                background: theme.palette.mode === 'light' 
                  ? theme.palette.grey[50]
                  : 'rgba(100, 116, 139, 0.2)',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="primary">
                {teacher.daily_activity.students_count}
              </Typography>
              <Typography variant="caption">
                إجمالي الطلاب
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center', 
                background: theme.palette.mode === 'light' 
                  ? theme.palette.success.light + '20'
                  : 'rgba(46, 125, 50, 0.3)',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="success.main">
                {teacher.daily_activity.attendance_count}
              </Typography>
              <Typography variant="caption">
                الحضور
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* شريط التقدم للحضور */}
        <Box mb={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2">نسبة الحضور</Typography>
            <Typography variant="body2" fontWeight="bold">
              {teacher.daily_activity.attendance_percentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={teacher.daily_activity.attendance_percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.mode === 'light' 
                ? theme.palette.grey[200]
                : 'rgba(100, 116, 139, 0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: teacher.daily_activity.attendance_recorded 
                  ? theme.palette.success.main 
                  : theme.palette.grey[400],
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* شريط التقدم للتسميع */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2">نسبة التسميع</Typography>
            <Typography variant="body2" fontWeight="bold">
              {teacher.daily_activity.recitation_percentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={teacher.daily_activity.recitation_percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.mode === 'light' 
                ? theme.palette.grey[200]
                : 'rgba(100, 116, 139, 0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: teacher.daily_activity.recitation_recorded 
                  ? theme.palette.info.main 
                  : theme.palette.grey[400],
                borderRadius: 4
              }
            }}
          />
        </Box>

        {/* التفاصيل */}
        <Box>
          <Typography variant="body2" color="text.secondary">
            {teacher.daily_activity.details.completion_summary}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
            : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? '#ffffff'
              : 'rgba(30, 41, 59, 0.9)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : 'none'
          }}
        >
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            🔄 جاري تحميل بيانات المعلمين...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
            : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? '#ffffff'
              : 'rgba(30, 41, 59, 0.9)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : 'none'
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            ❌ حدث خطأ في جلب البيانات: {error.message}
          </Alert>
          <Button 
            onClick={() => refetch()} 
            startIcon={<RefreshIcon />}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
              }
            }}
          >
            إعادة المحاولة
          </Button>
        </Paper>
      </Box>
    );
  }

  const summary = activityData?.data?.summary;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 2,
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="lg">
        {/* شريط التنقل العلوي */}
        <AppBar 
          position="static" 
          sx={{ 
            borderRadius: 2, 
            mb: 3,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
            boxShadow: theme.palette.mode === 'light' 
              ? '0 4px 20px rgba(25, 118, 210, 0.3)'
              : '0 4px 20px rgba(13, 71, 161, 0.5)'
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/supervisor-dashboard')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <TimelineIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              متابعة نشاط المعلمين
            </Typography>
            <Typography variant="body2">
              {activityData?.data?.supervisor.name}
            </Typography>
          </Toolbar>
        </AppBar>        {/* أدوات التحكم */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? '#ffffff'
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(148, 163, 184, 0.2)'
              : 'none',
            boxShadow: theme.palette.mode === 'light' 
              ? '0 4px 20px rgba(0, 0, 0, 0.08)'
              : '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="التاريخ"
              type="date"
              value={formatDate(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>حالة النشاط</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="حالة النشاط"
                >
                  <MenuItem value="all">جميع الحالات</MenuItem>
                  <MenuItem value="active">نشط</MenuItem>
                  <MenuItem value="inactive">غير نشط</MenuItem>
                  <MenuItem value="complete">مكتمل</MenuItem>
                  <MenuItem value="partial">جزئي</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>المسجد</InputLabel>
                <Select
                  value={mosqueFilter}
                  onChange={(e) => setMosqueFilter(e.target.value)}
                  label="المسجد"
                >
                  <MenuItem value="all">جميع المساجد</MenuItem>
                  {uniqueMosques.map((mosque) => (
                    <MenuItem key={mosque.id} value={mosque.id.toString()}>
                      {mosque.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* الملخص الإحصائي */}
        {summary && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={2}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
                    : 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                  color: 'white',
                  boxShadow: theme.palette.mode === 'light' 
                    ? '0 4px 20px rgba(33, 150, 243, 0.3)'
                    : '0 4px 20px rgba(13, 71, 161, 0.4)'
                }}
              >
                <PeopleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {summary.total_teachers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>إجمالي المعلمين</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'
                    : 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                  color: 'white',
                  boxShadow: theme.palette.mode === 'light' 
                    ? '0 4px 20px rgba(76, 175, 80, 0.3)'
                    : '0 4px 20px rgba(46, 125, 50, 0.4)'
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {summary.active_teachers}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>معلمين نشطين</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)'
                    : 'linear-gradient(135deg, #00838F 0%, #006064 100%)',
                  color: 'white',
                  boxShadow: theme.palette.mode === 'light' 
                    ? '0 4px 20px rgba(0, 188, 212, 0.3)'
                    : '0 4px 20px rgba(0, 131, 143, 0.4)'
                }}
              >
                <EventAvailableIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {summary.attendance_recorded}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>سجلوا الحضور</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
                    : 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
                  color: 'white',
                  boxShadow: theme.palette.mode === 'light' 
                    ? '0 4px 20px rgba(156, 39, 176, 0.3)'
                    : '0 4px 20px rgba(106, 27, 154, 0.4)'
                }}
              >
                <RecordVoiceOverIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {summary.recitation_recorded}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>سجلوا التسميع</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'
                    : 'linear-gradient(135deg, #EF6C00 0%, #E65100 100%)',
                  color: 'white',
                  boxShadow: theme.palette.mode === 'light' 
                    ? '0 4px 20px rgba(255, 152, 0, 0.3)'
                    : '0 4px 20px rgba(239, 108, 0, 0.4)'
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {summary.completion_rate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>معدل الإنجاز</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  borderRadius: 3,
                  background: theme.palette.mode === 'light' 
                    ? 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)'
                    : 'linear-gradient(135deg, #37474F 0%, #263238 100%)',
                  color: 'white',
                  boxShadow: theme.palette.mode === 'light' 
                    ? '0 4px 20px rgba(96, 125, 139, 0.3)'
                    : '0 4px 20px rgba(55, 71, 79, 0.4)'
                }}
              >
                <AssessmentIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                <Typography variant="h4" fontWeight="bold">
                  {summary.attendance_percentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>متوسط الحضور</Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* عداد المعلمين المعروضين */}
        <Box mb={2}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              borderRadius: 3,
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(13, 71, 161, 0.3) 0%, rgba(21, 101, 192, 0.3) 100%)',
              border: theme.palette.mode === 'dark' 
                ? '1px solid rgba(148, 163, 184, 0.2)'
                : 'none'
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary">
              📚 المعلمين ({filteredTeachers.length} من {activityData?.data?.teachers_activity.length || 0})
            </Typography>
          </Paper>
        </Box>

        {/* قائمة المعلمين */}
        <Grid container spacing={3}>
          {filteredTeachers.map((teacher) => (
            <Grid item xs={12} sm={6} lg={4} key={teacher.teacher_id}>
              <TeacherCard teacher={teacher} />
            </Grid>
          ))}
        </Grid>

        {/* رسالة عدم وجود نتائج */}
        {filteredTeachers.length === 0 && (
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              py: 6,
              borderRadius: 3,
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(117, 117, 117, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(55, 71, 79, 0.3) 0%, rgba(38, 50, 56, 0.3) 100%)',
              border: theme.palette.mode === 'dark' 
                ? '1px solid rgba(148, 163, 184, 0.1)'
                : 'none'
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              📭 لا توجد بيانات للمعلمين
            </Typography>
            <Typography variant="body2" color="text.secondary">
              لم يتم العثور على معلمين يطابقون الفلاتر المحددة في التاريخ المحدد
            </Typography>
          </Paper>
        )}

        {/* زر التحديث العائم */}
        <Fab
          color="primary"
          onClick={() => refetch()}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'
              : 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
            boxShadow: theme.palette.mode === 'light' 
              ? '0 6px 20px rgba(33, 150, 243, 0.4)'
              : '0 6px 20px rgba(13, 71, 161, 0.6)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: theme.palette.mode === 'light' 
                ? '0 8px 25px rgba(33, 150, 243, 0.6)'
                : '0 8px 25px rgba(13, 71, 161, 0.8)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <RefreshIcon />
        </Fab>
      </Container>
    </Box>
  );
};

  export default TeacherActivityDashboard;
