import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Fade,
  useTheme,
  Divider,
  alpha
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface WorkingHoursAlertProps {
  // يمكن إضافة props إضافية لاحقاً إذا احتجنا للتحكم في التنبيه من الخارج
}

const WorkingHoursAlert: React.FC<WorkingHoursAlertProps> = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  // فحص ما إذا كان اليوم الحالي هو الجمعة أو السبت (خارج وقت الدوام)
  const checkWorkingHours = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = الأحد، 1 = الإثنين، ... 5 = الجمعة، 6 = السبت
    
    // في التقويم الغربي: الجمعة = 5، السبت = 6
    // في التقويم العربي: الجمعة والسبت هما عطلة نهاية الأسبوع
    return dayOfWeek === 5 || dayOfWeek === 6; // الجمعة والسبت
  };

  // التحقق من أن التنبيه لم يتم إخفاؤه مسبقاً في هذا اليوم
  const shouldShowAlert = () => {
    const today = new Date().toDateString();
    const lastDismissed = localStorage.getItem('workingHoursAlertDismissed');
    return lastDismissed !== today;
  };
  // التحقق من وقت الدوام عند تحميل المكون
  useEffect(() => {
    const isOutsideWorkingHours = checkWorkingHours();
    const shouldShow = shouldShowAlert();
    
    if (isOutsideWorkingHours && shouldShow) {
      // تأخير قليل لإظهار التنبيه بعد تحميل الصفحة
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  // إغلاق التنبيه والاستمرار
  const handleContinue = () => {
    setOpen(false);
    // حفظ تاريخ إخفاء التنبيه لعدم إظهاره مرة أخرى في نفس اليوم
    const today = new Date().toDateString();
    localStorage.setItem('workingHoursAlertDismissed', today);
  };

  // الحصول على اسم اليوم الحالي باللغة العربية
  const getCurrentDayName = () => {
    const days = [
      'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 
      'الخميس', 'الجمعة', 'السبت'
    ];
    const today = new Date();
    return days[today.getDay()];
  };

  return (
    <Dialog
      open={open}
      onClose={handleContinue}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)'
            : 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
        }
      }}
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 500
      }}
    >
      <DialogTitle 
        sx={{ 
          textAlign: 'center',
          pb: 1,
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
            : 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
          color: 'white',
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold">
            تنبيه وقت الدوام
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>        <Box sx={{ mb: 3 }}>
          <Box 
            sx={{ 
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <AccessTimeIcon 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.warning.main
              }} 
            />
          </Box>
        </Box>

        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%',
              textAlign: 'center'
            }
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            أنت الآن خارج وقت الدوام
          </Typography>
          <Typography variant="body2">
            اليوم هو {getCurrentDayName()} - يوم عطلة
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            ساعات الدوام الاعتيادية:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            الأحد - الخميس
          </Typography>
          <Typography variant="body2" color="text.secondary">
            (الجمعة والسبت عطلة نهاية الأسبوع)
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary">
          يمكنك الاستمرار في استخدام المنصة بشكل طبيعي
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleContinue}
          variant="contained"
          fullWidth
          size="large"
          sx={{
            borderRadius: 2,
            py: 1.5,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'
              : 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
            '&:hover': {
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
                : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            }
          }}
        >
          الاستمرار
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkingHoursAlert;
