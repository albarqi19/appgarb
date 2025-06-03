import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Card,
  CardContent, 
  CardHeader, 
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { students, Student, StudentAttendance } from '../data/students';
import { studentAnalytics } from '../data/ai-insights';
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

const StudentsList: React.FC = () => {
  const navigate = useNavigate();
  const { currentMosque, setSelectedStudent } = useAppContext();
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterLevel, setFilterLevel] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  
  // اذا كان المسجد غير محدد، ارجع للصفحة السابقة
  useEffect(() => {
    if (!currentMosque) {
      navigate('/');
    } else {
      // تصفية الطلاب حسب المسجد المختار
      setFilteredStudents(students.filter(s => s.mosqueId === currentMosque.id));
    }
  }, [currentMosque, navigate]);

  // تطبيق عوامل التصفية والبحث والترتيب
  useEffect(() => {
    if (!currentMosque) return;
    
    let result = students.filter(s => s.mosqueId === currentMosque.id);
    
    // تصفية حسب المستوى
    if (filterLevel !== 'all') {
      result = result.filter(s => s.level === filterLevel);
    }
    
    // تصفية حسب حالة الحضور
    if (activeTab === 1) { // الحضور
      result = result.filter(s => getAttendanceStatus(s) === 'حاضر');
    } else if (activeTab === 2) { // الغياب
      result = result.filter(s => getAttendanceStatus(s) !== 'حاضر');
    }
    
    // تصفية حسب البحث
    if (searchQuery.trim() !== '') {
      result = result.filter(s => s.name.includes(searchQuery.trim()));
    }
    
    // ترتيب النتائج
    result = sortStudents(result, sortBy);
    
    setFilteredStudents(result);
  }, [searchQuery, currentMosque, sortBy, filterLevel, activeTab]);

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
  };

  // تعامل مع اختيار الطالب للتسميع
  const handleStudentSelection = (student: Student) => {
    setSelectedStudent(student);
    navigate('/memorization-options');
  };

  // تعامل مع تغيير حالة الحضور
  const handleAttendanceToggle = (event: React.MouseEvent, studentId: string) => {
    event.stopPropagation();
    
    // نسخة من الطلاب المصفاة
    const updatedStudents = filteredStudents.map(student => {
      if (student.id === studentId) {
        // احصل على آخر حضور
        const lastAttendance = student.attendance[0];        // تحديث حالة الحضور (في حالة تطبيق حقيقي ستُرسل هذه البيانات إلى الخادم)
        const updatedAttendance = {
          ...lastAttendance,
          status: (lastAttendance.status === 'حاضر' ? 'غائب' : 'حاضر') as 'حاضر' | 'غائب'
        };
        
        return {
          ...student,
          attendance: [updatedAttendance, ...student.attendance.slice(1)]
        };
      }
      return student;
    });
    
    setFilteredStudents(updatedStudents);
  };

  // احصل على حالة الحضور الحالية للطالب
  const getAttendanceStatus = (student: Student) => {
    const lastAttendance = student.attendance[0];
    return lastAttendance ? lastAttendance.status : 'غائب';
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
  };

  // إحصائيات الطلاب
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const present = filteredStudents.filter(s => getAttendanceStatus(s) === 'حاضر').length;
    const absent = total - present;
    const excellentStudents = filteredStudents.filter(s => s.totalScore >= 90).length;
    
    return { total, present, absent, excellentStudents };
  }, [filteredStudents]);

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 10, 
        pb: 4,
        background: 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
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
            background: 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)',
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
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, mt: 0.5 }}>
                إدارة شؤون الطلاب والتسميع
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* إحصائيات وفلاتر */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* إحصائيات */}
          <Grid item xs={12} sm={6} md={9}>
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
                <Typography variant="body2" color="text.secondary">الحضور</Typography>
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
                <Typography variant="body2" color="text.secondary">الغياب</Typography>
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
          </Grid>

          {/* بحث */}
          <Grid item xs={12} sm={6} md={3}>
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
              <Grid item xs={12} md={6}>
                <Tabs 
                  value={activeTab} 
                  onChange={(_, newValue) => setActiveTab(newValue)}
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
        </Box>

        {/* قائمة الطلاب */}
        <Grid container spacing={3}>
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => {
              const isPresent = getAttendanceStatus(student) === 'حاضر';
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
                        bgcolor: isPresent ? 'success.main' : 'error.main',
                        position: 'absolute',
                        top: 0,
                        zIndex: 1
                      }}
                    />
                    
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 25, 
                        right: 10, 
                        zIndex: 1 
                      }}
                    >
                      <IconButton 
                        onClick={(e) => handleAttendanceToggle(e, student.id)}
                        color={isPresent ? "success" : "error"}
                        size="small"
                        sx={{ 
                          bgcolor: 'background.paper', 
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      >
                        {isPresent ? <CheckCircleIcon /> : <CancelIcon />}
                      </IconButton>
                    </Box>

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
                          {student.name.charAt(0)}
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
            })
          ) : (
            <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                لا يوجد طلاب بالمعايير المحددة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                جرب تغيير معايير البحث أو الفلترة
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery('');
                  setFilterLevel('all');
                  setActiveTab(0);
                }}
              >
                عرض جميع الطلاب
              </Button>
            </Box>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentsList;
