import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Tooltip
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Student } from '../data/students';
import { studentAnalytics } from '../data/ai-insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

interface StudentStatsProps {
  student: Student;
}

const StudentStats: React.FC<StudentStatsProps> = ({ student }) => {
  // بيانات لرسم بياني دائري لأنواع الأخطاء
  const getErrorTypesData = () => {
    const errorCounts = { 'حفظ': 0, 'تجويد': 0, 'نطق': 0 };
    
    // حساب عدد الأخطاء لكل نوع من جميع جلسات الطالب
    student.memorization.forEach(session => {
      session.errors.forEach(error => {
        errorCounts[error.type] += 1;
      });
    });
    
    return [
      { name: 'أخطاء الحفظ', value: errorCounts['حفظ'], color: '#f44336' },
      { name: 'أخطاء التجويد', value: errorCounts['تجويد'], color: '#ff9800' },
      { name: 'أخطاء النطق', value: errorCounts['نطق'], color: '#2196f3' }
    ];
  };

  // بيانات لرسم بياني شريطي للدرجات
  const getScoresData = () => {
    return student.memorization.map(session => ({
      name: `جلسة ${session.date.slice(-5)}`,
      درجة: session.score,
    })).slice(-5); // آخر 5 جلسات
  };

  // بيانات تحليل الذكاء الاصطناعي للطالب
  const analytics = studentAnalytics[student.id];

  const getProgressIcon = () => {
    if (!analytics) return <TrendingFlatIcon color="info" />;
    
    switch(analytics.progress.trend) {
      case 'up': 
        return <TrendingUpIcon color="success" fontSize="large" />;
      case 'down':
        return <TrendingDownIcon color="error" fontSize="large" />;
      default:
        return <TrendingFlatIcon color="info" fontSize="large" />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        إحصائيات الطالب
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* معلومات عامة */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid component="div" xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                نسبة الحضور
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={student.attendanceRate} 
                    color={student.attendanceRate > 90 ? "success" : student.attendanceRate > 75 ? "info" : "warning"}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {student.attendanceRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                معدل الأداء العام
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Tooltip title={`الدرجة الكلية: ${student.totalScore}%`}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={student.totalScore} 
                      color={student.totalScore >= 90 ? "success" : student.totalScore >= 75 ? "primary" : "warning"}
                      size={60}
                      thickness={4}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary">
                        {`${Math.round(student.totalScore)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                اتجاه التقدم
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1, height: 60 }}>
                {getProgressIcon()}
                {analytics && (
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {analytics.progress.lastMonth > 0 
                      ? `+${analytics.progress.lastMonth}%` 
                      : `${analytics.progress.lastMonth}%`}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* الرسوم البيانية */}
      <Grid container spacing={3}>
        <Grid component="div" xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            توزيع أنواع الأخطاء
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={getErrorTypesData()}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {getErrorTypesData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Grid>

        <Grid component="div" xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            تطور الدرجات (آخر 5 جلسات)
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getScoresData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip />
              <Bar dataKey="درجة" fill="#3f51b5" />
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>

      {/* تحليل الذكاء الاصطناعي */}
      {analytics && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            تحليل الذكاء الاصطناعي
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid component="div" xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', bgcolor: 'success.light', p: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    نقاط القوة:
                  </Typography>
                  <ul>
                    {analytics.strengths.map((strength, index) => (
                      <li key={index}>
                        <Typography variant="body2">{strength}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid component="div" xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%', bgcolor: 'warning.light', p: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                    نقاط الضعف:
                  </Typography>
                  <ul>
                    {analytics.weaknesses.map((weakness, index) => (
                      <li key={index}>
                        <Typography variant="body2">{weakness}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              توصيات للتطوير:
            </Typography>
            <ul>
              {analytics.recommendedFocus.map((rec, index) => (
                <li key={index}>
                  <Typography variant="body2">{rec}</Typography>
                </li>
              ))}
            </ul>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              التنبؤات:
            </Typography>
            <Typography variant="body2">
              معدل التقدم المتوقع: {analytics.predictions.expectedProgressRate}%
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default StudentStats;
