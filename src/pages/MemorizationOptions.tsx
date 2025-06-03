import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Box, 
  Paper,
  Avatar,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PersonIcon from '@mui/icons-material/Person';

const MemorizationOptions: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudent, setMemorizationMode } = useAppContext();

  // التأكد من وجود طالب محدد
  React.useEffect(() => {
    if (!selectedStudent) {
      navigate('/students');
    }
  }, [selectedStudent, navigate]);

  const handleOptionSelection = (mode: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى') => {
    setMemorizationMode(mode);
    navigate('/memorization-session');
  };

  if (!selectedStudent) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/students')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" flex="1">
          اختر نوع التسميع
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2, 
          background: 'linear-gradient(120deg, #e8f5e9 0%, #c8e6c9 100%)' 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {selectedStudent.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              المستوى: {selectedStudent.level}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            الحفظ الحالي:
          </Typography>
          <Chip 
            icon={<MenuBookIcon />} 
            label={`${selectedStudent.currentMemorization.surahName} (الآيات ${selectedStudent.currentMemorization.fromAyah}-${selectedStudent.currentMemorization.toAyah})`} 
            color="primary" 
            variant="filled" 
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              onClick={() => handleOptionSelection('حفظ')}
              sx={{ height: '100%', p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: 70,
                    height: 70
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent>
                <Typography variant="h5" component="h2" align="center" fontWeight="bold" gutterBottom>
                  حفظ
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  تسميع الحفظ الجديد من السورة المحددة
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              onClick={() => handleOptionSelection('مراجعة صغرى')}
              sx={{ height: '100%', p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'info.main',
                    width: 70,
                    height: 70
                  }}
                >
                  <AutoStoriesIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent>
                <Typography variant="h5" component="h2" align="center" fontWeight="bold" gutterBottom>
                  مراجعة صغرى
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  مراجعة الحفظ الأخير خلال الأسبوع الماضي
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardActionArea 
              onClick={() => handleOptionSelection('مراجعة كبرى')}
              sx={{ height: '100%', p: 2 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'success.main',
                    width: 70,
                    height: 70
                  }}
                >
                  <LocalLibraryIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
              <CardContent>
                <Typography variant="h5" component="h2" align="center" fontWeight="bold" gutterBottom>
                  مراجعة كبرى
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  مراجعة محفوظات سابقة من شهر أو أكثر
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MemorizationOptions;
