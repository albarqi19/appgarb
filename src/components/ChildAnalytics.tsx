import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Psychology as PsychologyIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  InfoOutlined as InfoIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  MenuBook as BookIcon
} from '@mui/icons-material';
import { Student } from '../data/students';
import { studentAnalytics, AIStudentAnalysis } from '../data/ai-insights';

interface ChildAnalyticsProps {
  child: Student;
}

const ChildAnalytics: React.FC<ChildAnalyticsProps> = ({ child }) => {
  const theme = useTheme();
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const analytics = studentAnalytics[child.id];

  // بيانات الأداء في المجالات المختلفة
  const getSkillsRadarData = () => {
    if (!analytics) return [];
    
    return analytics.predictions.areas.map(area => ({
      skill: area.name,
      current: area.score,
      target: Math.min(100, area.score + 15) // هدف التحسن
    }));
  };

  // بيانات التقدم التاريخي
  const getProgressHistoryData = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'];
    return months.map((month, index) => ({
      month,
      score: Math.max(0, child.totalScore + (Math.random() - 0.5) * 20),
      attendance: Math.max(0, child.attendanceRate + (Math.random() - 0.5) * 15),
      sessions: Math.floor(Math.random() * 8) + 8
    }));
  };

  // بيانات أنواع الأخطاء
  const getErrorTypesData = () => {
    if (!child.memorization.length) return [];
    
    const errorTypes = { 'حفظ': 0, 'تجويد': 0, 'نطق': 0 };
    child.memorization.forEach(session => {
      session.errors.forEach(error => {
        errorTypes[error.type]++;
      });
    });

    return Object.entries(errorTypes).map(([type, count]) => ({
      name: type,
      value: count,
      color: type === 'حفظ' ? '#ff6b6b' : type === 'تجويد' ? '#4ecdc4' : '#45b7d1'
    }));
  };

  // الحصول على لون مؤشر التقدم
  const getProgressColor = (value: number) => {
    if (value >= 90) return 'success';
    if (value >= 75) return 'primary';
    if (value >= 60) return 'warning';
    return 'error';
  };

  // رمز اتجاه التقدم
  const getTrendIcon = () => {
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

  // حساب التقييم العام
  const getOverallRating = () => {
    const attendanceWeight = 0.3;
    const scoreWeight = 0.5;
    const progressWeight = 0.2;
    
    const progressScore = analytics ? Math.max(0, 50 + analytics.progress.lastMonth) : 50;
    
    return Math.round(
      child.attendanceRate * attendanceWeight +
      child.totalScore * scoreWeight +
      progressScore * progressWeight
    );
  };

  const overallRating = getOverallRating();

  return (
    <Box>
      {/* بطاقة التقييم العام */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: getProgressColor(overallRating) + '.main',
                  fontSize: '2rem'
                }}
              >
                {child.name.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {child.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                التقييم العام: {overallRating}%
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                {getTrendIcon()}
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {analytics ? (
                    analytics.progress.trend === 'up' ? 'تحسن' : 
                    analytics.progress.trend === 'down' ? 'تراجع' : 'مستقر'
                  ) : 'غير محدد'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {child.attendanceRate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    الحضور
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {child.totalScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    الدرجة
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {child.memorization.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    الجلسات
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {analytics?.predictions.expectedProgressRate || 'N/A'}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    التوقع
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* مخطط الرادار للمهارات */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              تحليل المهارات
            </Typography>
            {analytics && (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={getSkillsRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar 
                    name="الحالي" 
                    dataKey="current" 
                    stroke={theme.palette.primary.main} 
                    fill={alpha(theme.palette.primary.main, 0.3)} 
                  />
                  <Radar 
                    name="الهدف" 
                    dataKey="target" 
                    stroke={theme.palette.success.main} 
                    fill="transparent"
                    strokeDasharray="5 5"
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* التقدم التاريخي */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '400px' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              التقدم التاريخي
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={getProgressHistoryData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3} 
                  name="الدرجة"
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke={theme.palette.success.main} 
                  strokeWidth={3} 
                  name="الحضور"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* تحليل الأخطاء */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              تحليل أنواع الأخطاء
            </Typography>
            {getErrorTypesData().length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getErrorTypesData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getErrorTypesData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  لا توجد بيانات أخطاء متاحة
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* نقاط القوة والضعف */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              تحليل نقاط القوة والضعف
            </Typography>
            
            {analytics ? (
              <Box>
                <Typography variant="subtitle2" color="success.main" gutterBottom>
                  نقاط القوة:
                </Typography>
                <List dense>
                  {analytics.strengths.slice(0, 3).map((strength, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <StarIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={strength} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" color="warning.main" gutterBottom sx={{ mt: 2 }}>
                  نقاط التحسين:
                </Typography>
                <List dense>
                  {analytics.weaknesses.slice(0, 3).map((weakness, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <WarningIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={weakness} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Alert severity="info">
                لا توجد تحليلات متاحة لهذا الطالب حالياً
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* التوصيات المخصصة */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PsychologyIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                توصيات الذكاء الاصطناعي المخصصة
              </Typography>
            </Box>

            {analytics ? (
              <Grid container spacing={2}>
                {analytics.recommendedFocus.map((recommendation, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Alert 
                      severity="info" 
                      sx={{ borderRadius: 2 }}
                      icon={<LightbulbIcon />}
                    >
                      <Typography variant="body2">
                        {recommendation}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                سيتم توليد توصيات مخصصة بناءً على تقدم الطالب
              </Alert>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<AssessmentIcon />}
                onClick={() => setShowDetailDialog(true)}
              >
                عرض التقرير التفصيلي
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* حوار التقرير التفصيلي */}
      <Dialog 
        open={showDetailDialog} 
        onClose={() => setShowDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrophyIcon sx={{ mr: 1 }} color="primary" />
            التقرير التفصيلي - {child.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {analytics && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  التنبؤات المستقبلية
                </Typography>
                <Typography variant="body2" paragraph>
                  معدل التقدم المتوقع: {analytics.predictions.expectedProgressRate}%
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  توقعات الأداء في المجالات:
                </Typography>
                {analytics.predictions.areas.map((area, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{area.name}</Typography>
                      <Typography variant="body2">{area.score}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={area.score} 
                      color={getProgressColor(area.score)}
                    />
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  خطة التحسين المقترحة
                </Typography>
                <List>
                  {analytics.recommendedFocus.map((focus, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={focus} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailDialog(false)}>
            إغلاق
          </Button>
          <Button variant="contained" startIcon={<BookIcon />}>
            طباعة التقرير
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChildAnalytics;
