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
  SupervisorStatistics,
  SubCircle
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
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';

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
  const [subCircles, setSubCircles] = useState<SubCircle[]>([]); // قائمة الحلقات الفرعية
  const [loadingSubCircles, setLoadingSubCircles] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // إضافة حالات لإدارة الطلاب
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  const [quranSchoolInfo, setQuranSchoolInfo] = useState<any>(null);
  const [circleGroups, setCircleGroups] = useState<any[]>([]);
  const [isLoadingSchoolInfo, setIsLoadingSchoolInfo] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    identity_number: '',
    name: '',
    phone: '',
    guardian_name: '',
    guardian_phone: '',
    birth_date: '',
    nationality: 'سعودي',
    education_level: '',
    neighborhood: '',
    circle_group_id: '',
    enrollment_date: '',
    memorization_plan: '',
    review_plan: ''
  });

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
    isError,
    refetch: refetchCompleteData
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

  // إضافة console.log لمراقبة البيانات
  console.log('🔍 بيانات المشرف الأساسية:', {
    loading,
    hasCompleteData: !!completeData,
    circlesCount: supervisorCircles.length,
    hasToken: !!user?.token,
    user: user,
    supervisorCircles: supervisorCircles.map(c => ({ id: c.id, name: c.name }))
  });
  const error = isError ? 'فشل في تحميل بيانات المشرف' : null;

  // البيانات الشاملة الجديدة
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveOverview | null>(null);

  // بيانات المشرف الحالي (مؤقتاً من البيانات المحلية)
  const currentSupervisor = supervisors[0];
  const supervisedMosquesList = mosques.filter(m => currentSupervisor.supervisedMosques.includes(m.id));
  const supervisedStudents = students.filter(s => currentSupervisor.supervisedMosques.includes(s.mosqueId));  const todayAttendance = teacherAttendanceData.filter(ta => ta.date === '2025-06-07' && currentSupervisor.supervisedMosques.includes(ta.mosqueId));

  // إضافة API endpoint للحصول على نشاط المعلمين اليومي
  const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app';
  
  // دالة لتنسيق التاريخ
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // جلب بيانات نشاط المعلمين اليوميى لحساب الحضور الحقيقي
  const {
    data: teacherActivityData,
    isLoading: isLoadingActivity
  } = useQuery({
    queryKey: ['teacherActivityForStats', 1, formatDate(new Date())], // معرف المشرف = 1
    queryFn: async () => {
      const dateStr = formatDate(new Date());
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      };
      
      if (user?.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/test/teachers-daily-activity?supervisor_id=1&date=${dateStr}`,
        {
          method: 'GET',
          headers
        }
      );
      
      if (!response.ok) {
        console.warn('فشل في جلب بيانات نشاط المعلمين للإحصائيات');
        return null;
      }
      
      return response.json();
    },
    enabled: true,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // الحصول على إحصائيات المشرف (محدثة لاستخدام البيانات من API مع حضور حقيقي)
  const getSupervisorStats = () => {
    console.log('🔍 فحص البيانات للإحصائيات:', {
      loading,
      supervisorStats,
      hasStats: !!supervisorStats,
      supervisorCircles: supervisorCircles.length,
      supervisorStudents: supervisorStudents.length,
      supervisorTeachers: supervisorTeachers.length,
      teacherActivityData: !!teacherActivityData,
      isLoadingActivity
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
    }

    // حساب الإحصائيات من البيانات الحقيقية المحملة من API
    console.log('📊 حساب الإحصائيات من البيانات الحقيقية...');
    
    // حساب عدد المساجد الفريدة
    const uniqueMosques = new Set(supervisorCircles.map(c => c.mosque.id));
    const totalMosques = uniqueMosques.size;
    
    // عدد الطلاب الإجمالي
    const totalStudents = supervisorStudents.length;
    
    // عدد المعلمين الإجمالي
    const totalTeachers = supervisorTeachers.length;
    
    // حساب عدد المعلمين الحاضرين بناءً على النشاط الحقيقي
    let presentTeachers = 0;
    let attendanceRate = 0;
    
    if (teacherActivityData?.success && teacherActivityData?.data?.teachers_activity) {
      // حساب المعلمين الحاضرين بناءً على وجود نشاط (تحضير أو تسميع)
      const teachersWithActivity = teacherActivityData.data.teachers_activity.filter(
        (teacher: any) => teacher.daily_activity.has_activity && 
        (teacher.daily_activity.attendance_recorded || teacher.daily_activity.recitation_recorded)
      );
      
      presentTeachers = teachersWithActivity.length;
      attendanceRate = teacherActivityData.data.teachers_activity.length > 0 
        ? Math.round((presentTeachers / teacherActivityData.data.teachers_activity.length) * 100)
        : 0;
      
      console.log('✅ حضور المعلمين محسوب من بيانات النشاط الحقيقية:', {
        totalFromActivity: teacherActivityData.data.teachers_activity.length,
        presentTeachers,
        attendanceRate
      });
    } else {
      // إذا لم تتوفر بيانات النشاط، استخدم تقدير محافظ
      presentTeachers = Math.floor(totalTeachers * 0.75); // تقدير محافظ 75%
      attendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;
      
      console.log('⚠️ استخدام تقدير للحضور (بيانات النشاط غير متوفرة):', {
        totalTeachers,
        presentTeachers,
        attendanceRate
      });
    }
    
    // عدد طلبات النقل المعلقة (يمكن تحسينه بـ API منفصل)
    const pendingTransfers = 0; // سيتم تحديثه عند توفر API طلبات النقل

    const result = {
      totalMosques,
      totalStudents,
      attendanceRate,
      pendingTransfers,
      presentTeachers,
      totalTeachers
    };
    
    console.log('✅ الإحصائيات المحسوبة من البيانات الحقيقية:', result);
    return result;
  };

  const stats = useMemo(() => getSupervisorStats(), [
    loading, 
    supervisorStats, 
    supervisorCircles.length, 
    supervisorStudents.length, 
    supervisorTeachers.length,
    teacherActivityData,
    isLoadingActivity
  ]);

  // إعادة حساب الإحصائيات عند تحديث البيانات
  useEffect(() => {
    console.log('🔄 تحديث الإحصائيات بعد تحديث البيانات');
  }, [supervisorStats, supervisorCircles.length, supervisorStudents.length, supervisorTeachers.length]);

  // جلب الحلقات الفرعية عند تحميل بيانات الحلقات
  useEffect(() => {
    console.log('🔄 useEffect تم تنفيذه - جلب الحلقات الفرعية');
    const fetchAllSubCircles = async () => {
      console.log('🔍 تحقق من الشروط:', {
        circlesLength: supervisorCircles.length,
        hasToken: !!user?.token,
        circles: supervisorCircles.map(c => ({ id: c.id, name: c.name }))
      });
      
      if (supervisorCircles.length > 0) {
        console.log('🔄 جاري جلب الحلقات الفرعية للحلقات المتاحة...');
        setLoadingSubCircles(true);
        
        const allSubCircles = [];
        
        for (const circle of supervisorCircles) {
          try {
            console.log(`📡 جلب الحلقات الفرعية للحلقة: ${circle.name} (ID: ${circle.id})`);
            // تجربة بدون token أولاً، ثم مع token إذا فشل
            const response = await supervisorService.getQuranSchoolHierarchy(circle.id, user?.token || undefined);
            console.log(`📋 استجابة API للحلقة ${circle.id}:`, response);
            
            if (response.success && response.data?.sub_circles) {
              // إضافة معلومات الحلقة الأساسية لكل حلقة فرعية
              const circleSubCircles = response.data.sub_circles.map(subCircle => ({
                ...subCircle,
                parent_circle_id: circle.id,
                parent_circle_name: circle.name,
                mosque_name: response.data.mosque.mosque_name
              }));
              
              allSubCircles.push(...circleSubCircles);
              console.log(`✅ تم جلب ${circleSubCircles.length} حلقات فرعية للحلقة ${circle.name}`);
            } else {
              console.warn(`⚠️ لا توجد حلقات فرعية أو فشل في جلب البيانات للحلقة ${circle.name}`);
            }
          } catch (error) {
            console.error(`❌ خطأ في جلب الحلقات الفرعية للحلقة ${circle.name}:`, error);
          }
        }
        
        setSubCircles(allSubCircles);
        setLoadingSubCircles(false);
        console.log(`🎯 تم جلب إجمالي ${allSubCircles.length} حلقة فرعية`, allSubCircles);
      } else {
        console.log('❌ لا يمكن جلب الحلقات الفرعية - لا توجد حلقات متاحة');
        setSubCircles([]);
        setLoadingSubCircles(false);
      }
    };

    fetchAllSubCircles();
  }, [supervisorCircles.length, user?.token, loading]); // إضافة loading للتأكد من التنفيذ بعد تحميل البيانات

  // معالجة طلب نقل طالب - محدث للعمل مع APIs المدرسة القرآنية
  const handleStudentTransfer = async () => {
    try {
      if (!selectedStudent) {
        alert('يرجى اختيار طالب للنقل');
        return;
      }

      console.log('🔍 بيانات النقل قبل الإرسال:', {
        selectedStudent,
        transferReason,
        transferType,
        targetMosque,
        targetCircle
      });

      // بناء بيانات النقل - نقل فقط معرف الحلقة الفرعية الجديدة
      const transferData: any = {};
      
      if (transferType === 'circle' && targetCircle) {
        // نقل بين الحلقات الفرعية في نفس المدرسة
        transferData.circle_group_id = parseInt(targetCircle);
      } else if (transferType === 'mosque' && targetMosque) {
        // نقل إلى مسجد آخر - هذا يتطلب معالجة خاصة
        // يجب أولاً الحصول على الحلقات الفرعية في المسجد الجديد
        alert('نقل الطالب إلى مسجد آخر يتطلب تنسيق مع إدارة النظام');
        return;
      } else {
        alert('يرجى اختيار الوجهة للنقل');
        return;
      }

      console.log('📤 بيانات النقل النهائية:', transferData);
      
      // استخدام API تحديث الطالب لنقله
      const response = await fetch(`${API_BASE_URL}/api/quran-schools/${supervisorId}/students/${selectedStudent}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(transferData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ تم نقل الطالب بنجاح:', result);
        alert(`تم نقل الطالب بنجاح\nنوع النقل: ${transferType === 'circle' ? 'نقل بين الحلقات' : 'نقل إلى مسجد آخر'}\nالسبب: ${transferReason || 'لم يتم تحديد سبب'}`);
        
        // إعادة تحميل قائمة الطلاب لإظهار التحديث
        refetchCompleteData();
        
        // إغلاق النافذة وإعادة تعيين القيم
        setTransferDialogOpen(false);
        setSelectedStudent('');
        setTransferReason('');
        setTargetMosque('');
        setTargetCircle('');
        setTransferType('mosque');
      } else {
        const errorData = await response.json();
        console.error('❌ فشل في نقل الطالب:', errorData);
        alert(`فشل في نقل الطالب: ${errorData.message || 'خطأ غير معروف'}`);
      }
      
    } catch (error) {
      console.error('❌ خطأ في نقل الطالب:', error);
      alert('حدث خطأ في نقل الطالب');
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

  // الحصول على إيقونة الحضور
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

  // دالة لجلب الحلقات الفرعية للحلقة الحالية للطالب
  const fetchSubCircles = async (studentId: string) => {
    if (!studentId) {
      setSubCircles([]);
      return;
    }

    const student = supervisorStudents.find(s => s.id.toString() === studentId);
    if (!student?.circle?.id) {
      setSubCircles([]);
      return;
    }

    setLoadingSubCircles(true);
    try {
      const response = await supervisorService.getQuranSchoolHierarchy(student.circle.id, user?.token);
      if (response.success && response.data.sub_circles) {
        setSubCircles(response.data.sub_circles);
      } else {
        setSubCircles([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الحلقات الفرعية:', error);
      setSubCircles([]);
    } finally {
      setLoadingSubCircles(false);
    }
  };

  // تحديث الحلقات الفرعية عند تغيير الطالب المحدد
  useEffect(() => {
    if (transferType === 'circle' && selectedStudent) {
      fetchSubCircles(selectedStudent);
      // جلب الحلقات الفرعية من API المدرسة القرآنية أيضاً
      fetchQuranSchoolInfo(supervisorId);
    }
  }, [selectedStudent, transferType]);

  // دوال جديدة لإدارة الطلاب
  const fetchQuranSchoolInfo = async (quranSchoolId: number) => {
    try {
      setIsLoadingSchoolInfo(true);
      console.log('📡 جلب معلومات المدرسة القرآنية:', quranSchoolId);
      
      const response = await fetch(`${API_BASE_URL}/api/quran-schools/${quranSchoolId}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ معلومات المدرسة القرآنية:', data);
        setQuranSchoolInfo(data.data.quran_school);
        setCircleGroups(data.data.circle_groups);
      } else {
        console.error('❌ فشل في جلب معلومات المدرسة القرآنية');
      }
    } catch (error) {
      console.error('❌ خطأ في جلب معلومات المدرسة القرآنية:', error);
    } finally {
      setIsLoadingSchoolInfo(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudentData.identity_number || !newStudentData.name || !newStudentData.guardian_name || !newStudentData.guardian_phone || !newStudentData.circle_group_id) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
      }

      console.log('📤 إضافة طالب جديد:', newStudentData);
      
      const response = await fetch(`${API_BASE_URL}/api/quran-schools/${supervisorId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(newStudentData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ تم إضافة الطالب بنجاح:', result);
        alert('تم إضافة الطالب بنجاح');
        setAddStudentDialogOpen(false);
        resetStudentForm();
        // إعادة تحميل قائمة الطلاب
        refetchCompleteData();
      } else {
        const errorData = await response.json();
        console.error('❌ فشل في إضافة الطالب:', errorData);
        alert(`فشل في إضافة الطالب: ${errorData.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('❌ خطأ في إضافة الطالب:', error);
      alert('حدث خطأ في إضافة الطالب');
    }
  };

  const resetStudentForm = () => {
    setNewStudentData({
      identity_number: '',
      name: '',
      phone: '',
      guardian_name: '',
      guardian_phone: '',
      birth_date: '',
      nationality: 'سعودي',
      education_level: '',
      neighborhood: '',
      circle_group_id: '',
      enrollment_date: '',
      memorization_plan: '',
      review_plan: ''
    });
  };

  const handleOpenAddStudentDialog = () => {
    setAddStudentDialogOpen(true);
    // جلب معلومات المدرسة القرآنية عند فتح الحوار
    fetchQuranSchoolInfo(supervisorId);
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
                          {teacherActivityData?.success && (
                            <Typography variant="caption" display="block" sx={{ 
                              opacity: 0.6, 
                              fontSize: '0.65rem',
                              color: 'success.main' 
                            }}>
                              ✓ بيانات حقيقية
                            </Typography>
                          )}
                          {(!teacherActivityData?.success && !isLoadingActivity) && (
                            <Typography variant="caption" display="block" sx={{ 
                              opacity: 0.6, 
                              fontSize: '0.65rem',
                              color: 'warning.main' 
                            }}>
                              ~ تقدير
                            </Typography>
                          )}
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
            <Tab label="الطلاب" />
            <Tab label="متابعة نشاط المعلمين" />
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
                    <Typography variant="h6" fontWeight="bold">
                      {stats.pendingTransfers}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      طلبات النقل
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
        </TabPanel>        {/* تبويبة الطلاب */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    إدارة الطلاب ({getFilteredStudents().length} طالب)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      onClick={handleOpenAddStudentDialog}
                    >
                      إضافة طالب
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SwapHorizIcon />}
                      onClick={() => setTransferDialogOpen(true)}
                    >
                      نقل طالب
                    </Button>
                  </Box>
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
                              {student.group ? student.group.name : (student.circle ? student.circle.name : 'غير محدد')}
                            </Typography>
                            {student.group && student.circle && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {student.circle.name}
                              </Typography>
                            )}
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
        </TabPanel>        {/* تبويبة متابعة نشاط المعلمين */}
        <TabPanel value={activeTab} index={3}>
          <TeacherActivityTab supervisorId={supervisorId} user={user} navigate={navigate} />
        </TabPanel>        {/* تبويبة تحضير المعلمين - محدث لاستخدام البيانات من API */}
        <TabPanel value={activeTab} index={5}>
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
        <TabPanel value={activeTab} index={6}>
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
        <TabPanel value={activeTab} index={7}>
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
        <TabPanel value={activeTab} index={8}>
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

        {/* نافذة نقل الطالب */}
        <Dialog 
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
                      {student.name} - {student.group ? student.group.name : 'غير محدد'}
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
                          {mosque.name} - {mosque.location || 'غير محدد'}
                        </MenuItem>
                      ) : null;
                    })}
                  </Select>
                </FormControl>
              )}

              {/* اختيار الحلقة (في حالة النقل بين الحلقات) */}
              {transferType === 'circle' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>الحلقة الفرعية الجديدة</InputLabel>
                  <Select
                    value={targetCircle}
                    onChange={(e) => setTargetCircle(e.target.value)}
                    label="الحلقة الفرعية الجديدة"
                    disabled={!selectedStudent}
                  >
                    {selectedStudent ? (
                      circleGroups.length > 0 ? (
                        circleGroups.map((group) => (
                          <MenuItem key={group.id} value={group.id}>
                            {group.name} - المعلم: {group.teacher?.name || 'غير محدد'} 
                            ({group.students_count} طالب)
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>
                          لا توجد حلقات فرعية متاحة
                        </MenuItem>
                      )
                    ) : (
                      <MenuItem disabled>
                        يرجى اختيار طالب أولاً
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              )}
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="سبب النقل (اختياري)"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="اذكر سبب طلب النقل (اختياري)..."
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
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
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

        {/* نافذة إضافة طالب */}
        <Dialog 
          open={addStudentDialogOpen} 
          onClose={() => setAddStudentDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>إضافة طالب جديد</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* معلومات المدرسة القرآنية (غير قابلة للتعديل) */}
              {isLoadingSchoolInfo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2">جاري تحميل معلومات المدرسة...</Typography>
                </Box>
              ) : quranSchoolInfo ? (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    المدرسة القرآنية: {quranSchoolInfo.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    المسجد: {quranSchoolInfo.mosque?.name || 'غير محدد'}
                  </Typography>
                </Box>
              ) : null}

              <Grid container spacing={2}>
                {/* البيانات الأساسية */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="رقم الهوية"
                    value={newStudentData.identity_number}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, identity_number: e.target.value }))}
                    placeholder="مثال: 1234567890"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="اسم الطالب"
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="الاسم الكامل للطالب"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="هاتف الطالب (اختياري)"
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="مثال: 0501234567"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="تاريخ الميلاد (اختياري)"
                    value={newStudentData.birth_date}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, birth_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* بيانات ولي الأمر */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                    بيانات ولي الأمر
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="اسم ولي الأمر"
                    value={newStudentData.guardian_name}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, guardian_name: e.target.value }))}
                    placeholder="الاسم الكامل لولي الأمر"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="هاتف ولي الأمر"
                    value={newStudentData.guardian_phone}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, guardian_phone: e.target.value }))}
                    placeholder="مثال: 0507654321"
                  />
                </Grid>

                {/* اختيار الحلقة الفرعية */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>الحلقة الفرعية</InputLabel>
                    <Select
                      value={newStudentData.circle_group_id}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, circle_group_id: e.target.value }))}
                      label="الحلقة الفرعية"
                      disabled={circleGroups.length === 0}
                    >
                      {circleGroups.map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name} - المعلم: {group.teacher?.name || 'غير محدد'} 
                          ({group.students_count} طالب)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* بيانات إضافية */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>الجنسية</InputLabel>
                    <Select
                      value={newStudentData.nationality}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, nationality: e.target.value }))}
                      label="الجنسية"
                    >
                      <MenuItem value="سعودي">سعودي</MenuItem>
                      <MenuItem value="مقيم">مقيم</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="المستوى التعليمي (اختياري)"
                    value={newStudentData.education_level}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, education_level: e.target.value }))}
                    placeholder="مثال: ابتدائي، متوسط، ثانوي"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الحي (اختياري)"
                    value={newStudentData.neighborhood}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    placeholder="اسم الحي"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="تاريخ التسجيل (اختياري)"
                    value={newStudentData.enrollment_date}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, enrollment_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="خطة الحفظ (اختياري)"
                    value={newStudentData.memorization_plan}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, memorization_plan: e.target.value }))}
                    placeholder="مثال: حفظ جزء عم"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="خطة المراجعة (اختياري)"
                    value={newStudentData.review_plan}
                    onChange={(e) => setNewStudentData(prev => ({ ...prev, review_plan: e.target.value }))}
                    placeholder="مثال: مراجعة يومية"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAddStudentDialogOpen(false);
              resetStudentForm();
            }}>
              إلغاء
            </Button>
            <Button 
              variant="contained" 
              onClick={handleAddStudent}
              disabled={
                !newStudentData.identity_number || 
                !newStudentData.name || 
                !newStudentData.guardian_name || 
                !newStudentData.guardian_phone || 
                !newStudentData.circle_group_id
              }
            >
              إضافة الطالب
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

// واجهات البيانات لنشاط المعلمين
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

// دالة لتنسيق التاريخ
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// component منفصل لتبويبة نشاط المعلمين
const TeacherActivityTab: React.FC<{
  supervisorId: number;
  user: any;
  navigate: any;
}> = ({ supervisorId, user, navigate }) => {
  const [selectedDate] = useState<Date>(new Date());
  
  // جلب بيانات نشاط المعلمين باستخدام نفس API الموحد
  const {
    data: activityData,
    isLoading: activityLoading,
    error: activityError
  } = useQuery<TeacherActivityResponse>({
    queryKey: ['teacherActivitySummary', supervisorId, formatDate(selectedDate)],
    queryFn: async () => {
      const dateStr = formatDate(selectedDate);
      const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app';
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      };
      
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
        throw new Error(`فشل في جلب البيانات: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!supervisorId,
    retry: 1
  });

  // استخراج البيانات
  const summary = activityData?.data?.summary;
  const teachersActivity = activityData?.data?.teachers_activity || [];

  if (activityLoading) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              جاري تحميل بيانات نشاط المعلمين...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  if (activityError) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Alert severity="error">
              خطأ في تحميل بيانات نشاط المعلمين: {activityError.message}
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                متابعة نشاط المعلمين اليومي
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                * يتم حساب الحضور بناءً على وجود تحضير أو تسميع فقط
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/teacher-activity-dashboard')}
              startIcon={<TimelineIcon />}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                }
              }}
            >
              صفحة المتابعة التفصيلية
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {/* بطاقة تلخيصية للمؤشرات - من API */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 ملخص نشاط اليوم
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="bold">
                        {summary?.total_teachers || 0}
                      </Typography>
                      <Typography variant="body2">
                        إجمالي المعلمين
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="bold">
                        {summary?.active_teachers || 0}
                      </Typography>
                      <Typography variant="body2">
                        معلمين نشطين
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ p: 3, borderRadius: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ✅ مؤشرات الأداء
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="bold">
                        {Math.round(summary?.attendance_percentage || 0)}%
                      </Typography>
                      <Typography variant="body2">
                        نسبة التحضير
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h3" fontWeight="bold">
                        {Math.round(summary?.recitation_percentage || 0)}%
                      </Typography>
                      <Typography variant="body2">
                        نسبة التسميع
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* قائمة المعلمين من API */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    قائمة المعلمين السريعة ({teachersActivity.length} معلم)
                  </Typography>
                  <Grid container spacing={2}>
                    {teachersActivity.slice(0, 6).map((teacher) => (
                      <Grid item xs={12} sm={6} md={4} key={teacher.teacher_id}>
                        <Card 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 4
                            }
                          }}
                        >
                          <Box display="flex" alignItems="center" mb={1}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 32, height: 32 }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {teacher.teacher_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {teacher.circle?.name || 'لا توجد حلقة'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box display="flex" gap={1}>
                            <Chip 
                              size="small" 
                              label={teacher.daily_activity.activity_status}
                              color={teacher.daily_activity.has_activity ? "success" : "default"}
                              variant="outlined"
                            />
                            <Chip 
                              size="small" 
                              label={`${Math.round(teacher.daily_activity.attendance_percentage)}%`}
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box textAlign="center" mt={3}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/teacher-activity-dashboard')}
                      startIcon={<AssessmentIcon />}
                      size="large"
                    >
                      عرض التفاصيل الكاملة لجميع المعلمين
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SupervisorDashboard;
