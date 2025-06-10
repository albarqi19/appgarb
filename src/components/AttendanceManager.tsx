import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Student } from '../data/students';
import { AttendanceStatus, recordBulkAttendanceWithUpdate } from '../services/attendanceService';

interface AttendanceManagerProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  teacherId: string;
  onSuccess?: () => void;
}

interface StudentAttendanceState {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  open,
  onClose,
  students,
  teacherId,
  onSuccess
}) => {
  const theme = useTheme();
  const [attendanceStates, setAttendanceStates] = useState<StudentAttendanceState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // تهيئة حالات الحضور للطلاب
  useEffect(() => {
    if (students.length > 0) {
      const initialStates = students.map(student => ({
        studentId: student.id,
        status: student.attendance[0]?.status || 'حاضر' as AttendanceStatus,
        notes: ''
      }));
      setAttendanceStates(initialStates);
    }
  }, [students]);

  // إعادة تعيين الحالة عند إغلاق النافذة
  useEffect(() => {
    if (!open) {
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  }, [open]);

  // تغيير حالة حضور طالب
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceStates(prev => 
      prev.map(state => 
        state.studentId === studentId 
          ? { ...state, status }
          : state
      )
    );
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'حاضر': return 'success';
      case 'غائب': return 'error';
      case 'متأخر': return 'warning';
      case 'مستأذن': return 'info';
      default: return 'default';
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'حاضر': return <CheckCircleIcon />;
      case 'غائب': return <CancelIcon />;
      case 'متأخر': return <ScheduleIcon />;
      case 'مستأذن': return <ExitToAppIcon />;
      default: return <PersonIcon />;
    }
  };  // إرسال التحضير
  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // تحضير البيانات للإرسال
      const studentsToSubmit = attendanceStates.map(state => {
        const student = students.find(s => s.id === state.studentId);
        return {
          name: student?.name || `طالب ${state.studentId}`,
          status: state.status,
          notes: state.notes || ''
        };
      });

      console.log('البيانات المُجهزة للإرسال:', studentsToSubmit);

      // استخدام النظام الجديد للتحديث الذكي بدلاً من الإضافة المكررة
      const result = await recordBulkAttendanceWithUpdate(studentsToSubmit, 'العصر');
      
      if (result.success) {
        setSubmitSuccess(true);
        
        // استدعاء onSuccess فوراً لتحديث البيانات
        onSuccess?.();
        
        // إغلاق النافذة بعد تأخير قصير لإظهار رسالة النجاح
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        const failedCount = result.results.filter(r => !r.success).length;
        setSubmitError(`فشل في إرسال ${failedCount} من ${result.results.length} طالب. حاول مرة أخرى.`);
      }
    } catch (error) {
      console.error('خطأ في إرسال التحضير:', error);
      setSubmitError('حدث خطأ أثناء إرسال التحضير.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // حساب إحصائيات الحضور
  const getAttendanceStats = () => {
    const stats = {
      حاضر: 0,
      غائب: 0,
      متأخر: 0,
      مستأذن: 0
    };

    attendanceStates.forEach(state => {
      stats[state.status]++;
    });

    return stats;
  };

  const stats = getAttendanceStats();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)',
          color: 'white',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              تحضير الطلاب
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            تم إرسال التحضير بنجاح! ✅
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        {/* إحصائيات سريعة */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            ملخص الحضور
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* قائمة الطلاب */}
        <Grid container spacing={2}>
          {students.map((student, index) => {
            const currentState = attendanceStates.find(state => state.studentId === student.id);
            const currentStatus = currentState?.status || 'حاضر';

            return (
              <Grid item xs={12} key={student.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* معلومات الطالب */}
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            mr: 2,
                            width: 45,
                            height: 45
                          }}
                        >
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {student.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            المستوى: {student.level}
                          </Typography>
                        </Box>
                      </Box>

                      {/* أزرار حالة الحضور */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(['حاضر', 'غائب', 'متأخر', 'مستأذن'] as AttendanceStatus[]).map(status => (
                          <Tooltip key={status} title={status}>
                            <IconButton
                              onClick={() => handleStatusChange(student.id, status)}
                              color={currentStatus === status ? getStatusColor(status) : 'default'}
                              sx={{
                                border: currentStatus === status ? 2 : 1,
                                borderColor: currentStatus === status 
                                  ? `${getStatusColor(status)}.main` 
                                  : 'divider',
                                bgcolor: currentStatus === status 
                                  ? `${getStatusColor(status)}.light`
                                  : 'background.default',
                                '&:hover': {
                                  bgcolor: `${getStatusColor(status)}.light`,
                                  borderColor: `${getStatusColor(status)}.main`
                                }
                              }}
                            >
                              {getStatusIcon(status)}
                            </IconButton>
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>

                    {/* عرض الحالة المختارة */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Chip
                        icon={getStatusIcon(currentStatus)}
                        label={currentStatus}
                        color={getStatusColor(currentStatus)}
                        variant="filled"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button
          onClick={handleSubmitAttendance}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ borderRadius: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التحضير'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceManager;
