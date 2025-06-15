import React from 'react';
import {
  Box,
  Typography,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLoginClick = () => {
    navigate('/login');
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // صورة الخلفية على كامل الصفحة
        backgroundImage: 'url(/خلفية.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* طبقة شفافة خفيفة لتحسين وضوح النص */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha('#000', 0.3)
            : alpha('#000', 0.2),
          zIndex: 1
        }}
      />

      {/* زر تسجيل الدخول العلوي */}
      <Button
        variant="contained"
        startIcon={<LoginIcon />}
        onClick={handleLoginClick}
        sx={{
          position: 'absolute',
          top: 30,
          right: 30,
          zIndex: 3,
          borderRadius: 3,
          px: 4,
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
          }
        }}
      >
        تسجيل الدخول
      </Button>

      {/* المحتوى الرئيسي */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          px: 2
        }}
      >
        {/* الشعار */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4
          }}
        >
          <Box
            component="img"
            src="/logo512.png"
            alt="شعار منصة غرب"
            onError={(e) => {
              // في حالة عدم وجود الصورة، استخدم نص بديل
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentNode as HTMLElement;
              if (parent) {
                parent.innerHTML = `
                  <div style="
                    width: 120px; 
                    height: 120px; 
                    background: linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-size: 2rem; 
                    font-weight: bold;
                  ">
                    غرب
                  </div>
                `;
              }
            }}
            sx={{
              width: { xs: 100, md: 120 },
              height: { xs: 100, md: 120 },
              borderRadius: '50%',
            }}
          />
        </Box>

        {/* النص الرئيسي */}
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            color: 'white',
            mb: 2,
            textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
          }}
        >
          منصة غرب
        </Typography>

        {/* النص الثانوي */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            color: 'white',
            fontWeight: 500,
            fontSize: { xs: '1.5rem', md: '2rem' },
            mb: 4,
            lineHeight: 1.4,
            textShadow: '1px 1px 6px rgba(0,0,0,0.7)'
          }}
        >
          لإدارة حلقات القرآن الكريم
        </Typography>

        {/* نص وصفي إضافي */}
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: { xs: '1rem', md: '1.2rem' },
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6,
            textShadow: '1px 1px 4px rgba(0,0,0,0.6)'
          }}
        >
          منصة شاملة لإدارة ومتابعة طلاب حلقات تحفيظ القرآن الكريم
          <br />
          مع أدوات متقدمة للمعلمين والمشرفين وأولياء الأمور
        </Typography>
      </Box>

      {/* تذييل بسيط */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
          }}
        >
          © 2025 منصة غرب - جميع الحقوق محفوظة
        </Typography>
      </Box>
    </Box>
  );};

export default HomePage;
