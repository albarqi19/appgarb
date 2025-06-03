import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  IconButton, 
  Chip, 
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Card,
  CardContent,
  Tooltip,
  CircularProgress,
  Container,
  Avatar,
  Stack,
  LinearProgress,
  Collapse,
  TextField,
  InputAdornment,
  Badge,
  Popover,
  ButtonGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SaveIcon from '@mui/icons-material/Save';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';
import PersonIcon from '@mui/icons-material/Person';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import GradeIcon from '@mui/icons-material/Grade';
import InfoIcon from '@mui/icons-material/Info';
import NotesIcon from '@mui/icons-material/Notes';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HighlightIcon from '@mui/icons-material/Highlight';
import { surahs, ayahs } from '../data/quran';
import { 
  uthmaniSurahs, 
  uthmaniAyahs, 
  getSurahById, 
  getAyahsBySurahId,
  UthmaniSurah,
  UthmaniAyah 
} from '../data/quran-uthmani';
import { studentAnalytics } from '../data/ai-insights';
import { MemorizationError } from '../data/students';
import '../styles/uthmani.css';

// أنواع الأخطاء في التسميع
const errorTypes = [
  { id: 'حفظ', label: 'خطأ حفظ', color: 'error', icon: <ErrorIcon /> },
  { id: 'تجويد', label: 'خطأ تجويد', color: 'warning', icon: <InfoIcon /> },
  { id: 'نطق', label: 'خطأ نطق', color: 'info', icon: <HighlightIcon /> }
];

