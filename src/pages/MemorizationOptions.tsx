import React, { useState, useEffect, useMemo } from 'react';
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
  useMediaQuery,
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
  CircularProgress,
  Drawer,
  Slide,
  Grow
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
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AttendanceRequiredAlert from '../components/AttendanceRequiredAlert';
import { hasAttendanceForToday } from '../services/attendanceService';
import { 
  getLastRecitationByType, 
  formatLastRecitationDate, 
  formatSurahRange 
} from '../services/recitationService';
import { uthmaniSurahs, getSurahById } from '../data/quran-uthmani';

interface UpdatedCurriculum {
  surahName: string;
  fromAyah: number;
  toAyah: number;
  isMultipleSurahs?: boolean;
  startSurah?: string;
  endSurah?: string;
  startSurahNumber?: number;
  endSurahNumber?: number;
}

const MemorizationOptions: React.FC = () => {
  const navigate = useNavigate();  
  const { selectedStudent, setMemorizationMode, user, currentMosque, preloadedData } = useAppContext();
  const theme = useTheme();  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const [showCurriculumEditor, setShowCurriculumEditor] = useState(false);
  
  // حالة إجبار إعادة الرسم عند تغيير المنهج
  const [curriculumUpdateTrigger, setCurriculumUpdateTrigger] = useState(0);
  
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

  const handleSaveCurriculum = (newCurriculum: UpdatedCurriculum) => {
    console.log('حفظ المنهج الجديد:', newCurriculum);
    
    // تحديث بيانات الطالب مع إجبار إعادة الرسم
    if (selectedStudent) {
      // تحديث الكائن بطريقة تجعل React يتعرف على التغيير
      selectedStudent.currentMemorization = {
        surahName: newCurriculum.surahName,
        fromAyah: newCurriculum.fromAyah,
        toAyah: newCurriculum.toAyah,
        isMultipleSurahs: newCurriculum.isMultipleSurahs,
        startSurah: newCurriculum.startSurah,
        endSurah: newCurriculum.endSurah,
        startSurahNumber: newCurriculum.startSurahNumber,
        endSurahNumber: newCurriculum.endSurahNumber
      };
      
      // إجبار إعادة رسم المكون
      setCurriculumUpdateTrigger(prev => prev + 1);
      
      // إظهار رسالة نجاح
      console.log('✅ تم حفظ المنهج بنجاح:', {
        نطاق: newCurriculum.surahName,
        السور_المتعددة: newCurriculum.isMultipleSurahs ? 'نعم' : 'لا',
        محدث_من_آخر_تسميع: 'نعم'
      });
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

  // دالة لحساب المنهج التالي بناءً على آخر تسميع "حفظ"
  const calculateNextCurriculum = () => {
    if (!selectedStudent) {
      return {
        surahName: 'الفاتحة',
        fromAyah: 1,
        toAyah: 7,
        isMultipleSurahs: false
      };
    }

    const lastRecitation = lastRecitations['حفظ'];
    
    if (!lastRecitation || !lastRecitation.surah_range) {
      // إذا لم يوجد تسميع سابق، استخدم المنهج الافتراضي
      return selectedStudent.currentMemorization;
    }

    const { start_surah, start_verse, end_surah, end_verse } = lastRecitation.surah_range;
    
    // العثور على السورة الأخيرة التي تم تسميعها
    const lastSurah = uthmaniSurahs.find(s => s.id === end_surah);
    if (!lastSurah) {
      return selectedStudent.currentMemorization;
    }

    let nextFromAyah = end_verse + 1;
    let nextSurah = lastSurah;

    // إذا تجاوزت الآية التالية عدد آيات السورة
    if (nextFromAyah > lastSurah.totalAyahs) {
      // انتقل للسورة التالية
      const nextSurahData = uthmaniSurahs.find(s => s.id === lastSurah.id + 1);
      if (nextSurahData) {
        nextSurah = nextSurahData;
        nextFromAyah = 1;
      } else {
        // إذا انتهت السور، ابدأ من الفاتحة
        nextSurah = uthmaniSurahs[0];
        nextFromAyah = 1;
      }
    }

    // حساب الآية النهائية (افتراضياً 5 آيات أو نهاية السورة)
    const nextToAyah = Math.min(nextFromAyah + 4, nextSurah.totalAyahs);

    return {
      surahName: nextSurah.arabicName,
      fromAyah: nextFromAyah,
      toAyah: nextToAyah,
      isMultipleSurahs: false,
      startSurah: nextSurah.arabicName,
      endSurah: nextSurah.arabicName,
      startSurahNumber: nextSurah.id,
      endSurahNumber: nextSurah.id
    };
  };

  // المنهج المحدث بناءً على آخر تسميع - مع trigger لإعادة الحساب
  const updatedCurriculum = useMemo(() => {
    // إذا كان هناك منهج محفوظ يدوياً، استخدمه
    if (selectedStudent?.currentMemorization) {
      return selectedStudent.currentMemorization;
    }
    // وإلا احسب المنهج التالي بناءً على آخر تسميع
    return calculateNextCurriculum();
  }, [
    selectedStudent?.currentMemorization, 
    lastRecitations, 
    loadingRecitations, 
    curriculumUpdateTrigger
  ]);

  // تحديث منهج الطالب تلقائياً عند تغيير التسميعات (فقط إذا لم يكن محفوظ يدوياً)
  useEffect(() => {
    if (selectedStudent && !loadingRecitations) {
      // فقط في حالة عدم وجود منهج محفوظ يدوياً أو تم إعادة تعيينه
      if (!selectedStudent.currentMemorization || 
          (selectedStudent.currentMemorization.surahName === 'الفاتحة' && 
           selectedStudent.currentMemorization.fromAyah === 1)) {
        
        const newCurriculum = calculateNextCurriculum();
        
        console.log('🔄 تحديث المنهج تلقائياً من آخر تسميع:', newCurriculum);
        selectedStudent.currentMemorization = newCurriculum;
        setCurriculumUpdateTrigger(prev => prev + 1);
      }
    }
  }, [selectedStudent, lastRecitations, loadingRecitations]);

  if (!selectedStudent) {
    return null;
  }
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: isMobile ? 3 : 10, 
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth={isMobile ? "sm" : "md"}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1.5 : 3 }}>
          <IconButton onClick={() => navigate('/students')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="h1" 
            flex="1"
            fontWeight="bold"
          >
            اختر نوع التسميع
          </Typography>
        </Box>

        <Paper 
          elevation={3} 
          sx={{ 
            p: isMobile ? 2 : 3, 
            mb: isMobile ? 2 : 4, 
            borderRadius: 2, 
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(120deg, #e8f5e9 0%, #c8e6c9 100%)'
              : 'linear-gradient(120deg, rgba(56,142,60,0.2) 0%, rgba(76,175,80,0.2) 100%)'
          }}
        >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            mr: 2,
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48
          }}>
            <PersonIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          </Avatar>
          <Box>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              fontWeight="bold"
            >
              {selectedStudent.name}
            </Typography>
          </Box>
        </Box>
          <Divider sx={{ my: 2 }} />          <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Typography 
              variant={isMobile ? "body2" : "body1"}
              fontWeight="bold"
            >
              الحفظ الحالي:
            </Typography>
            <Chip 
              label="محدث تلقائياً" 
              size="small" 
              color="success" 
              variant="outlined" 
              sx={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}
            />
          </Box>
          
          {/* المقطع الحالي - قابل للنقر لفتح التعديل */}
          <Paper
            elevation={0}
            onClick={() => setShowCurriculumEditor(true)}
            sx={{
              p: isMobile ? 1.5 : 2,
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
                <MenuBookIcon sx={{ 
                  mr: 1.5, 
                  fontSize: isMobile ? 24 : 28 
                }} />
                <Box>
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    fontWeight="bold"
                  >
                    {updatedCurriculum.isMultipleSurahs 
                      ? updatedCurriculum.surahName
                      : updatedCurriculum.surahName
                    }
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.8,
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {updatedCurriculum.isMultipleSurahs
                      ? `نطاق متعدد السور - ${updatedCurriculum.fromAyah} إلى ${updatedCurriculum.toAyah}`
                      : `من الآية ${updatedCurriculum.fromAyah} إلى ${updatedCurriculum.toAyah}`
                    }
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EditIcon sx={{ ml: 1, fontSize: isMobile ? 18 : 20 }} />
                {!isMobile && (
                  <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                    اضغط للتعديل
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Paper>      
      
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={isMobile ? 6 : 12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              minHeight: isMobile ? '180px' : '220px'
            }}
          >
            <CardActionArea 
              onClick={() => handleOptionSelection('حفظ')}
              sx={{ 
                height: '100%', 
                p: isMobile ? 1.5 : 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: isMobile ? 1 : 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'primary.main',
                    width: isMobile ? 50 : 70,
                    height: isMobile ? 50 : 70
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: isMobile ? 28 : 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h2" 
                  align="center" 
                  fontWeight="bold" 
                  gutterBottom
                >
                  حفظ
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    lineHeight: 1.3
                  }}
                >
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
                      minHeight: isMobile ? '24px' : '32px',
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
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

        <Grid item xs={isMobile ? 6 : 12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              minHeight: isMobile ? '180px' : '220px'
            }}
          >
            <CardActionArea 
              onClick={() => handleOptionSelection('مراجعة صغرى')}
              sx={{ 
                height: '100%', 
                p: isMobile ? 1.5 : 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: isMobile ? 1 : 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'info.main',
                    width: isMobile ? 50 : 70,
                    height: isMobile ? 50 : 70
                  }}
                >
                  <AutoStoriesIcon sx={{ fontSize: isMobile ? 28 : 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h2" 
                  align="center" 
                  fontWeight="bold" 
                  gutterBottom
                >
                  مراجعة صغرى
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    lineHeight: 1.3
                  }}
                >
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
                      minHeight: isMobile ? '24px' : '32px',
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
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
          <Card 
            sx={{ 
              height: '100%',
              minHeight: isMobile ? '180px' : '220px'
            }}
          >
            <CardActionArea 
              onClick={() => handleOptionSelection('مراجعة كبرى')}
              sx={{ 
                height: '100%', 
                p: isMobile ? 1.5 : 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: isMobile ? 1 : 2 }}>
                <Avatar
                  sx={{ 
                    bgcolor: 'success.main',
                    width: isMobile ? 50 : 70,
                    height: isMobile ? 50 : 70
                  }}
                >
                  <LocalLibraryIcon sx={{ fontSize: isMobile ? 28 : 40 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  component="h2" 
                  align="center" 
                  fontWeight="bold" 
                  gutterBottom
                >
                  مراجعة كبرى
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    lineHeight: 1.3
                  }}
                >
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
                      minHeight: isMobile ? '24px' : '32px',
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
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
        currentCurriculum={updatedCurriculum}
        studentName={selectedStudent.name}
      />
      </Container>
    </Box>
  );
};

// واجهة بيانات المنهج المحدث
interface UpdatedCurriculum {
  surahName: string;
  fromAyah: number;
  toAyah: number;
  isMultipleSurahs?: boolean;
  startSurah?: string;
  endSurah?: string;
  startSurahNumber?: number;
  endSurahNumber?: number;
}

// مكون تعديل منهج الحفظ - Bottom Sheet
const CurriculumEditor: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (curriculum: UpdatedCurriculum) => void;
  currentCurriculum: { surahName: string; fromAyah: number; toAyah: number };
  studentName: string;
}> = ({ open, onClose, onSave, currentCurriculum, studentName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedSurah, setSelectedSurah] = useState(currentCurriculum.surahName);
  const [fromAyah, setFromAyah] = useState<number | string>(currentCurriculum.fromAyah);
  const [toAyah, setToAyah] = useState<number | string>(currentCurriculum.toAyah);
  const [endSurah, setEndSurah] = useState(currentCurriculum.surahName);

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
    return surah ? surah.totalAyahs : 286;
  };
  
  // دالة لحساب العدد الإجمالي للآيات في النطاق المحدد
  const calculateTotalAyahs = (): number => {
    const fromAyahNum = typeof fromAyah === 'string' ? parseInt(fromAyah) || 1 : fromAyah;
    const toAyahNum = typeof toAyah === 'string' ? parseInt(toAyah) || 1 : toAyah;
    
    if (selectedSurah === endSurah) {
      return toAyahNum - fromAyahNum + 1;
    } else {
      const startSurah = uthmaniSurahs.find(s => s.arabicName === selectedSurah);
      const endSurahData = uthmaniSurahs.find(s => s.arabicName === endSurah);
      
      if (!startSurah || !endSurahData) return 0;
      
      let totalAyahs = 0;
      for (let surahId = startSurah.id; surahId <= endSurahData.id; surahId++) {
        const currentSurah = uthmaniSurahs.find(s => s.id === surahId);
        if (!currentSurah) continue;
        
        if (surahId === startSurah.id) {
          totalAyahs += currentSurah.totalAyahs - fromAyahNum + 1;
        } else if (surahId === endSurahData.id) {
          totalAyahs += toAyahNum;
        } else {
          totalAyahs += currentSurah.totalAyahs;
        }
      }
      return totalAyahs;
    }
  };

  // التحديث التلقائي عند تغيير السورة الأولى
  const handleFirstSurahChange = (surahName: string) => {
    setSelectedSurah(surahName);
    // فقط إعادة تعيين السورة الثانية إذا كانت نفس السورة الأولى السابقة
    if (selectedSurah === endSurah) {
      setEndSurah(surahName);
    }
    setFromAyah(1);
    
    const totalAyahs = getSurahTotalAyahs(surahName);
    if (totalAyahs <= 10) {
      setToAyah(totalAyahs);
    } else {
      setToAyah(10);
    }
  };

  // التحديث عند تغيير السورة الثانية
  const handleEndSurahChange = (surahName: string) => {
    setEndSurah(surahName);
    const totalAyahs = getSurahTotalAyahs(surahName);
    const toAyahNum = typeof toAyah === 'string' ? parseInt(toAyah) || 1 : toAyah;
    if (toAyahNum > totalAyahs) {
      setToAyah(totalAyahs);
    }
  };

  // التحديث التلقائي عند تغيير "من"
  const handleFromAyahChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue === 0 && value !== '') {
      return; // منع إدخال قيم غير صالحة
    }
    
    const totalStartAyahs = getSurahTotalAyahs(selectedSurah);
    
    // السماح بحقل فارغ أثناء الكتابة
    if (value === '' || numValue === 0) {
      setFromAyah(value === '' ? '' : 1);
      return;
    }
    
    const validFromValue = Math.max(1, Math.min(numValue, totalStartAyahs));
    setFromAyah(validFromValue);
    
    const totalEndAyahs = getSurahTotalAyahs(endSurah);
    let suggestedToAyah;
    
    if (selectedSurah === endSurah) {
      suggestedToAyah = Math.min(validFromValue + 9, totalEndAyahs);
    } else {
      suggestedToAyah = Math.min(10, totalEndAyahs);
    }
    setToAyah(suggestedToAyah);
  };

  // التحديث عند تغيير "إلى الآية"
  const handleToAyahChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue === 0 && value !== '') {
      return; // منع إدخال قيم غير صالحة
    }
    
    const totalEndAyahs = getSurahTotalAyahs(endSurah);
    const fromAyahNum = typeof fromAyah === 'string' ? parseInt(fromAyah) || 1 : fromAyah;
    const minValue = selectedSurah === endSurah ? fromAyahNum : 1;
    
    // السماح بحقل فارغ أثناء الكتابة
    if (value === '' || numValue === 0) {
      setToAyah(value === '' ? '' : minValue);
      return;
    }
    
    const validToValue = Math.max(minValue, Math.min(numValue, totalEndAyahs));
    setToAyah(validToValue);
  };

  const handleSave = () => {
    // تحويل القيم النصية إلى أرقام للحفظ
    const fromAyahNum = typeof fromAyah === 'string' ? parseInt(fromAyah) || 1 : fromAyah;
    const toAyahNum = typeof toAyah === 'string' ? parseInt(toAyah) || 1 : toAyah;
    
    if (selectedSurah !== endSurah) {
      const startSurah = uthmaniSurahs.find(s => s.arabicName === selectedSurah);
      const endSurahData = uthmaniSurahs.find(s => s.arabicName === endSurah);
      
      if (startSurah && endSurahData) {
        const rangeText = `${selectedSurah} ${fromAyahNum} إلى ${endSurah} ${toAyahNum}`;
        onSave({
          surahName: rangeText,
          fromAyah: fromAyahNum,
          toAyah: toAyahNum,
          isMultipleSurahs: true,
          startSurah: selectedSurah,
          endSurah: endSurah,
          startSurahNumber: startSurah.id,
          endSurahNumber: endSurahData.id
        });
      }
    } else {
      onSave({
        surahName: selectedSurah,
        fromAyah: fromAyahNum,
        toAyah: toAyahNum,
        isMultipleSurahs: false,
        startSurah: selectedSurah,
        endSurah: selectedSurah,
        startSurahNumber: uthmaniSurahs.find(s => s.arabicName === selectedSurah)?.id,
        endSurahNumber: uthmaniSurahs.find(s => s.arabicName === selectedSurah)?.id
      });
    }
    onClose();
  };

  return (
    <>
      {/* Background Overlay */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        hideBackdrop={false}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85vh',
            minHeight: isMobile ? '60vh' : '50vh',
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
              : 'linear-gradient(180deg, #1e1e1e 0%, #2d2d2d 100%)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
          }
        }}
        SlideProps={{
          direction: 'up',
          timeout: 300,
        }}
      >
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          {/* Handle Bar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{
              width: 40,
              height: 4,
              bgcolor: 'grey.400',
              borderRadius: 2,
              cursor: 'pointer'
            }} onClick={onClose} />
          </Box>

          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            px: 3, 
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'primary.light', 
                width: 36, 
                height: 36, 
                mr: 2 
              }}>
                <EditIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  تعديل المنهج
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  التعديل السريع للنطاق
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {/* المنهج الحالي - مبسط */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: 'primary.light', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'primary.main',
                opacity: 0.8
              }}
            >
              <Typography variant="body2" color="primary.dark" gutterBottom>
                الحالي: {currentCurriculum.surahName} ({currentCurriculum.fromAyah}-{currentCurriculum.toAyah})
              </Typography>
            </Paper>

            {/* نموذج التعديل المبسط - السور المتعددة */}
            <Grid container spacing={2}>
              {/* الصف الأول: السورة الأولى ومن الآية */}
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel>من السورة</InputLabel>
                  <Select
                    value={selectedSurah}
                    label="من السورة"
                    onChange={(e) => handleFirstSurahChange(e.target.value)}
                    sx={{ 
                      bgcolor: 'background.paper',
                      borderRadius: 2
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 240,
                          borderRadius: 12,
                        },
                      },
                    }}
                  >
                    {uthmaniSurahs.map(surah => (
                      <MenuItem key={surah.id} value={surah.arabicName}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography fontWeight="medium">
                            {surah.id}. {surah.arabicName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {surah.totalAyahs} آية
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="من الآية"
                  type="number"
                  fullWidth
                  value={fromAyah}
                  onChange={(e) => handleFromAyahChange(e.target.value)}
                  inputProps={{ 
                    min: 1, 
                    max: getSurahTotalAyahs(selectedSurah),
                    inputMode: 'numeric'
                  }}
                  sx={{ 
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              {/* الصف الثاني: السورة الثانية وإلى الآية */}
              <Grid item xs={8}>
                <FormControl fullWidth>
                  <InputLabel>إلى السورة</InputLabel>
                  <Select
                    value={endSurah}
                    label="إلى السورة"
                    onChange={(e) => handleEndSurahChange(e.target.value)}
                    sx={{ 
                      bgcolor: 'background.paper',
                      borderRadius: 2
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 240,
                          borderRadius: 12,
                        },
                      },
                    }}
                  >
                    {uthmaniSurahs.map(surah => (
                      <MenuItem key={surah.id} value={surah.arabicName}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography fontWeight="medium">
                            {surah.id}. {surah.arabicName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {surah.totalAyahs} آية
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <TextField
                  label="إلى الآية"
                  type="number"
                  fullWidth
                  value={toAyah}
                  onChange={(e) => handleToAyahChange(e.target.value)}
                  inputProps={{ 
                    min: selectedSurah === endSurah ? (typeof fromAyah === 'string' ? parseInt(fromAyah) || 1 : fromAyah) : 1, 
                    max: getSurahTotalAyahs(endSurah),
                    inputMode: 'numeric'
                  }}
                  sx={{ 
                    bgcolor: 'background.paper',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* معاينة النطاق الجديد */}
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 3, 
                p: 2.5, 
                bgcolor: 'success.light', 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'success.main'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.dark' }} />
                <Typography variant="subtitle1" color="success.dark" fontWeight="bold">
                  النطاق الجديد
                </Typography>
              </Box>
              <Typography variant="body1" color="success.dark" fontWeight="medium">
                {selectedSurah === endSurah 
                  ? `${selectedSurah} (${typeof fromAyah === 'string' ? fromAyah || '1' : fromAyah}-${typeof toAyah === 'string' ? toAyah || '1' : toAyah})`
                  : `${selectedSurah} ${typeof fromAyah === 'string' ? fromAyah || '1' : fromAyah} إلى ${endSurah} ${typeof toAyah === 'string' ? toAyah || '1' : toAyah}`
                }
              </Typography>
              <Typography variant="body2" color="success.dark" sx={{ mt: 0.5 }}>
                عدد الآيات: {calculateTotalAyahs()} آية
              </Typography>
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            p: 3, 
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            gap: 2
          }}>
            <Button 
              onClick={onClose}
              variant="outlined"
              sx={{ 
                flex: 1,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold'
              }}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained"
              sx={{ 
                flex: 2,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              }}
              startIcon={<SaveIcon />}
            >
              حفظ التعديلات
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MemorizationOptions;
