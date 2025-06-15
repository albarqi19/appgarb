import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Divider,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MosqueIcon from '@mui/icons-material/Mosque';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';

// استيراد الخدمات والبيانات
import supervisorService, { SupervisorStudent, SupervisorTeacher, SupervisorCircle } from '../services/supervisorService';
import comprehensiveService, { ComprehensiveOverview, ComprehensiveMosque } from '../services/comprehensiveService';

// interface محسّن للطلاب مع بيانات المجموعة
interface EnhancedStudent {
  id: number;
  name: string;
  age?: number;
  total_score?: number;
  circle?: any;
  group?: any;
  groupTeacher?: any;
}

interface MosqueDetailsProps {}

const MosqueDetails: React.FC<MosqueDetailsProps> = () => {
  const { mosqueId } = useParams<{ mosqueId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const supervisorId = 1; // مؤقتاً

  // جلب بيانات المسجد باستخدام React Query
  const {
    data: comprehensiveOverview,
    isLoading: loading,
    error: comprehensiveError,
    isError: isComprehensiveError
  } = useQuery({
    queryKey: ['comprehensiveOverview', supervisorId],
    queryFn: () => comprehensiveService.getComprehensiveOverview(supervisorId),
  });

  // البحث عن المسجد المطلوب في البيانات الشاملة
  const targetMosque = comprehensiveOverview?.mosques.find(m => 
    m.mosque.id.toString() === mosqueId
  );

  // استخراج البيانات المطلوبة
  const comprehensiveData = targetMosque || null;
  const mosqueInfo = targetMosque?.mosque || null;
  const error = isComprehensiveError ? 'فشل في تحميل بيانات المسجد' : 
                !targetMosque && comprehensiveOverview ? 'لم يتم العثور على المسجد المطلوب' : null;
    // تجميع المعلمين من جميع الحلقات
  const mosqueTeachers = React.useMemo(() => {
    if (!targetMosque) return [];
    
    const allTeachers: any[] = [];
    targetMosque.circles.forEach(circle => {
      circle.teachers.forEach(teacher => {
        if (!allTeachers.find(t => t.id === teacher.id)) {
          allTeachers.push(teacher);
        }
      });
    });
    
    return allTeachers;
  }, [targetMosque]);
  
  // تجميع جميع الطلاب من الحلقات والمجموعات
  const mosqueStudents = React.useMemo(() => {
    if (!targetMosque) return [];
    
    const allStudents: EnhancedStudent[] = [];
    targetMosque.circles.forEach(circle => {
      circle.groups.forEach(group => {
        group.students.forEach(student => {
          if (!allStudents.find(s => s.id === student.id)) {
            allStudents.push({
              ...student,
              circle: circle,
              group: group,
              groupTeacher: group.teacher // إضافة معلم المجموعة بشكل منفصل
            });
          }
        });
      });
    });
    
    return allStudents;
  }, [targetMosque]);
  
  // استخدم الحلقات من البيانات الشاملة
  const mosqueCircles = React.useMemo(() => {
    return targetMosque?.circles || [];
  }, [targetMosque]);
  
  // تسجيل بعض البيانات للمراجعة
  React.useEffect(() => {
    if (targetMosque) {
      console.log('📊 عدد الحلقات:', targetMosque.circles.length);
      console.log('📊 عدد المعلمين:', mosqueTeachers.length);
      console.log('📊 إجمالي الطلاب:', mosqueStudents.length);
    }
  }, [targetMosque, mosqueTeachers.length, mosqueStudents.length]);  // حساب الإحصائيات من البيانات الشاملة كـ useMemo
  const stats = React.useMemo(() => {
    if (comprehensiveData) {
      return {
        totalStudents: comprehensiveData.mosque_summary.students_count,
        totalTeachers: comprehensiveData.mosque_summary.teachers_count,
        totalCircles: comprehensiveData.mosque_summary.circles_count,
        totalGroups: comprehensiveData.mosque_summary.groups_count,
        avgScore: 85 // قيمة افتراضية - يمكن حسابها من بيانات الطلاب الفعلية
      };
    }
    
    // البيانات الاحتياطية
    const totalStudents = mosqueStudents.length;
    const totalTeachers = mosqueTeachers.length;
    const totalCircles = mosqueCircles.length;
    const avgScore = mosqueStudents.length > 0 
      ? mosqueStudents.reduce((sum: number, s: any) => sum + (s.total_score || 0), 0) / mosqueStudents.length
      : 0;    return {
      totalStudents,
      totalTeachers,
      totalCircles,
      totalGroups: 0,
      avgScore: Math.round(avgScore)
    };
  }, [comprehensiveData, mosqueStudents, mosqueTeachers, mosqueCircles]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            جاري تحميل بيانات المسجد...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !mosqueInfo) {
    return (
      <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => navigate(-1)}>
              العودة
            </Button>
          }
        >
          {error || 'لم يتم العثور على بيانات المسجد'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: 8, pb: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* شريط التنقل */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            تفاصيل المسجد
          </Typography>
        </Box>

        {/* معلومات المسجد الأساسية */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 60, height: 60 }}>
              <MosqueIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {mosqueInfo.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body1">
                  {mosqueInfo.neighborhood}
                </Typography>
              </Box>
            </Box>
          </Box>          {/* الإحصائيات السريعة */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={2.4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  طالب
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalTeachers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  معلم
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalCircles}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  حلقة
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <GroupIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {stats.totalGroups || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  مجموعة فرعية
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={2.4}>
              <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {stats.avgScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  متوسط الدرجات
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>          {/* الحلقات والمجموعات */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                الحلقات والمجموعات ({comprehensiveData?.circles.length || 0})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {comprehensiveData?.circles.map((circle) => (
                <Card key={circle.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {circle.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          المجموعات: {circle.groups.length}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${circle.groups.reduce((sum, g) => sum + g.students.length, 0)} طالب`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    
                    {/* عرض المجموعات الفرعية */}
                    {circle.groups.map((group) => (
                      <Box key={group.id} sx={{ ml: 2, mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="medium">
                              {group.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {group.students.length} طالب
                          </Typography>
                        </Box>                        {group.teacher && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                            المعلم: {group.teacher.name}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )) || (
                <Alert severity="info">
                  لا توجد حلقات مسجلة لهذا المسجد
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* المعلمون */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                المعلمون ({mosqueTeachers.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {mosqueTeachers.map((teacher) => (
                <Card key={teacher.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                        {teacher.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {teacher.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            {teacher.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
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
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>

          {/* جدول الطلاب */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                طلاب المسجد ({mosqueStudents.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>اسم الطالب</TableCell>
                      <TableCell>الحلقة</TableCell>
                      <TableCell>المعلم</TableCell>
                      <TableCell>الدرجة</TableCell>
                      <TableCell>الإجراءات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mosqueStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                              {student.name?.charAt(0) || '؟'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {student.age} سنة
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>                        <TableCell>
                          <Typography variant="body2">
                            {student.circle?.name || 'غير محدد'}
                          </Typography>
                          {student.group && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              المجموعة: {student.group.name}
                            </Typography>
                          )}
                        </TableCell>                        <TableCell>
                          <Typography variant="body2">
                            {student.groupTeacher?.name || student.circle?.teacher?.name || 'غير محدد'}
                          </Typography>
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
                        </TableCell>
                        <TableCell>
                          <Tooltip title="عرض تفاصيل الطالب">
                            <IconButton 
                              size="small"
                              onClick={() => navigate(`/student-details/${student.id}`)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MosqueDetails;
