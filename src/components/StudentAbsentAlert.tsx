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
  IconButton,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface StudentAbsentAlertProps {
  open: boolean;
  onClose: () => void;
  onOpenAttendance?: () => void;
  studentName: string;
  attendanceStatus: 'غائب' | 'مستأذن';
  onContinue?: () => void; // للحالة المستأذن
}

const StudentAbsentAlert: React.FC<StudentAbsentAlertProps> = ({
  open,
  onClose,
  onOpenAttendance,
  studentName,
  attendanceStatus,
  onContinue
}) => {
  const isAbsent = attendanceStatus === 'غائب';
  const isExcused = attendanceStatus === 'مستأذن';

  const getStatusConfig = () => {
    switch (attendanceStatus) {
      case 'غائب':
        return {
          color: '#f44336',
          bgColor: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          icon: <CancelIcon />,
          title: 'الطالب غائب',
          subtitle: 'لا يمكن بدء التسميع',
          severity: 'error' as const
        };
      case 'مستأذن':
        return {
          color: '#2196f3',
          bgColor: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          icon: <InfoIcon />,
          title: 'الطالب مستأذن',
          subtitle: 'هل تريد المتابعة؟',
          severity: 'info' as const
        };
      default:
        return {
          color: '#f44336',
          bgColor: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          icon: <CancelIcon />,
          title: 'تنبيه',
          subtitle: '',
          severity: 'error' as const
        };
    }
  };

  const config = getStatusConfig();
  const getMessage = () => {
    switch (attendanceStatus) {
      case 'غائب':
        return 'لا يمكن الدخول للتسميع. الطالب غائب اليوم.';
      case 'مستأذن':
        return 'الطالب مستأذن اليوم. هل تريد المتابعة للتسميع؟';
      default:
        return 'هناك مشكلة في حالة حضور الطالب.';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      {/* Header بخلفية ملونة */}
      <Box
        sx={{
          background: config.bgColor,
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
              {config.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                {config.title}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {config.subtitle}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Alert 
          severity={config.severity}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            {getMessage()}
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body1" color="text.primary" gutterBottom>
            الطالب:
          </Typography>
          
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: `${config.color}15`,
              color: config.color,
              px: 2,
              py: 1,
              borderRadius: 2,
              mb: 2
            }}
          >
            <Typography variant="body1" fontWeight="medium" sx={{ mr: 1 }}>
              {studentName}
            </Typography>
            <Chip
              label={attendanceStatus}
              size="small"
              sx={{
                bgcolor: config.color,
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>        {isAbsent && (
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
              💡 <strong>ماذا يمكنك فعله؟</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • تحديث حالة الحضور إذا وصل الطالب متأخراً
            </Typography>
          </Box>
        )}

        {isExcused && (
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
              ℹ️ <strong>معلومة:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              يمكنك المتابعة مع الطالب المستأذن إذا كان موجوداً حالياً.
              سيتم تسجيل حالة الحضور كما هي في النظام.
            </Typography>
          </Box>
        )}
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
          إغلاق
        </Button>
        
        {onOpenAttendance && (
          <Button
            onClick={onOpenAttendance}
            variant="outlined"
            startIcon={<AssignmentIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: config.color,
              color: config.color,
              '&:hover': {
                borderColor: config.color,
                bgcolor: `${config.color}10`
              }
            }}
          >
            تحديث التحضير
          </Button>
        )}        {isExcused && onContinue && (
          <Button
            onClick={onContinue}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              background: config.bgColor,
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            متابعة التسميع
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentAbsentAlert;
