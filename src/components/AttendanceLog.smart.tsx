// نسخة محسّنة من AttendanceLog باستخدام النظام الذكي

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  useTheme,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  FlashOn as FlashOnIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';
import { Student, StudentAttendance } from '../data/students';
import { useAppContext } from '../context/AppContext';
import { AttendanceStatus } from '../services/attendanceService';
import { 
  useSmartAttendance, 
  useActionTracker, 
  useIntelligentPreload,
  usePerformanceMonitor 
} from '../hooks/useSmartData';

interface SmartAttendanceLogProps {
  students: Student[];
  title?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  maxDays?: number;
  enableIntelligentOptimization?: boolean; // تفعيل التحسين الذكي
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus; // استخدام النوع العربي
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  date: string;
}

const SmartAttendanceLog: React.FC<SmartAttendanceLogProps> = ({
  students,
  title = 'سجل الحضور والغياب',
  showSearch = true,
  showFilter = true,
  maxDays = 30,
  enableIntelligentOptimization = true
}) => {
  const theme = useTheme();  const { user, currentMosque } = useAppContext();
  const teacherId = user?.id;
  const mosqueId = currentMosque?.id || user?.mosques?.[0];

  // النظام الذكي
  const { trackAction } = useActionTracker(teacherId || '');
  const { startPreloading, isPreloading } = useIntelligentPreload(teacherId || '');
  const { cacheStats, networkInfo } = usePerformanceMonitor();

  // البيانات الذكية - استخدام التخزين المؤقت والتنبؤ
  const {
    data: attendanceData,
    loading: attendanceLoading,
    error: attendanceError,
    fromCache: attendanceFromCache,
    reload: reloadAttendance
  } = useSmartAttendance(teacherId || '', mosqueId || '');

  // الحالات المحلية
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // تسجيل الإجراءات للتعلم الذكي
  useEffect(() => {
    if (enableIntelligentOptimization && teacherId) {
      trackAction('view_attendance_log', {
        studentsCount: students.length,
        date: selectedDate,
        fromCache: attendanceFromCache
      });
    }
  }, [selectedDate, attendanceFromCache]);

  // بدء التحميل المسبق عند تحميل المكون
  useEffect(() => {
    if (enableIntelligentOptimization && teacherId && !isPreloading) {
      const timer = setTimeout(() => {
        startPreloading();
      }, 2000); // انتظار ثانيتين ثم بدء التحميل المسبق

      return () => clearTimeout(timer);
    }
  }, [teacherId, enableIntelligentOptimization]);
  // إعداد البيانات للعرض
  const attendanceRecords = useMemo(() => {
    if (!attendanceData) return [];
    
    // تحويل بيانات الحضور إلى السجلات
    return students.map(student => ({
      id: `${student.id}-${selectedDate}`,
      studentId: student.id,
      studentName: student.name,
      status: attendanceData[student.name] || 'absent',
      checkInTime: '', // هذه البيانات غير متوفرة حالياً في النظام
      checkOutTime: '', // هذه البيانات غير متوفرة حالياً في النظام
      notes: '', // هذه البيانات غير متوفرة حالياً في النظام
      date: selectedDate
    }));
  }, [attendanceData, students, selectedDate]);

  // البيانات المفلترة
  const filteredRecords = useMemo(() => {
    let filtered = attendanceRecords;

    // البحث بالاسم
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // الفلترة بالحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    return filtered;
  }, [attendanceRecords, searchTerm, statusFilter]);
  // إحصائيات سريعة
  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'حاضر').length;
    const absent = attendanceRecords.filter(r => r.status === 'غائب').length;
    const late = attendanceRecords.filter(r => r.status === 'متأخر').length;
    const excused = attendanceRecords.filter(r => r.status === 'مستأذن').length;

    return { total, present, absent, late, excused };
  }, [attendanceRecords]);

  // وظائف التفاعل
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    if (enableIntelligentOptimization) {
      trackAction('search_attendance', { term: event.target.value });
    }
  };

  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    if (enableIntelligentOptimization) {
      trackAction('filter_attendance', { status: event.target.value });
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    if (enableIntelligentOptimization) {
      trackAction('change_attendance_date', { date: event.target.value });
    }
  };
  // مكونات المساعدة
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'حاضر':
        return <CheckCircleIcon color="success" />;
      case 'متأخر':
        return <ScheduleIcon color="warning" />;
      case 'مستأذن':
        return <ExitToAppIcon color="info" />;
      default:
        return <CancelIcon color="error" />;
    }
  };

  const StatusChip = ({ status }: { status: string }) => {
    const colors = {
      'حاضر': 'success',
      'متأخر': 'warning',
      'مستأذن': 'info',
      'غائب': 'error'
    } as const;

    const labels = {
      'حاضر': 'حاضر',
      'متأخر': 'متأخر',
      'مستأذن': 'مستأذن',
      'غائب': 'غائب'
    };

    return (
      <Chip
        label={labels[status as keyof typeof labels] || 'غير محدد'}
        color={colors[status as keyof typeof colors] || 'default'}
        size="small"
        icon={<StatusIcon status={status} />}
      />
    );
  };

  // مؤشر الأداء الذكي
  const SmartPerformanceIndicator = () => {
    if (!enableIntelligentOptimization || !cacheStats) return null;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Tooltip title={`التحميل من التخزين المؤقت: ${attendanceFromCache ? 'نعم' : 'لا'}`}>
          <IconButton size="small">
            {attendanceFromCache ? (
              <Badge badgeContent="⚡" color="success">
                <FlashOnIcon color="success" fontSize="small" />
              </Badge>
            ) : (
              <CloudOffIcon color="action" fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        
        {networkInfo && (
          <Typography variant="caption" color="text.secondary">
            الشبكة: {networkInfo.effectiveType}
          </Typography>
        )}
        
        {isPreloading && (
          <Tooltip title="يتم التحميل المسبق للبيانات">
            <CircularProgress size={16} />
          </Tooltip>
        )}
      </Box>
    );
  };

  if (attendanceLoading && !attendanceFromCache) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          جارٍ تحميل بيانات الحضور...
        </Typography>
      </Box>
    );
  }

  if (attendanceError) {
    return (
      <Alert severity="error" action={
        <IconButton onClick={reloadAttendance} size="small">
          <SearchIcon />
        </IconButton>
      }>
        خطأ في تحميل بيانات الحضور: {attendanceError}
      </Alert>
    );
  }

  return (
    <Box>
      {/* مؤشر الأداء الذكي */}
      <SmartPerformanceIndicator />

      {/* عنوان وإحصائيات سريعة */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
            {attendanceFromCache && (
              <Chip
                label="⚡ سريع"
                size="small"
                color="success"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Grid>

        {/* بطاقات الإحصائيات */}
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                إجمالي الطلاب
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.present}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                حاضر
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.absent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                غائب
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                متأخر
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* أدوات البحث والفلترة */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* التاريخ */}
            <TextField
              label="التاريخ"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            {/* البحث */}
            {showSearch && (
              <TextField
                label="البحث بالاسم"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                size="small"
                sx={{ flexGrow: 1 }}
              />
            )}

            {/* فلتر الحالة */}
            {showFilter && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>الحالة</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="الحالة"
                >                  <MenuItem value="all">الكل</MenuItem>
                  <MenuItem value="حاضر">حاضر</MenuItem>
                  <MenuItem value="غائب">غائب</MenuItem>
                  <MenuItem value="متأخر">متأخر</MenuItem>
                  <MenuItem value="مستأذن">مستأذن</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* جدول الحضور */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>الطالب</TableCell>
              <TableCell align="center">الحالة</TableCell>
              <TableCell align="center">وقت الدخول</TableCell>
              <TableCell align="center">وقت الخروج</TableCell>
              <TableCell>ملاحظات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="body2">
                      {record.studentName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <StatusChip status={record.status} />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {record.checkInTime || '-'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {record.checkOutTime || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {record.notes || '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredRecords.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            لا توجد سجلات حضور متاحة
          </Typography>
        </Box>
      )}

      {/* معلومات التحسين الذكي للمطورين */}
      {enableIntelligentOptimization && process.env.NODE_ENV === 'development' && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="caption" component="div">
            📊 معلومات النظام الذكي:
          </Typography>
          <Typography variant="caption" component="div">
            • البيانات من التخزين المؤقت: {attendanceFromCache ? 'نعم ⚡' : 'لا 📡'}
          </Typography>
          <Typography variant="caption" component="div">
            • التحميل المسبق نشط: {isPreloading ? 'نعم 🔄' : 'لا ⏸️'}
          </Typography>
          {cacheStats && (
            <Typography variant="caption" component="div">
              • استخدام التخزين: {((cacheStats.usedSpace / cacheStats.totalSpace) * 100).toFixed(1)}%
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SmartAttendanceLog;