const MemorizationSession: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudent, memorizationMode, setIsSessionActive } = useAppContext();
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<UthmaniSurah | undefined>(
    uthmaniSurahs.find(s => s.arabicName === selectedStudent?.currentMemorization.surahName)
  );
  const [currentAyahs, setCurrentAyahs] = useState<UthmaniAyah[]>([]);
  const [fromAyah, setFromAyah] = useState(selectedStudent?.currentMemorization.fromAyah || 1);
  const [toAyah, setToAyah] = useState(selectedStudent?.currentMemorization.toAyah || 5);  const [errors, setErrors] = useState<MemorizationError[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedWord, setSelectedWord] = useState<{word: string, index: number, ayahIndex: number}>({word: '', index: 0, ayahIndex: 0});
  const [selectedErrorType, setSelectedErrorType] = useState<'حفظ' | 'تجويد' | 'نطق'>('حفظ');
  const [finalScore, setFinalScore] = useState(100);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timer | null>(null);
  const [notes, setNotes] = useState('');
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  // التأكد من وجود طالب ونوع تسميع
  useEffect(() => {
    if (!selectedStudent || !memorizationMode) {
      navigate('/students');
      return;
    }

    // تحميل السورة المناسبة بالرسم العثماني
    const surah = uthmaniSurahs.find(s => s.arabicName === selectedStudent.currentMemorization.surahName);
    setCurrentSurah(surah);
    
    if (surah) {
      // تحميل الآيات المطلوبة بالرسم العثماني
      const allAyahs = getAyahsBySurahId(surah.id);
      const requiredAyahs = allAyahs.filter(ayah => 
        ayah.number >= selectedStudent.currentMemorization.fromAyah && 
        ayah.number <= selectedStudent.currentMemorization.toAyah
      );
      setCurrentAyahs(requiredAyahs);
    }
    
    setFromAyah(selectedStudent.currentMemorization.fromAyah);
    setToAyah(selectedStudent.currentMemorization.toAyah);
  }, [selectedStudent, memorizationMode, navigate]);
  
  // إدارة المؤقت للجلسة
  useEffect(() => {
    if (isSessionStarted && !sessionTimer) {
      const timer = setInterval(() => {
        setSessionTime(prevTime => prevTime + 1);
      }, 1000);
      setSessionTimer(timer);
    } else if (!isSessionStarted && sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
    
    return () => {
      if (sessionTimer) {
        clearInterval(sessionTimer);
      }
    };
  }, [isSessionStarted, sessionTimer]);

  // بدء جلسة التسميع
  const handleStartSession = () => {
    setIsSessionStarted(true);
    setIsSessionActive(true);
    setErrors([]);
    setSessionTime(0);
  };
  // معالجة اختيار كلمة للإشارة لوجود خطأ
  const handleWordClick = (event: React.MouseEvent<HTMLElement>, word: string, wordIndex: number, ayahIndex: number) => {
    if (!isSessionStarted) return;
    
    setSelectedWord({ word, index: wordIndex, ayahIndex });
    setAnchorEl(event.currentTarget);
    setIsDialogOpen(true);
  };
  // إضافة خطأ
  const handleAddError = () => {
    const newError: MemorizationError = {
      type: selectedErrorType,
      wordIndex: selectedWord.index,
      word: selectedWord.word,
      ayahIndex: selectedWord.ayahIndex
    };
    
    setErrors([...errors, newError]);
    setIsDialogOpen(false);
    setAnchorEl(null);

    // تخفيض الدرجة بناءً على نوع الخطأ
    let penalty = 0;
    switch(selectedErrorType) {
      case 'حفظ':
        penalty = 3; // خطأ الحفظ أشد
        break;
      case 'تجويد':
        penalty = 2;
        break;
      case 'نطق':
        penalty = 1;
        break;
      default:
        penalty = 1;
    }

    setFinalScore(current => Math.max(0, current - penalty));
  };

  // إضافة خطأ مباشرة بنوع محدد
  const handleAddErrorType = (errorType: 'حفظ' | 'تجويد' | 'نطق') => {
    const newError: MemorizationError = {
      type: errorType,
      wordIndex: selectedWord.index,
      word: selectedWord.word,
      ayahIndex: selectedWord.ayahIndex
    };
    
    setErrors([...errors, newError]);
    setIsDialogOpen(false);
    setAnchorEl(null);

    // تخفيض الدرجة بناءً على نوع الخطأ
    let penalty = 0;
    switch(errorType) {
      case 'حفظ':
        penalty = 3; // خطأ الحفظ أشد
        break;
      case 'تجويد':
        penalty = 2;
        break;
      case 'نطق':
        penalty = 1;
        break;
      default:
        penalty = 1;
    }

    setFinalScore(current => Math.max(0, current - penalty));
  };

  // تحليل الأخطاء باستخدام الذكاء الاصطناعي
  const analyzeErrors = () => {
    setIsAnalyzing(true);
    
    // محاكاة استدعاء خدمة الذكاء الاصطناعي
    setTimeout(() => {
      const analytics = studentAnalytics[selectedStudent?.id || ''];
      
      if (analytics) {
        // استنادًا إلى بيانات الطالب، نقدم اقتراحات مخصصة
        const suggestions = [];
        
        if (errors.filter(e => e.type === 'تجويد').length > 1) {
          suggestions.push("يُلاحظ تكرار أخطاء التجويد. يُوصى بالتركيز على قواعد النطق الصحيح للحروف المتشابهة.");
        }
        
        if (errors.filter(e => e.type === 'حفظ').length > 2) {
          suggestions.push("هناك عدة أخطاء في الحفظ. يُفضل تقسيم المقطع إلى أجزاء أصغر للمراجعة.");
        }

        if (analytics.weaknesses.includes('التركيز لفترات طويلة')) {
          suggestions.push("يُنصح بتقصير جلسات الحفظ وزيادة عددها لتحسين التركيز.");
        }

        if (errors.some(e => e.ayahIndex === fromAyah)) {
          suggestions.push("تظهر الأخطاء في بداية المقطع. يُقترح البدء بتكرار الآية الأولى بشكل أكبر.");
        }

        if (suggestions.length === 0) {
          suggestions.push("أداء الطالب جيد نسبيًا. استمر في نفس منهج التحفيظ الحالي.");
        }
        
        setAiSuggestions(suggestions);
      } else {
        setAiSuggestions(["لم تتوفر بيانات كافية للتحليل. استمر في متابعة أداء الطالب."]);
      }
      
      setIsAnalyzing(false);
      setShowScoreDialog(true);
    }, 1500);
  };

  // إنهاء جلسة التسميع
  const handleFinishSession = () => {
    setIsSessionStarted(false);
    analyzeErrors();
  };

  // حفظ النتائج والعودة لصفحة الطلاب
  const handleSaveResults = () => {
    // في تطبيق حقيقي، هنا سنقوم بحفظ النتائج في قاعدة البيانات
    setShowScoreDialog(false);
    setIsSessionActive(false);
    navigate('/students');
  };

  // الحصول على لون الكلمة بناءً على الأخطاء
  const getWordColor = (word: string, wordIndex: number, ayahIndex: number) => {
    const error = errors.find(e => 
      e.wordIndex === wordIndex && e.ayahIndex === ayahIndex
    );
    
    if (error) {
      switch(error.type) {
        case 'حفظ':
          return 'error.main';
        case 'تجويد':
          return 'warning.main';
        case 'نطق':
          return 'info.main';
        default:
          return 'text.primary';
      }
    }
    
    return 'text.primary';
  };

  // تنسيق الوقت
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // الحصول على ملخص الأخطاء حسب النوع
  const getErrorSummary = (type: string): number => {
    return errors.filter(e => e.type === type).length;
  };

  if (!selectedStudent || !currentSurah || !memorizationMode) {
    return <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 10,
        pb: 5,
        background: 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
      }}
    >
      <Container maxWidth="lg">
        {/* رأس الصفحة */}
        <Paper
          elevation={0}
          sx={{
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.1 }}>
            {/* نمط زخرفي بالخلفية */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,20 L40,20 M20,0 L20,40" stroke="#FFF" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="15" fill="none" stroke="#FFF" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern)" />
            </svg>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <IconButton 
              onClick={() => navigate('/memorization-options')} 
              sx={{ 
                mr: 2, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                جلسة {memorizationMode}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                سورة {currentSurah.arabicName} - الآيات ({fromAyah} - {toAyah})
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', zIndex: 1 }}>
            <Chip 
              icon={<TimerIcon />} 
              label={formatTime(sessionTime)}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.15)',
                mr: 2,
                border: 'none'
              }} 
            />
            <Button
              variant="contained"
              color={isSessionStarted ? "error" : "success"}
              startIcon={isSessionStarted ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={isSessionStarted ? handleFinishSession : handleStartSession}
              sx={{ 
                px: 3,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
                }
              }}
            >
              {isSessionStarted ? "إنهاء التسميع" : "بدء التسميع"}
            </Button>
          </Box>
        </Paper>
        
        <Grid container spacing={3}>
          {/* معلومات الطالب */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'primary.main', 
                    mx: 'auto',
                    mb: 2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  {selectedStudent.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {selectedStudent.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {selectedStudent.level} • {selectedStudent.age} سنة
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        الدرجة الإجمالية
                      </Typography>
                      <Chip 
                        label={`${selectedStudent.totalScore}%`}
                        color={selectedStudent.totalScore >= 90 ? "success" : selectedStudent.totalScore >= 75 ? "primary" : "warning"}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        نسبة الحضور
                      </Typography>
                      <Chip 
                        label={`${selectedStudent.attendanceRate}%`}
                        color={selectedStudent.attendanceRate >= 90 ? "success" : selectedStudent.attendanceRate >= 75 ? "primary" : "warning"}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* ملخص الأخطاء */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Typography variant="h6" fontWeight="medium">
                    ملخص الأخطاء
                  </Typography>
                  <Badge 
                    badgeContent={errors.length} 
                    color={errors.length > 5 ? "error" : errors.length > 2 ? "warning" : "success"}
                    showZero
                  >
                    <ErrorIcon />
                  </Badge>
                </Box>
                
                <Stack spacing={2}>
                  {errorTypes.map((type) => (
                    <Box key={type.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              bgcolor: `${type.color}.light`, 
                              mr: 1 
                            }}
                          >
                            {React.cloneElement(type.icon, { fontSize: 'small', sx: { color: `${type.color}.main` } })}
                          </Avatar>
                          <Typography variant="body2" color="text.secondary">
                            {type.label}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {getErrorSummary(type.id)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, getErrorSummary(type.id) * 20)} // Max 100% for 5 errors
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          mb: 1
                        }} 
                        color={type.color as 'error' | 'warning' | 'info'}
                      />
                    </Box>
                  ))}
                </Stack>
                
                {isSessionStarted && errors.length > 0 && (
                  <>
                    <Button 
                      fullWidth 
                      size="small" 
                      sx={{ mt: 2 }} 
                      onClick={() => setShowErrorSummary(!showErrorSummary)}
                    >
                      {showErrorSummary ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                    </Button>
                    
                    <Collapse in={showErrorSummary}>
                      <Box 
                        sx={{ 
                          mt: 2, 
                          maxHeight: 150, 
                          overflow: 'auto',
                          borderRadius: 2,
                          bgcolor: 'background.default',
                          p: 2
                        }}
                      >
                        {errors.map((error, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1,
                              pb: 1,
                              borderBottom: index !== errors.length - 1 ? '1px solid' : 'none',
                              borderColor: 'divider'
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%',
                                bgcolor: error.type === 'حفظ' ? 'error.main' : error.type === 'تجويد' ? 'warning.main' : 'info.main',
                                mr: 1
                              }} 
                            />
                            <Typography variant="caption" noWrap>
                              "{error.word}" - الآية: {error.ayahIndex}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </>
                )}
              </Paper>

              {/* ملاحظات التسميع */}
              {isSessionStarted && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <NotesIcon sx={{ mr: 1 }} color="primary" />
                    <Typography variant="h6" fontWeight="medium">
                      ملاحظات التسميع
                    </Typography>
                  </Box>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="أضف ملاحظاتك هنا..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* محتوى التسميع */}
          <Grid item xs={12} md={9}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >
              <Box 
                sx={{ 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isSessionStarted ? 'primary.light' : 'background.default'
                }}
              >
                <FormatQuoteIcon sx={{ mr: 1, transform: 'rotate(180deg)' }} color="primary" />
                <Typography variant="h6" color={isSessionStarted ? 'primary.dark' : 'inherit'}>
                  نص التسميع
                </Typography>
              </Box>
              
              <Box 
                sx={{ 
                  p: 4, 
                  backgroundColor: '#fdfdfd', 
                  direction: 'rtl',
                  position: 'relative',
                  minHeight: 400
                }}
              >
                {!isSessionStarted && (
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 1
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
                    <Typography variant="h6" color="primary" gutterBottom>
                      اضغط على "بدء التسميع" لتبدأ الجلسة
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      يمكنك النقر على الكلمات لتسجيل الأخطاء أثناء التسميع
                    </Typography>
                  </Box>
                )}                {currentSurah && currentAyahs.length > 0 ? (
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4,
                      borderRadius: 2, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Box 
                      className="uthmani-text"
                      sx={{ 
                        lineHeight: 2.5, 
                        textAlign: 'right',
                        fontSize: '1.8rem',
                        fontFamily: '"Amiri Quran", "KFGQPC Uthmanic Script HAFS", "Noto Naskh Arabic", serif',
                        letterSpacing: '0.5px',
                        wordSpacing: '6px',
                        direction: 'rtl'
                      }}
                    >
                      {currentAyahs.map((ayah, ayahIndex) => (
                        <Box key={ayah.number} component="span" sx={{ display: 'inline' }}>
                          {/* كلمات الآية */}
                          {ayah.words.map((wordObj, wordIndex) => (                            <Tooltip 
                              key={`${ayah.number}-${wordIndex}`} 
                              title={isSessionStarted ? `انقر لتحديد خطأ - ${wordObj.transliteration || ''}` : wordObj.transliteration || ""}
                              arrow
                              placement="top"
                            >
                              <Box
                                component="span"
                                onClick={(e) => handleWordClick(e, wordObj.text, wordIndex, ayah.number)}
                                className="uthmani-word"
                                sx={{ 
                                  color: getWordColor(wordObj.text, wordIndex, ayah.number),
                                  cursor: isSessionStarted ? 'pointer' : 'default',
                                  display: 'inline-block',
                                  margin: '1px 2px',
                                  padding: '4px 6px',
                                  borderRadius: 1,
                                  transition: 'all 0.2s ease',
                                  fontFamily: 'inherit',
                                  '&:hover': isSessionStarted ? {
                                    backgroundColor: 'rgba(30, 111, 142, 0.08)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                  } : {}
                                }}
                              >
                                {wordObj.text}
                              </Box>
                            </Tooltip>
                          ))}
                          
                          {/* رقم الآية - دائري مع تصميم جميل */}
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              border: '2px solid',
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              backgroundColor: 'background.paper',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              mx: 1.5,
                              my: 0.5,
                              fontFamily: 'Arial, sans-serif',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              verticalAlign: 'middle'
                            }}
                          >
                            {ayah.number}
                          </Box>
                          
                          {/* مسافة بين الآيات إذا لم تكن الآية الأخيرة */}
                          {ayahIndex < currentAyahs.length - 1 && (
                            <Box component="span" sx={{ display: 'inline-block', width: '12px' }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      لا توجد آيات متاحة لهذه السورة
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>      {/* قائمة أنواع الأخطاء السريعة */}
      <Popover
        open={isDialogOpen}
        anchorEl={anchorEl}
        onClose={() => {
          setIsDialogOpen(false);
          setAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'visible'
          }
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 2,
            minWidth: 280,
            bgcolor: 'background.paper'
          }}
        >
          {/* عرض الكلمة المحددة */}
          <Box sx={{ mb: 2, textAlign: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body1" fontWeight="bold" color="primary.main">
              "{selectedWord.word}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              الآية: {selectedWord.ayahIndex}
            </Typography>
          </Box>

          {/* أزرار أنواع الأخطاء */}
          <ButtonGroup
            orientation="vertical"
            variant="outlined"
            fullWidth
            sx={{ 
              '& .MuiButton-root': {
                justifyContent: 'flex-start',
                py: 1.5,
                px: 2,
                borderRadius: 2,
                mb: 1,
                textAlign: 'right',
                fontSize: '0.9rem',
                fontWeight: 500,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }
            }}
          >
            {errorTypes.map((type, index) => (
              <Button
                key={type.id}
                onClick={() => handleAddErrorType(type.id as 'حفظ' | 'تجويد' | 'نطق')}
                startIcon={React.cloneElement(type.icon, { sx: { color: `${type.color}.main` } })}
                color={type.color as 'error' | 'warning' | 'info'}
                sx={{
                  color: `${type.color}.main`,
                  borderColor: `${type.color}.light`,
                  '&:hover': {
                    borderColor: `${type.color}.main`,
                    bgcolor: `${type.color}.light`,
                    color: `${type.color}.dark`
                  }
                }}
              >
                {type.label}
              </Button>
            ))}
          </ButtonGroup>
        </Paper>
      </Popover>

      {/* نافذة النتيجة النهائية */}
      <Dialog 
        open={showScoreDialog} 
        onClose={() => setShowScoreDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              py: 3,
              px: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: 'url(/assets/quran-pattern.svg)',
                backgroundSize: 'cover'
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                نتائج جلسة التسميع
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                تم الانتهاء من جلسة {memorizationMode} لسورة {currentSurah.arabicName}
              </Typography>
            </Box>
          </Box>
        </Box>

        <DialogContent sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'background.default',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MenuBookIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="medium">
                      معلومات الجلسة
                    </Typography>
                  </Box>
                </Box>
                
                <CardContent>
                  <Box sx={{ my: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          الطالب
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedStudent.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          المستوى
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedStudent.level}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          السورة
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentSurah.arabicName}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          الآيات
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {fromAyah} - {toAyah}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          نوع الجلسة
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {memorizationMode}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          مدة الجلسة
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatTime(sessionTime)}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ملخص الأخطاء:
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        {errorTypes.map(type => (
                          <Grid item xs={4} key={type.id}>
                            <Box 
                              sx={{ 
                                p: 1.5, 
                                textAlign: 'center', 
                                borderRadius: 2,
                                bgcolor: `${type.color}.light`, 
                                color: `${type.color}.dark`
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium">
                                {type.label}
                              </Typography>
                              <Typography variant="h5">
                                {getErrorSummary(type.id)}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        الدرجة النهائية
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <CircularProgress
                          variant="determinate"
                          value={finalScore}
                          size={120}
                          thickness={5}
                          sx={{ 
                            color: finalScore >= 90 ? 'success.main' : 
                                  finalScore >= 70 ? 'primary.main' : 'warning.main',
                            stroke: 'rgba(0,0,0,0.05)'
                          }}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography
                            variant="h4"
                            component="div"
                            fontWeight="bold"
                            color={
                              finalScore >= 90 ? 'success.main' : 
                              finalScore >= 70 ? 'primary.main' : 'warning.main'
                            }
                          >
                            {finalScore}%
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'primary.light',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.dark' }} />
                    <Typography variant="h6" fontWeight="medium" color="primary.dark">
                      توصيات الذكاء الاصطناعي
                    </Typography>
                  </Box>
                </Box>
                
                <CardContent sx={{ position: 'relative', pt: 3, px: 3, pb: 2 }}>  
                  {isAnalyzing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                      <CircularProgress size={60} />
                      <Typography variant="body1" sx={{ mt: 3, mb: 1 }} fontWeight="medium">
                        جاري تحليل أداء الطالب...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        يتم معالجة بيانات الجلسة وإعداد التوصيات المناسبة
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" color="primary.dark" gutterBottom>
                          نقاط القوة والضعف
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                height: '100%',
                                borderRadius: 2,
                                bgcolor: 'success.light', 
                                borderColor: 'success.main' 
                              }}
                            >
                              <Typography variant="body2" color="success.dark" fontWeight="medium" gutterBottom>
                                نقاط القوة
                              </Typography>
                              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                {studentAnalytics[selectedStudent.id]?.strengths.slice(0, 2).map((str, idx) => (
                                  <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                                    {str}
                                  </Typography>
                                ))}
                              </Box>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                height: '100%',
                                borderRadius: 2,
                                bgcolor: 'warning.light', 
                                borderColor: 'warning.main' 
                              }}
                            >
                              <Typography variant="body2" color="warning.dark" fontWeight="medium" gutterBottom>
                                نقاط الضعف
                              </Typography>
                              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                {studentAnalytics[selectedStudent.id]?.weaknesses.slice(0, 2).map((str, idx) => (
                                  <Typography component="li" variant="body2" key={idx} sx={{ mb: 0.5 }}>
                                    {str}
                                  </Typography>
                                ))}
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    
                      <Typography variant="h6" color="primary.dark" gutterBottom>
                        التوصيات الخاصة بالجلسة
                      </Typography>
                      
                      {aiSuggestions.map((suggestion, index) => (
                        <Paper 
                          key={index} 
                          variant="outlined"
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: 2,
                            borderColor: index % 2 === 0 ? 'primary.light' : 'secondary.light',
                            borderLeft: '4px solid',
                            borderLeftColor: index % 2 === 0 ? 'primary.main' : 'secondary.main' 
                          }}
                        >
                          <Typography variant="body1">
                            {suggestion}
                          </Typography>
                        </Paper>
                      ))}
                      
                      {notes && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            <NotesIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            ملاحظات المعلم:
                          </Typography>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              bgcolor: 'background.default'
                            }}
                          >
                            <Typography variant="body2">
                              {notes}
                            </Typography>
                          </Paper>
                        </Box>
                      )}

                      <Box sx={{ textAlign: 'right', mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          <AutoAwesomeIcon fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          تحليل ذكي مدعوم بالذكاء الاصطناعي
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleSaveResults} 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            sx={{ 
              px: 4,
              py: 1
            }}
          >
            حفظ النتائج والعودة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemorizationSession;