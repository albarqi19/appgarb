import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UpdateIcon from '@mui/icons-material/Update';
import MessageIcon from '@mui/icons-material/Message';
import BarChartIcon from '@mui/icons-material/BarChart';
import SendIcon from '@mui/icons-material/Send';
import PaidIcon from '@mui/icons-material/Paid';
import CampaignIcon from '@mui/icons-material/Campaign';

const ComingSoon: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || '';

  // تحديد معلومات الصفحة بناءً على المسار
  const getPageInfo = (pagePath: string) => {
    switch (pagePath) {
      case '/messages':        return {
          title: 'الرسائل',
          icon: <MessageIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
          description: 'يمكنك من هذه الصفحة مشاهدة الرسائل المرسلة إلى أولياء الأمور وكذلك مشاهدة الاستفسارات الخاصة بأولياء الأمور والرد عليها بسهولة ويسر.',          features: [
            'مشاهدة الرسائل المرسلة إلى أولياء الأمور',
            'الرد على استفسارات أولياء الأمور',
            'تتبع حالة الرسائل المرسلة'
          ]
        };
      case '/statistics':
        return {
          title: 'الإحصائيات',
          icon: <BarChartIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
          description: 'يمكنك مشاهدة إحصائيات شاملة حول الحضور للطلاب وجلسات التسميع وعدد دقائق مدة التسميع وتقدم الطلاب وغيرها من الإحصائيات المفيدة.',
          features: [
            'إحصائيات الحضور والغياب',
            'تقارير جلسات التسميع',
            'متابعة تقدم الطلاب'
          ]
        };case '/requests':
        return {
          title: 'الطلبات',
          icon: <SendIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
          description: 'يمكنك من خلال هذه الصفحة إرسال طلبات النقل إلى حلقة أخرى أو تصحيح البيانات أو الاستفسار أو التسجيل في حلقات جديدة.',          features: [
            'طلبات النقل بين الحلقات',
            'طلبات الإجازة',
            'طلبات تصحيح البيانات',
            'الاستفسارات العامة'
          ]
        };
      case '/rewards':
        return {
          title: 'المكافآت',
          icon: <PaidIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
          description: 'من هذه الصفحة يمكنك مشاهدة سجل المكافآت الخاص بك ومتابعة الإضافات والحوافز المقدمة للمعلمين المتميزين.',
          features: [
            'سجل المكافآت الشهرية',
            'نظام النقاط والحوافز',
            'شهادات التقدير'
          ]
        };
      case '/announcements':        return {
          title: 'الإعلانات',
          icon: <CampaignIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
          description: 'من هذه الصفحة يمكنك مشاهدة الإعلانات الخاصة بالمدرسة القرآنية أو إدارة الفرع أو إدارة المنصة والبقاء على اطلاع بآخر الأخبار.',
          features: [
            'إعلانات المدرسة القرآنية',
            'أخبار إدارة الفرع',
            'تحديثات المنصة'
          ]
        };
      default:
        return {
          title: 'صفحة جديدة',
          icon: <UpdateIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
          description: 'سيتم تفعيل هذه الصفحة قريباً إن شاء الله.',
          features: []
        };
    }
  };

  const pageInfo = getPageInfo(page);

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 8,
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="md">
        {/* زر العودة */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            العودة
          </Button>
        </Box>

        {/* البطاقة الرئيسية */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {/* الرأس */}
          <Box
            sx={{
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)'
                : 'linear-gradient(135deg, #4a9fbe 0%, #1e6f8e 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >            {/* رمز دوار للتحديث */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative' }}>
                {pageInfo.icon}
                <CircularProgress
                  size={70}
                  thickness={2}
                  sx={{
                    position: 'absolute',
                    top: -11,
                    left: -11,
                    color: 'rgba(255,255,255,0.3)',
                    animationDuration: '3s'
                  }}
                />
              </Box>
            </Box>

            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {pageInfo.title}
            </Typography>
            
            <Chip
              icon={<UpdateIcon />}
              label="قريباً إن شاء الله"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                px: 2,
                py: 0.5
              }}
            />
          </Box>          {/* المحتوى */}
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 2, lineHeight: 1.6, textAlign: 'center' }}
            >
              {pageInfo.description}
            </Typography>

            {pageInfo.features.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main" sx={{ mb: 2 }}>
                  الميزات المتوقعة:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pageInfo.features.map((feature, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          mr: 2,
                          flexShrink: 0
                        }}
                      />
                      <Typography variant="body2">
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}            {/* رسالة تشجيعية */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'light' ? 'success.light' : 'success.dark',
                color: theme.palette.mode === 'light' ? 'success.dark' : 'success.light',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'success.main'
              }}
            >              <Typography variant="body2" fontWeight="medium">
                🚀 جاري العمل على إطلاق هذه الصفحة قريباً بإذن الله
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default ComingSoon;
