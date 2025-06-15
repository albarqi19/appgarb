import React, { useState, useEffect } from 'react';
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
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AttendanceRequiredAlert from '../components/AttendanceRequiredAlert';
import { hasAttendanceForToday } from '../services/attendanceService';
import { 
  getLastRecitationByType, 
  formatLastRecitationDate, 
  formatSurahRange 
} from '../services/recitationService';
import { uthmaniSurahs, getSurahById } from '../data/quran-uthmani';

const MemorizationOptions: React.FC = () => {
  const navigate = useNavigate();  
  const { selectedStudent, setMemorizationMode, user, currentMosque, preloadedData } = useAppContext();
  const theme = useTheme();  
    const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const [showCurriculumEditor, setShowCurriculumEditor] = useState(false);
  
  // حالة التحميل وآخر التسميعات
  const [loadingRecitations, setLoadingRecitations] = useState(true);
  const [lastRecitations, setLastRecitations] = useState<{
    حفظ: any | null;
    'مراجعة صغرى': any | null;
    'مراجعة كبرى': any | null;
  }>({
    حفظ: null,
    'مراجعة صغرى': null,
    'مراجعة كبرى': null
  });

  // تحميل آخر التسميعات عند اختيار طالب
  useEffect(() => {
    const loadLastRecitations = async () => {
      if (!selectedStudent) return;

      console.log('🔄 تحميل آخر التسميعات للطالب:', selectedStudent.name);
      setLoadingRecitations(true);

      try {
        // فحص البيانات المحملة مسبقاً أولاً
        const preloadedRecitations = preloadedData.lastRecitations[selectedStudent.id];
        if (preloadedRecitations) {
          console.log('✅ استخدام البيانات المحملة مسبقاً');
          setLastRecitations(preloadedRecitations);
          setLoadingRecitations(false);
          return;
        }

        // إذا لم تكن متوفرة، اجلبها من API
        console.log('🌐 جلب التسميعات من API...');
        const studentId = parseInt(selectedStudent.id);
        const types = ['حفظ', 'مراجعة صغرى', 'مراجعة كبرى'];
        
        const recitationPromises = types.map(async (type) => {
          const data = await getLastRecitationByType(studentId, type);
          return { type, data };
        });

        const results = await Promise.all(recitationPromises);
        
        const newRecitations = {
          حفظ: null,
          'مراجعة صغرى': null,
          'مراجعة كبرى': null
        };

        results.forEach(({ type, data }) => {
          newRecitations[type as keyof typeof newRecitations] = data;
        });

        setLastRecitations(newRecitations);
        console.log('✅ تم تحميل التسميعات بنجاح:', newRecitations);

      } catch (error) {
        console.error('❌ خطأ في تحميل التسميعات:', error);
        // الاحتفاظ بالقيم الافتراضية في حالة الخطأ
      } finally {
        setLoadingRecitations(false);
      }
    };    loadLastRecitations();
  }, [selectedStudent, preloadedData]);

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

  // تنسيق نص آخر تسميع للعرض
  const formatLastRecitationText = (recitationType: string) => {
    const recitation = lastRecitations[recitationType as keyof typeof lastRecitations];
    
    if (!recitation) {
      return 'لا يوجد سجل تسميع سابق';
    }

    const dateText = formatLastRecitationDate(recitation.session_date);
    const surahText = formatSurahRange(recitation.surah_range);
    
    if (surahText) {
      return `${dateText}: ${surahText}`;
    } else {
      return dateText;
    }
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
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            الحفظ الحالي:
          </Typography>
          
          {/* المقطع الحالي - قابل للنقر لفتح التعديل */}
          <Paper
            elevation={0}
            onClick={() => setShowCurriculumEditor(true)}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'primary.light',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MenuBookIcon sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedStudent.currentMemorization.surahName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    من الآية {selectedStudent.currentMemorization.fromAyah} إلى {selectedStudent.currentMemorization.toAyah}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon sx={{ ml: 1 }} />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  اضغط للتعديل
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Paper>      <Grid container spacing={3}>
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
                <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                  تسميع الحفظ الجديد من السورة المحددة
                </Typography>
                <Divider sx={{ my: 1 }} />
                {loadingRecitations ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ 
                      display: 'block',
                      minHeight: '32px',
                      fontSize: '0.75rem',
                      lineHeight: 1.2
                    }}
                  >
                    {formatLastRecitationText('حفظ')}
                  </Typography>
                )}
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
                <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                  مراجعة الحفظ الأخير خلال الأسبوع الماضي
                </Typography>
                <Divider sx={{ my: 1 }} />
                {loadingRecitations ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ 
                      display: 'block',
                      minHeight: '32px',
                      fontSize: '0.75rem',
                      lineHeight: 1.2
                    }}
                  >
                    {formatLastRecitationText('مراجعة صغرى')}
                  </Typography>
                )}
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
                <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                  مراجعة محفوظات سابقة من شهر أو أكثر
                </Typography>
                <Divider sx={{ my: 1 }} />
                {loadingRecitations ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    align="center" 
                    sx={{ 
                      display: 'block',
                      minHeight: '32px',
                      fontSize: '0.75rem',
                      lineHeight: 1.2
                    }}
                  >
                    {formatLastRecitationText('مراجعة كبرى')}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
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
  const [endSurah, setEndSurah] = useState(currentCurriculum.surahName); // السورة الثانية

  // إعادة تعيين القيم عند فتح النافذة
  React.useEffect(() => {
    if (open) {
      setSelectedSurah(currentCurriculum.surahName);
      setFromAyah(currentCurriculum.fromAyah);
      setToAyah(currentCurriculum.toAyah);
      setEndSurah(currentCurriculum.surahName);
    }
  }, [open, currentCurriculum]);

  // دالة للحصول على عدد آيات السورة
  const getSurahTotalAyahs = (surahName: string): number => {
    const surah = uthmaniSurahs.find(s => s.arabicName === surahName);
    return surah ? surah.totalAyahs : 286; // افتراضي البقرة
  };
  // التحديث التلقائي عند تغيير السورة الأولى
  const handleFirstSurahChange = (surahName: string) => {
    setSelectedSurah(surahName);
    setEndSurah(surahName); // تلقائياً نفس السورة
    
    // إعادة تعيين "من" إلى 1
    setFromAyah(1);
    
    // تحديد "إلى" بناءً على طول السورة
    const totalAyahs = getSurahTotalAyahs(surahName);
    if (totalAyahs <= 10) {
      // سورة قصيرة - استخدم نهاية السورة
      setToAyah(totalAyahs);
    } else {
      // سورة طويلة - استخدم 10 آيات
      setToAyah(10);
    }
  };

  // التحديث عند تغيير السورة الثانية
  const handleEndSurahChange = (surahName: string) => {
    setEndSurah(surahName);
    
    // التأكد من أن "إلى الآية" لا تتجاوز عدد آيات السورة الجديدة
    const totalAyahs = getSurahTotalAyahs(surahName);
    if (toAyah > totalAyahs) {
      setToAyah(totalAyahs);
    }
  };

  // التحديث التلقائي عند تغيير "من"
  const handleFromAyahChange = (value: number) => {
    const totalStartAyahs = getSurahTotalAyahs(selectedSurah);
    
    // التأكد من أن القيمة في النطاق المسموح
    const validFromValue = Math.max(1, Math.min(value, totalStartAyahs));
    setFromAyah(validFromValue);
    
    // تحديث "إلى الآية" تلقائياً
    const totalEndAyahs = getSurahTotalAyahs(endSurah);
    let suggestedToAyah;
    
    if (selectedSurah === endSurah) {
      // نفس السورة - أضف 10 آيات أو حتى نهاية السورة
      suggestedToAyah = Math.min(validFromValue + 9, totalEndAyahs);
    } else {
      // سور مختلفة - استخدم الحد الأدنى بين 10 آيات أو نهاية السورة الثانية
      suggestedToAyah = Math.min(10, totalEndAyahs);
    }
    
    setToAyah(suggestedToAyah);
  };

  // التحديث عند تغيير "إلى الآية"
  const handleToAyahChange = (value: number) => {
    const totalEndAyahs = getSurahTotalAyahs(endSurah);
    
    // التأكد من أن القيمة في النطاق المسموح
    const minValue = selectedSurah === endSurah ? fromAyah : 1;
    const validToValue = Math.max(minValue, Math.min(value, totalEndAyahs));
    setToAyah(validToValue);
  };

  const handleSave = () => {
    onSave({
      surahName: selectedSurah,
      fromAyah,
      toAyah
    });
    onClose();
  };
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            تعديل منهج الحفظ
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          الطالب: {studentName}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {/* عرض المنهج الحالي */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'info.light', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'info.main'
            }}
          >
            <Typography variant="body2" color="info.dark" gutterBottom>
              <strong>المنهج الحالي:</strong>
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="info.dark">
              {currentCurriculum.surahName} (الآيات {currentCurriculum.fromAyah}-{currentCurriculum.toAyah})
            </Typography>
          </Paper>            <Grid container spacing={3}>
            {/* عنوان القسم */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <MenuBookIcon sx={{ mr: 1, color: 'primary.main' }} />
                تحديد السورة والنطاق
              </Typography>
            </Grid>

            {/* الصف الأول: السورة الأولى و من الآية */}
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth>
                <InputLabel>السورة</InputLabel>
                <Select
                  value={selectedSurah}
                  label="السورة"
                  onChange={(e) => handleFirstSurahChange(e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  {uthmaniSurahs.map(surah => (
                    <MenuItem key={surah.id} value={surah.arabicName}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>{surah.id}. {surah.arabicName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({surah.totalAyahs} آية)
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>            <Grid item xs={12} sm={4}>
              <TextField
                label="من الآية"
                type="number"
                fullWidth
                value={fromAyah}
                onChange={(e) => handleFromAyahChange(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: getSurahTotalAyahs(selectedSurah) }}
                helperText={`الحد الأقصى: ${getSurahTotalAyahs(selectedSurah)}`}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>

            {/* الصف الثاني: السورة الثانية و إلى الآية */}
            <Grid item xs={12} sm={8}>              <FormControl fullWidth>
                <InputLabel>إلى السورة</InputLabel>
                <Select
                  value={endSurah}
                  label="إلى السورة"
                  onChange={(e) => handleEndSurahChange(e.target.value)}
                  sx={{ bgcolor: 'background.paper' }}
                >
                  {uthmaniSurahs.map(surah => (
                    <MenuItem key={surah.id} value={surah.arabicName}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>{surah.id}. {surah.arabicName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({surah.totalAyahs} آية)
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>            <Grid item xs={12} sm={4}>
              <TextField
                label="إلى الآية"
                type="number"
                fullWidth
                value={toAyah}
                onChange={(e) => handleToAyahChange(parseInt(e.target.value) || 1)}
                inputProps={{ 
                  min: selectedSurah === endSurah ? fromAyah : 1, 
                  max: getSurahTotalAyahs(endSurah) 
                }}
                helperText={`الحد الأقصى: ${getSurahTotalAyahs(endSurah)}`}
                sx={{ bgcolor: 'background.paper' }}
              />
            </Grid>
          </Grid>

          {/* معلومات المقطع المحدد */}
          <Paper 
            elevation={0} 
            sx={{ 
              mt: 3, 
              p: 3, 
              bgcolor: 'success.light', 
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.main'
            }}
          >
            <Typography variant="h6" color="success.dark" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1 }} />
              المقطع المحدد
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" color="success.dark" gutterBottom>
                <strong>النطاق:</strong> {' '}
                {selectedSurah === endSurah 
                  ? `سورة ${selectedSurah} من الآية ${fromAyah} إلى ${toAyah}`
                  : `من سورة ${selectedSurah} آية ${fromAyah} إلى سورة ${endSurah} آية ${toAyah}`
                }
              </Typography>
              <Typography variant="body1" color="success.dark">
                <strong>عدد الآيات:</strong> {toAyah - fromAyah + 1} آية
              </Typography>
            </Box>
          </Paper>
        </Box>      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ px: 4, py: 1 }}
        >
          إلغاء
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{ px: 4, py: 1 }}
          startIcon={<CheckCircleIcon />}
        >
          حفظ التعديلات
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemorizationOptions;
