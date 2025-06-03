import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Stack,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MenuBook as MenuBookIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Psychology as PsychologyIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as NotificationsIcon,
  FamilyRestroom as FamilyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { students, Student } from '../data/students';
import { studentAnalytics, aiRecommendations } from '../data/ai-insights';
import ChildAnalytics from '../components/ChildAnalytics';
import ParentNotifications from '../components/ParentNotifications';

const ParentDashboard: React.FC = () => {
  console.log('ParentDashboard component loaded');
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);

  // بيانات الأطفال (في تطبيق حقيقي ستأتي من API بناءً على ولي الأمر المسجل دخولاً)
  const parentChildren = students.filter(student => 
    ['1', '2', '3'].includes(student.id) // مثال: أطفال ولي الأمر
  );

  React.useEffect(() => {
    if (parentChildren.length > 0 && !selectedChild) {
      setSelectedChild(parentChildren[0]);
    }
  }, [parentChildren, selectedChild]);

  // إحصائيات شاملة للأطفال
  const getOverallStats = () => {
    const totalStudents = parentChildren.length;
    const avgAttendance = Math.round(
      parentChildren.reduce((sum, child) => sum + child.attendanceRate, 0) / totalStudents
    );
    const avgScore = Math.round(
      parentChildren.reduce((sum, child) => sum + child.totalScore, 0) / totalStudents
    );
    const excellentChildren = parentChildren.filter(child => child.totalScore >= 90).length;

    return { totalStudents, avgAttendance, avgScore, excellentChildren };
  };

  const overallStats = getOverallStats();

  // بيانات الأداء للرسم البياني
  const getPerformanceData = () => {
    return parentChildren.map(child => ({
      name: child.name.split(' ')[0],
      الدرجة: child.totalScore,
      الحضور: child.attendanceRate,
      المحفوظ: child.memorization.length * 5 // تقدير كمية المحفوظ
    }));
  };

  // بيانات التقدم الشهري
  const getMonthlyProgressData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];
    return months.map(month => ({
      name: month,
      التقدم: Math.floor(Math.random() * 20) + 70
    }));
  };

  // الحصول على توصيات الذكاء الاصطناعي المخصصة للأطفال
  const getChildSpecificRecommendations = () => {
    return aiRecommendations.filter(rec => 
      rec.type === 'student' && parentChildren.some(child => 
        rec.description.includes(child.name.split(' ')[0])
      )
    );
  };

  // رمز اتجاه التقدم
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

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 8,
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
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 56, 
                  height: 56, 
                  mr: 2 
                }}
              >
                <FamilyIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  لوحة تحكم ولي الأمر
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  متابعة تقدم أطفالك في تحفيظ القرآن الكريم
                </Typography>
              </Box>
            </Box>
            
            {/* إحصائيات سريعة */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    {overallStats.totalStudents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    الأطفال
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    {overallStats.avgAttendance}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    متوسط الحضور
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    {overallStats.avgScore}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    متوسط الدرجات
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    {overallStats.excellentChildren}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    متميزون
                  </Typography>
                </Box>
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
            <Tab label="تفاصيل الأطفال" />
            <Tab label="توصيات الذكاء الاصطناعي" />            <Tab label="الإشعارات" />
          </Tabs>
        </Paper>

        {/* محتوى التبويبات */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* بطاقات الأطفال */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                أطفالي في التحفيظ
              </Typography>
              <Grid container spacing={2}>
                {parentChildren.map((child) => {
                  const analytics = studentAnalytics[child.id];
                  const isPresent = child.attendance[0]?.status === 'حاضر';
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={child.id}>
                      <Card 
                        sx={{ 
                          borderRadius: 3,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: selectedChild?.id === child.id ? 
                            '0 8px 20px rgba(30,111,142,0.3)' : 
                            '0 5px 15px rgba(0,0,0,0.05)',
                          border: selectedChild?.id === child.id ? 
                            `2px solid ${theme.palette.primary.main}` : 
                            '1px solid transparent',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={() => setSelectedChild(child)}
                      >
                        <Box 
                          sx={{ 
                            height: 8, 
                            bgcolor: isPresent ? 'success.main' : 'error.main' 
                          }} 
                        />
                        
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.main', 
                                width: 40, 
                                height: 40, 
                                mr: 1.5 
                              }}
                            >
                              {child.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {child.name.split(' ')[0]}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {child.age} سنة | {child.level}
                              </Typography>
                            </Box>
                            {getTrendIcon(child.id)}
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">الحضور</Typography>
                              <Typography variant="caption">{child.attendanceRate}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={child.attendanceRate} 
                              sx={{ height: 6, borderRadius: 3 }}
                              color={child.attendanceRate > 90 ? 'success' : 'warning'}
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption">الدرجة</Typography>
                              <Typography variant="caption">{child.totalScore}%</Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={child.totalScore} 
                              sx={{ height: 6, borderRadius: 3 }}
                              color={child.totalScore >= 90 ? 'success' : 'primary'}
                            />
                          </Box>

                          <Chip 
                            label={`${child.currentMemorization.surahName} (${child.currentMemorization.fromAyah}-${child.currentMemorization.toAyah})`}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                            color="primary"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>

            {/* الرسوم البيانية */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '350px' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  مقارنة أداء الأطفال
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={getPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <RechartsTooltip />
                    <Bar dataKey="الدرجة" fill="#1e6f8e" />
                    <Bar dataKey="الحضور" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '350px' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  التقدم الشهري
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={getMonthlyProgressData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="التقدم" 
                      stroke="#1e6f8e" 
                      fill={alpha('#1e6f8e', 0.3)} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        )}        {activeTab === 1 && selectedChild && (
          <ChildAnalytics child={selectedChild} />
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PsychologyIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    توصيات الذكاء الاصطناعي المخصصة لأطفالك
                  </Typography>
                </Box>
                
                {getChildSpecificRecommendations().length > 0 ? (
                  getChildSpecificRecommendations().map((recommendation) => (
                    <Alert 
                      key={recommendation.id}
                      severity="info" 
                      sx={{ mb: 2, borderRadius: 2 }}
                      icon={<LightbulbIcon />}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {recommendation.title}
                      </Typography>
                      <Typography variant="body2">
                        {recommendation.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`ثقة: ${recommendation.confidence}%`}
                          size="small"
                          color={recommendation.confidence >= 90 ? 'success' : 'primary'}
                          sx={{ mr: 1 }}
                        />
                        {recommendation.tags.map((tag, index) => (
                          <Chip 
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Alert>
                  ))
                ) : (
                  <Alert severity="info">
                    لا توجد توصيات مخصصة متاحة في الوقت الحالي. سيتم تحديث التوصيات بناءً على أداء أطفالك.
                  </Alert>
                )}

                {/* توصيات عامة مفيدة لأولياء الأمور */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }} fontWeight="bold">
                  نصائح عامة لولي الأمر
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        كيف تدعم طفلك في المنزل
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="خصص وقتاً يومياً للمراجعة مع طفلك" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="استمع لتلاوة طفلك وشجعه" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="اربط الحفظ بالفهم والتدبر" />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        علامات التقدم الإيجابي
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="انتظام في الحضور" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="تحسن في درجات التسميع" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="حماس الطفل للحفظ" />
                        </ListItem>
                      </List>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}        {activeTab === 3 && (
          <ParentNotifications />
        )}
      </Container>
    </Box>
  );
};

export default ParentDashboard;
