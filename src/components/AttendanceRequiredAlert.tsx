import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Avatar,
  Fade,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface AttendanceRequiredAlertProps {
  open: boolean;
  onClose: () => void;
  onOpenAttendance: () => void;
  studentName: string;
}

const AttendanceRequiredAlert: React.FC<AttendanceRequiredAlertProps> = ({
  open,
  onClose,
  onOpenAttendance,
  studentName
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      {/* Header بخلفية ملونة */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* أيقونة الإغلاق */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* خلفية زخرفية */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        />

        <DialogTitle sx={{ pb: 2, pt: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mr: 2,
                width: 50,
                height: 50
              }}
            >
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                تنبيه التحضير
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                إجراء مطلوب قبل بدء التسميع
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            يرجى إدخال التحضير أولاً قبل بدء التسميع
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.primary" gutterBottom>
            عزيزي المعلم، لضمان متابعة دقيقة لحضور الطلاب،
          </Typography>
          <Typography variant="body1" color="text.primary" gutterBottom>
            يُرجى إدخال تحضير اليوم أولاً قبل البدء في التسميع للطالب
          </Typography>
          
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.dark',
              px: 2,
              py: 1,
              borderRadius: 2,
              mt: 1
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              {studentName}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            💡 <strong>لماذا التحضير مطلوب؟</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • يساعد في متابعة انتظام الطلاب<br/>
            • يوفر إحصائيات دقيقة للإدارة<br/>
            • يضمن عدالة التقييم بين الطلاب
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={onOpenAttendance}
          variant="contained"
          startIcon={<AssignmentIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
            }
          }}
        >
          فتح التحضير
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceRequiredAlert;
