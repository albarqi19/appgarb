import React from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea, 
  Grid, 
  Box, 
  Paper,
  Avatar,
  Button,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mosques } from '../data/mosques';
import MosqueIcon from '@mui/icons-material/Mosque';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

const MosqueSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentMosque } = useAppContext();

  const handleMosqueSelection = (mosqueId: string) => {
    const selected = mosques.find(m => m.id === mosqueId);
    if (selected) {
      setCurrentMosque(selected);
      navigate('/students');
    }
  };
  return (    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 5, 
          borderRadius: 3, 
          background: 'linear-gradient(120deg, #e7f5fd 0%, #d1e8fb 50%, #c0e0fb 100%)',
          position: 'relative',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)',
          zIndex: 1
        }}
      >
        <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1, transform: 'rotate(10deg)' }}>
          <MosqueIcon sx={{ fontSize: 180 }} />
        </Box>
        <Typography 
          variant="h3" 
          gutterBottom 
          align="center" 
          fontWeight="bold" 
          color="primary.dark"
          sx={{ 
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            mb: 2
          }}
        >
          اختر المدرسة القرآنية
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary" 
          paragraph
          sx={{ 
            maxWidth: '600px',
            mx: 'auto', 
            fontSize: '1.1rem',
            fontWeight: 500
          }}
        >          اختر المدرسة القرآنية التي تريد إدارة طلابها ومتابعة تقدمهم في الحفظ والمراجعة
        </Typography>        {/* أزرار التنقل */}
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="center" 
          sx={{ 
            mt: 3,
            position: 'relative',
            zIndex: 10
          }}
        >          <Button
            variant="outlined"
            size="large"
            disabled={false}
            startIcon={<FamilyRestroomIcon />}            onClick={() => {
              navigate('/parent-dashboard');
            }}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              cursor: 'pointer',
              borderWidth: 2,
              fontWeight: 'bold',
              position: 'relative',
              zIndex: 11,
              pointerEvents: 'auto',
              userSelect: 'none',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }            }}>
            واجهة ولي الأمر
          </Button>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<MosqueIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            لوحة تحكم المعلم
          </Button>
        </Stack>
      </Paper>
      
      <Grid container spacing={4}>
        {mosques.map((mosque) => (
          <Grid item xs={12} sm={6} md={4} key={mosque.id}>
            <Card 
              elevation={4} 
              className="card-hover"
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                top: -100,
                left: -100,
                background: 'linear-gradient(45deg, rgba(30, 111, 142, 0.1), rgba(30, 111, 142, 0.05))'
              }} />
              
              <CardActionArea 
                onClick={() => handleMosqueSelection(mosque.id)}
                sx={{ flexGrow: 1, p: 2 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    mb: 2,
                    mt: 2,
                    position: 'relative'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      width: 90, 
                      height: 90,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '4px solid rgba(255,255,255,0.9)'
                    }}
                  >
                    <MosqueIcon sx={{ fontSize: 50 }} />
                  </Avatar>
                </Box>
                <CardContent>
                  <Typography variant="h5" component="h2" align="center" fontWeight="bold">
                    {mosque.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    {mosque.location}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mt: 2,
                      p: 1,
                      bgcolor: 'background.default',
                      borderRadius: 2
                    }}
                  >
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1" fontWeight="medium">
                      {mosque.studentsCount} طالب
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MosqueSelection;
