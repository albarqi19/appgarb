import React, { useState } from 'react';
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
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AttendanceRequiredAlert from '../components/AttendanceRequiredAlert';
import { hasAttendanceForToday } from '../services/attendanceService';

const MemorizationOptions: React.FC = () => {
  const navigate = useNavigate();  
  const { selectedStudent, setMemorizationMode, user, currentMosque } = useAppContext();
  const theme = useTheme();  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const [showCurriculumEditor, setShowCurriculumEditor] = useState(false);

  // التأكد من وجود طالب محدد
  React.useEffect(() => {
    if (!selectedStudent) {
      navigate('/students');
    }
  }, [selectedStudent, navigate]);
  const handleOptionSelection = async (mode: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى') => {
    try {
      // فحص وجود التحضير لليوم الحالي مع تطبيق فلترة المعلم والمسجد
      const hasAttendance = await hasAttendanceForToday(user?.id, currentMosque?.id);
      
      if (!hasAttendance) {
        // إظهار تنبيه التحضير
        setShowAttendanceAlert(true);
        return;
      }
      
      // إذا كان التحضير موجود، متابعة للتسميع
      setMemorizationMode(mode);
      navigate('/memorization-session');
    } catch (error) {
      console.error('خطأ في فحص التحضير:', error);
      // في حالة الخطأ، إظهار التنبيه للسلامة
      setShowAttendanceAlert(true);
    }  };

  const handleSaveCurriculum = (newCurriculum: { surahName: string; fromAyah: number; toAyah: number }) => {
    // هنا سيتم استدعاء API لحفظ المنهج الجديد
    // في الوقت الحالي سنقوم بتحديث البيانات محلياً
    console.log('حفظ المنهج الجديد:', newCurriculum);
    
    // تحديث بيانات الطالب (سيتم استبدال هذا بـ API call)
    if (selectedStudent) {
      selectedStudent.currentMemorization = newCurriculum;
    }
    
    // إغلاق محرر المنهج
    setShowCurriculumEditor(false);
  };

  const handleCloseAttendanceAlert = () => {
    setShowAttendanceAlert(false);
  };

  const handleOpenAttendance = () => {
    setShowAttendanceAlert(false);
    // العودة لصفحة الطلاب مع فتح نافذة التحضير
    navigate('/students', { state: { openAttendance: true } });
  };

  if (!selectedStudent) {
    return null;
  }
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 10, 
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="md">
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
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(120deg, #e8f5e9 0%, #c8e6c9 100%)'
              : 'linear-gradient(120deg, rgba(56,142,60,0.2) 0%, rgba(76,175,80,0.2) 100%)'
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
        
        <Divider sx={{ my: 2 }} />          <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" gutterBottom>
              الحفظ الحالي:
            </Typography>
            <IconButton 
              onClick={() => setShowCurriculumEditor(true)}
              size="small"
              sx={{ 
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.light', opacity: 0.1 }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
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
          </Card>        </Grid>
      </Grid>
        {/* إشعار التحضير المطلوب */}
      <AttendanceRequiredAlert
        open={showAttendanceAlert}
        onClose={handleCloseAttendanceAlert}
        onOpenAttendance={handleOpenAttendance}
        studentName={selectedStudent.name}
      />
      
      {/* مكون تعديل منهج الحفظ */}
      <CurriculumEditor
        open={showCurriculumEditor}
        onClose={() => setShowCurriculumEditor(false)}
        onSave={handleSaveCurriculum}
        currentCurriculum={selectedStudent.currentMemorization}
        studentName={selectedStudent.name}
      />
      </Container>
    </Box>
  );
};

// مكون تعديل منهج الحفظ
const CurriculumEditor: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (curriculum: { surahName: string; fromAyah: number; toAyah: number }) => void;
  currentCurriculum: { surahName: string; fromAyah: number; toAyah: number };
  studentName: string;
}> = ({ open, onClose, onSave, currentCurriculum, studentName }) => {
  const [selectedSurah, setSelectedSurah] = useState(currentCurriculum.surahName);
  const [fromAyah, setFromAyah] = useState(currentCurriculum.fromAyah);
  const [toAyah, setToAyah] = useState(currentCurriculum.toAyah);

  // إعادة تعيين القيم عند فتح النافذة
  React.useEffect(() => {
    if (open) {
      setSelectedSurah(currentCurriculum.surahName);
      setFromAyah(currentCurriculum.fromAyah);
      setToAyah(currentCurriculum.toAyah);
    }
  }, [open, currentCurriculum]);

  const handleSave = () => {
    onSave({
      surahName: selectedSurah,
      fromAyah,
      toAyah
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        تعديل منهج الحفظ - {studentName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            المنهج الحالي: {currentCurriculum.surahName} (الآيات {currentCurriculum.fromAyah}-{currentCurriculum.toAyah})
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>اختر السورة</InputLabel>
            <Select
              value={selectedSurah}
              label="اختر السورة"
              onChange={(e) => setSelectedSurah(e.target.value)}
            >
              <MenuItem value="الفاتحة">الفاتحة</MenuItem>
              <MenuItem value="البقرة">البقرة</MenuItem>
              <MenuItem value="آل عمران">آل عمران</MenuItem>
              <MenuItem value="النساء">النساء</MenuItem>
              <MenuItem value="المائدة">المائدة</MenuItem>
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="من الآية"
                type="number"
                fullWidth
                value={fromAyah}
                onChange={(e) => setFromAyah(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="إلى الآية"
                type="number"
                fullWidth
                value={toAyah}
                onChange={(e) => setToAyah(parseInt(e.target.value) || 1)}
                inputProps={{ min: fromAyah }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button onClick={handleSave} variant="contained">حفظ</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemorizationOptions;
