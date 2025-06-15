// نسخة محسّنة من صفحة قائمة الطلاب باستخدام النظام الذكي

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Tooltip,
  IconButton,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  FlashOn as FlashOnIcon,
  CloudDownload as CloudDownloadIcon,
  Refresh as RefreshIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Student } from '../data/students';
import {
  useSmartStudents,
  useActionTracker,
  useIntelligentPreload,
  usePerformanceMonitor,
  useSmartStats
} from '../hooks/useSmartData';

interface SmartStudentsListProps {
  enableIntelligentOptimization?: boolean;
}

const SmartStudentsList: React.FC<SmartStudentsListProps> = ({
  enableIntelligentOptimization = true
}) => {
  const navigate = useNavigate();  const { user, currentMosque } = useAppContext();
  const teacherId = user?.id;
  const mosqueId = currentMosque?.id || user?.mosques?.[0];

  // النظام الذكي
  const { trackAction } = useActionTracker(teacherId || '');
  const { 
    predictions, 
    isPreloading, 
    startPreloading 
  } = useIntelligentPreload(teacherId || '');
  const { 
    cacheStats, 
    loadingStats, 
    networkInfo 
  } = usePerformanceMonitor();

  // البيانات الذكية
  const {
    data: students,
    loading: studentsLoading,
    error: studentsError,
    fromCache: studentsFromCache,
    reload: reloadStudents
  } = useSmartStudents(teacherId || '', mosqueId || '');

  const {
    data: stats,
    loading: statsLoading,
    fromCache: statsFromCache
  } = useSmartStats(teacherId || '');

  // الحالات المحلية
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [smartInsights, setSmartInsights] = useState<any[]>([]);

  // تسجيل الإجراءات للتعلم الذكي
  useEffect(() => {
    if (enableIntelligentOptimization && teacherId) {
      trackAction('view_students_list', {
        studentsCount: students?.length || 0,
        fromCache: studentsFromCache,
        searchActive: searchTerm.length > 0
      });
    }
  }, [students, studentsFromCache, searchTerm]);

  // بدء التحميل المسبق
  useEffect(() => {
    if (enableIntelligentOptimization && teacherId && !isPreloading) {
      const timer = setTimeout(() => {
        startPreloading();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [teacherId, enableIntelligentOptimization]);

  // تحديث الرؤى الذكية
  useEffect(() => {
    if (predictions.length > 0) {
      const insights = predictions.map(prediction => ({
        type: prediction.action,
        confidence: prediction.confidence,
        suggestion: getSuggestionText(prediction.action),
        action: () => handlePredictionAction(prediction.action)
      }));
      setSmartInsights(insights);
    }
  }, [predictions]);
  // الطلاب المفلترون
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    if (!searchTerm) return students;
    
    return students.filter((student: Student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // وظائف التفاعل
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (enableIntelligentOptimization) {
      trackAction('search_students', { 
        term: value,
        resultsCount: filteredStudents.length 
      });
    }
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
    
    if (enableIntelligentOptimization) {
      trackAction('view_student_details', { 
        studentId: student.id,
        studentName: student.name 
      });
    }
  };

  const handleAttendanceClick = (studentId: string) => {
    navigate(`/attendance/${studentId}`);
    
    if (enableIntelligentOptimization) {
      trackAction('navigate_to_attendance', { studentId });
    }
  };

  const handleMemorizationClick = (studentId: string) => {
    navigate(`/memorization/${studentId}`);
    
    if (enableIntelligentOptimization) {
      trackAction('navigate_to_memorization', { studentId });
    }
  };

  const handleAddStudent = () => {
    navigate('/add-student');
    
    if (enableIntelligentOptimization) {
      trackAction('navigate_to_add_student');
    }
  };

  // وظائف الرؤى الذكية
  const getSuggestionText = (action: string): string => {
    const suggestions = {
      'view_attendance': 'يُنصح بمراجعة سجل الحضور',
      'view_memorization': 'وقت مراجعة التسميع',
      'add_student': 'قم بإضافة طالب جديد',
      'view_stats': 'اطلع على الإحصائيات'
    };
    
    return suggestions[action as keyof typeof suggestions] || 'إجراء مقترح';
  };

  const handlePredictionAction = (action: string) => {
    switch (action) {
      case 'view_attendance':
        navigate('/attendance');
        break;
      case 'view_memorization':
        navigate('/memorization');
        break;
      case 'add_student':
        handleAddStudent();
        break;
      case 'view_stats':
        navigate('/stats');
        break;
    }
    
    if (enableIntelligentOptimization) {
      trackAction('follow_smart_suggestion', { action });
    }
  };

  // مؤشر الأداء الذكي
  const SmartPerformancePanel = () => {
    if (!enableIntelligentOptimization) return null;

    return (
      <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <SmartToyIcon />
            <Box flexGrow={1}>
              <Typography variant="subtitle2">
                النظام الذكي نشط
              </Typography>
              <Typography variant="caption">
                {studentsFromCache ? '⚡ تحميل فوري من التخزين المؤقت' : '📡 تحميل من الخادم'}
                {isPreloading && ' • 🔄 تحميل مسبق نشط'}
                {networkInfo && ` • الشبكة: ${networkInfo.effectiveType}`}
              </Typography>
            </Box>
            
            {loadingStats && (
              <Box textAlign="center">
                <Typography variant="caption" display="block">
                  استخدام البيانات
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(loadingStats.cacheHitRate || 0) * 100}
                  sx={{ width: 60, bgcolor: 'rgba(255,255,255,0.3)' }}
                />
                <Typography variant="caption">
                  {((loadingStats.cacheHitRate || 0) * 100).toFixed(0)}%
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // بطاقة الرؤى الذكية
  const SmartInsightsCard = () => {
    if (!enableIntelligentOptimization || smartInsights.length === 0) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🧠 اقتراحات ذكية
          </Typography>
          <Stack spacing={1}>
            {smartInsights.slice(0, 3).map((insight, index) => (
              <Alert
                key={index}
                severity="info"
                action={
                  <Button 
                    size="small" 
                    onClick={insight.action}
                    variant="outlined"
                  >
                    تطبيق
                  </Button>
                }
              >
                {insight.suggestion} (ثقة: {(insight.confidence * 100).toFixed(0)}%)
              </Alert>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (studentsLoading && !studentsFromCache) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
          <Box ml={2}>
            <Typography variant="h6">جارٍ تحميل قائمة الطلاب...</Typography>
            {enableIntelligentOptimization && (
              <Typography variant="body2" color="text.secondary">
                النظام الذكي يعمل على تحسين التحميل
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    );
  }

  if (studentsError) {
    return (
      <Container>
        <Alert 
          severity="error" 
          action={
            <Button onClick={reloadStudents} startIcon={<RefreshIcon />}>
              إعادة المحاولة
            </Button>
          }
        >
          خطأ في تحميل قائمة الطلاب: {studentsError}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* لوحة الأداء الذكي */}
      <SmartPerformancePanel />

      {/* الرؤى الذكية */}
      <SmartInsightsCard />

      {/* العنوان والإحصائيات */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            قائمة الطلاب
            {studentsFromCache && (
              <Chip 
                label="⚡ سريع" 
                size="small" 
                color="success" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {stats && !statsLoading && (
            <Typography variant="body1" color="text.secondary">
              إجمالي {stats.totalStudents} طالب • حاضر اليوم {stats.presentToday}
              {statsFromCache && <Chip label="محفوظ" size="small" sx={{ ml: 1 }} />}
            </Typography>
          )}
        </Box>
        
        <Stack direction="row" spacing={1}>
          {enableIntelligentOptimization && (
            <Tooltip title="بدء التحميل المسبق الذكي">
              <IconButton 
                onClick={startPreloading}
                disabled={isPreloading}
                color="primary"
              >
                {isPreloading ? <CircularProgress size={24} /> : <CloudDownloadIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate('/stats')}
          >
            الإحصائيات
          </Button>
        </Stack>
      </Box>

      {/* البحث */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="البحث عن طالب..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* قائمة الطلاب */}
      <Grid container spacing={2}>
        {filteredStudents.map((student: Student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[4]
                }
              }}
              onClick={() => handleStudentClick(student)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{student.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.id}
                    </Typography>
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={1} mb={2}>
                  <Chip 
                    label={`المستوى ${student.level || 1}`}
                    size="small"
                    color="primary"
                  />
                  <Chip 
                    label={student.attendanceRate ? `حضور ${student.attendanceRate}%` : 'جديد'}
                    size="small"
                    color={student.attendanceRate && student.attendanceRate > 80 ? 'success' : 'warning'}
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAttendanceClick(student.id);
                    }}
                  >
                    الحضور
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMemorizationClick(student.id);
                    }}
                  >
                    التسميع
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredStudents.length === 0 && (
        <Box textAlign="center" py={8}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            لا توجد نتائج
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchTerm ? 'لم يتم العثور على طلاب بهذا الاسم' : 'لا توجد طلاب مسجلون'}
          </Typography>
        </Box>
      )}

      {/* زر إضافة طالب */}
      <Fab
        color="primary"
        aria-label="add student"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddStudent}
      >
        <AddIcon />
      </Fab>

      {/* نافذة تفاصيل الطالب */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          تفاصيل الطالب
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <PersonIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h5">{selectedStudent.name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    الرقم التعريفي: {selectedStudent.id}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    المستوى
                  </Typography>
                  <Typography variant="h6">
                    {selectedStudent.level || 1}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    معدل الحضور
                  </Typography>
                  <Typography variant="h6">
                    {selectedStudent.attendanceRate || 0}%
                  </Typography>
                </Grid>                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    المستوى
                  </Typography>
                  <Typography variant="h6">
                    {selectedStudent.level || 'غير محدد'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    معدل الحضور
                  </Typography>
                  <Typography variant="h6">
                    {selectedStudent.attendanceRate || 0}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            إغلاق
          </Button>
          {selectedStudent && (
            <>
              <Button 
                onClick={() => {
                  handleAttendanceClick(selectedStudent.id);
                  setDialogOpen(false);
                }}
                variant="outlined"
              >
                الحضور
              </Button>
              <Button 
                onClick={() => {
                  handleMemorizationClick(selectedStudent.id);
                  setDialogOpen(false);
                }}
                variant="contained"
              >
                التسميع
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* معلومات التطوير */}
      {enableIntelligentOptimization && process.env.NODE_ENV === 'development' && (
        <Card sx={{ mt: 4, bgcolor: 'grey.100' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 معلومات النظام الذكي (للمطورين)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">حالة التخزين المؤقت</Typography>
                <Typography variant="body2">
                  الطلاب: {studentsFromCache ? '✅ محفوظ' : '❌ جديد'}
                </Typography>
                <Typography variant="body2">
                  الإحصائيات: {statsFromCache ? '✅ محفوظ' : '❌ جديد'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">التنبؤات</Typography>
                <Typography variant="body2">
                  عدد التنبؤات: {predictions.length}
                </Typography>
                <Typography variant="body2">
                  التحميل المسبق: {isPreloading ? '🔄 نشط' : '⏸️ متوقف'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle2">الشبكة</Typography>
                <Typography variant="body2">
                  النوع: {networkInfo?.effectiveType || 'غير معروف'}
                </Typography>
                <Typography variant="body2">
                  السرعة: {networkInfo?.downlink ? `${networkInfo.downlink} Mbps` : 'غير معروف'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SmartStudentsList;
