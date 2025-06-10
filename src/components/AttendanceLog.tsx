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
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ExitToApp as ExitToAppIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Student, StudentAttendance } from '../data/students';
import { getTodayAttendance } from '../services/attendanceService';
import { useAppContext } from '../context/AppContext';

interface AttendanceLogProps {
  students: Student[];
  title?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  maxDays?: number;
}

interface AttendanceRecord {
  date: string;
  studentName: string;
  studentId: string;
  status: 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن';
  time?: string;
  notes?: string;
}

const AttendanceLog: React.FC<AttendanceLogProps> = ({
  students,
  title = "سجل التحضير",
  showSearch = true,
  showFilter = true,
  maxDays = 30
}) => {
  const theme = useTheme();
  const { user, currentMosque } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<{[studentName: string]: 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن'}>({});
  const [loading, setLoading] = useState(true);

  // تحميل بيانات التحضير
  useEffect(() => {
  const loadAttendanceData = async () => {
      setLoading(true);      try {
        // جلب بيانات التحضير الحالية من API مع تطبيق فلترة المعلم والمسجد
        const todayData = await getTodayAttendance(user?.id, currentMosque?.id);
        setTodayAttendance(todayData);

        // إنشاء سجلات الحضور من بيانات الطلاب المحلية والـ API
        const records: AttendanceRecord[] = [];
        
        students.forEach(student => {
          // إضافة البيانات التاريخية من البيانات المحلية
          student.attendance.slice(0, maxDays).forEach(attendance => {
            records.push({
              date: attendance.date,
              studentName: student.name,
              studentId: student.id,
              status: attendance.status,
              time: attendance.time,
              notes: attendance.notes
            });
          });

          // إضافة بيانات اليوم الحالي من API إذا كانت متوفرة
          const todayStatus = todayData[student.name];
          if (todayStatus) {
            const today = new Date().toISOString().split('T')[0];
            // التحقق من عدم وجود سجل لليوم الحالي من البيانات المحلية
            const hasRecordForToday = student.attendance.some(att => att.date === today);
            if (!hasRecordForToday) {
              records.push({
                date: today,
                studentName: student.name,
                studentId: student.id,
                status: todayStatus,
                time: new Date().toTimeString().split(' ')[0],
                notes: 'تحضير حديث'
              });
            }
          }
        });

        // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
        records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAttendanceRecords(records);
      } catch (error) {
        console.error('خطأ في تحميل بيانات التحضير:', error);
      } finally {
        setLoading(false);
      }
    };    if (students.length > 0 && user && currentMosque) {
      loadAttendanceData();
    }
  }, [students, maxDays, user, currentMosque]);

  // تصفية السجلات
  const filteredRecords = useMemo(() => {
    let filtered = attendanceRecords;

    // تصفية حسب البحث
    if (searchQuery.trim()) {
      filtered = filtered.filter(record => 
        record.studentName.includes(searchQuery.trim())
      );
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // تصفية حسب التاريخ
    if (dateFilter !== 'all') {
      const today = new Date();
      const filterDate = new Date(today);
      
      switch (dateFilter) {
        case 'today':
          filterDate.setDate(today.getDate());
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
      }
      
      if (dateFilter === 'today') {
        const todayStr = today.toISOString().split('T')[0];
        filtered = filtered.filter(record => record.date === todayStr);
      } else {
        filtered = filtered.filter(record => 
          new Date(record.date) >= filterDate
        );
      }
    }

    return filtered;
  }, [attendanceRecords, searchQuery, statusFilter, dateFilter]);

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'حاضر': return 'success';
      case 'غائب': return 'error';
      case 'متأخر': return 'warning';
      case 'مستأذن': return 'info';
      default: return 'default';
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'حاضر': return <CheckCircleIcon fontSize="small" />;
      case 'غائب': return <CancelIcon fontSize="small" />;
      case 'متأخر': return <ScheduleIcon fontSize="small" />;
      case 'مستأذن': return <ExitToAppIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  // إحصائيات الحضور
  const getStats = () => {
    const stats = {
      حاضر: 0,
      غائب: 0,
      متأخر: 0,
      مستأذن: 0,
      total: filteredRecords.length
    };

    filteredRecords.forEach(record => {
      stats[record.status]++;
    });

    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* العنوان والإحصائيات */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          {title}
        </Typography>
        
        {/* إحصائيات سريعة */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
          <Chip 
            icon={<CheckCircleIcon />}
            label={`حاضر: ${stats.حاضر}`}
            color="success"
            variant="outlined"
          />
          <Chip 
            icon={<CancelIcon />}
            label={`غائب: ${stats.غائب}`}
            color="error"
            variant="outlined"
          />
          <Chip 
            icon={<ScheduleIcon />}
            label={`متأخر: ${stats.متأخر}`}
            color="warning"
            variant="outlined"
          />
          <Chip 
            icon={<ExitToAppIcon />}
            label={`مستأذن: ${stats.مستأذن}`}
            color="info"
            variant="outlined"
          />
          <Chip 
            label={`المجموع: ${stats.total}`}
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* أدوات البحث والتصفية */}
      {(showSearch || showFilter) && (
        <Card sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              {showSearch && (
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="البحث عن طالب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    size="small"
                  />
                </Grid>
              )}
              
              {showFilter && (
                <>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>حالة الحضور</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="حالة الحضور"
                      >
                        <MenuItem value="all">جميع الحالات</MenuItem>
                        <MenuItem value="حاضر">حاضر</MenuItem>
                        <MenuItem value="غائب">غائب</MenuItem>
                        <MenuItem value="متأخر">متأخر</MenuItem>
                        <MenuItem value="مستأذن">مستأذن</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>الفترة الزمنية</InputLabel>
                      <Select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        label="الفترة الزمنية"
                      >
                        <MenuItem value="all">جميع الأوقات</MenuItem>
                        <MenuItem value="today">اليوم</MenuItem>
                        <MenuItem value="week">الأسبوع الماضي</MenuItem>
                        <MenuItem value="month">الشهر الماضي</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* جدول السجلات */}
      {filteredRecords.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>التاريخ</TableCell>
                <TableCell>الطالب</TableCell>
                <TableCell align="center">الحالة</TableCell>
                <TableCell align="center">الوقت</TableCell>
                <TableCell>ملاحظات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow 
                  key={`${record.studentId}-${record.date}-${index}`}
                  sx={{ 
                    '&:hover': { bgcolor: 'grey.50' },
                    '&:nth-of-type(odd)': { bgcolor: 'background.default' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {new Date(record.date).toLocaleDateString('ar-SA')}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                        {record.studentName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium">
                        {record.studentName}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Chip
                      icon={getStatusIcon(record.status)}
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {record.time || '-'}
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
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body1">
            لا توجد سجلات حضور تطابق معايير البحث والتصفية المحددة.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default AttendanceLog;
