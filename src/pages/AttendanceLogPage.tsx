import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Student } from '../data/students';
import { useAppContext } from '../context/AppContext';
import { getTeacherMosqueStudents } from '../services/authService';
import AttendanceLog from '../components/AttendanceLog';

const AttendanceLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentMosque, user } = useAppContext();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تحميل بيانات الطلاب
  useEffect(() => {
    const loadStudents = async () => {
      if (!currentMosque || !user) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('جلب طلاب المعلم لسجل التحضير:', user.id);
        const apiStudents = await getTeacherMosqueStudents(user.id, currentMosque.id);
        
        // تحويل البيانات من API إلى تنسيق محلي
        const convertedStudents: Student[] = apiStudents.map((student: any) => ({
          id: student.id,
          name: student.name || 'غير محدد',
          age: student.age || 0,
          mosqueId: student.mosque_id || currentMosque.id,
          circleId: student.circleId || '',
          level: student.level || 'متوسط',
          attendanceRate: student.attendance_rate || 85,
          attendance: [{
            date: new Date().toISOString().split('T')[0],
            status: 'حاضر' as 'حاضر' | 'غائب'
          }],
          memorization: [],
          currentMemorization: {
            surahName: student.current_surah || 'البقرة',
            fromAyah: 1,
            toAyah: 1
          },
          totalScore: 80,
          phone: student.phone,
          parentPhone: student.parent_phone
        }));
        
        setStudents(convertedStudents);
      } catch (error) {
        console.error('خطأ في جلب طلاب المسجد:', error);
        setError('حدث خطأ في تحميل بيانات الطلاب');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [currentMosque, user, navigate]);

  // إعادة تحميل البيانات
  const handleRefresh = () => {
    if (user && currentMosque) {
      setStudents([]);
      setLoading(true);
      // إعادة تشغيل useEffect
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            جاري تحميل سجل التحضير...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            يتم جلب البيانات من الخادم
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 10, pb: 4 }}>
      <Container maxWidth="lg">
        {/* التنقل التدريجي */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            الرئيسية
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            سجل التحضير
          </Typography>
        </Breadcrumbs>

        {/* معلومات المسجد */}
        {currentMosque && (
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {currentMosque.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentMosque.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Typography variant="body2" color="text.secondary">
                      عدد الطلاب: {students.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      المعلم: {user?.name || 'غير محدد'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* سجل التحضير */}
        {students.length > 0 ? (
          <AttendanceLog 
            students={students}
            title="سجل حضور الطلاب"
            showSearch={true}
            showFilter={true}
            maxDays={60}
          />
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              لا توجد بيانات طلاب
            </Typography>
            <Typography variant="body1">
              لا توجد حلقات أو طلاب مُسندين إليك في هذا المسجد.
            </Typography>
          </Alert>
        )}

        {/* زر إعادة التحميل */}
        <Tooltip title="إعادة تحميل البيانات">
          <Fab
            color="secondary"
            aria-label="refresh"
            onClick={handleRefresh}
            sx={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <RefreshIcon />
          </Fab>
        </Tooltip>
      </Container>
    </Box>
  );
};

export default AttendanceLogPage;
