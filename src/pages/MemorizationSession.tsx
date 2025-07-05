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
  Collapse,  TextField,
  InputAdornment,
  Badge,  Popover,
  ButtonGroup,
  useTheme,
  useMediaQuery
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
import StopIcon from '@mui/icons-material/Stop';
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
// إضافة استيراد خدمة API ✅
import { 
  createRecitationSession, 
  addRecitationErrors, 
  updateRecitationSession,
  CreateSessionData,
  AddErrorsData,
  RecitationError 
} from '../services/recitationService';
import '../styles/uthmani.css';

// أنواع الأخطاء في التسميع
const errorTypes = [
  { id: 'حفظ', label: 'خطأ حفظ', color: 'error', icon: <ErrorIcon /> },
  { id: 'تجويد', label: 'خطأ تجويد', color: 'warning', icon: <InfoIcon /> },
  { id: 'نطق', label: 'خطأ نطق', color: 'info', icon: <HighlightIcon /> }
];

const MemorizationSession: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudent, memorizationMode, setIsSessionActive, user } = useAppContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<UthmaniSurah | undefined>(
    uthmaniSurahs.find(s => s.arabicName === selectedStudent?.currentMemorization.surahName)
  );
  const [currentAyahs, setCurrentAyahs] = useState<UthmaniAyah[]>([]);
  const [fromAyah, setFromAyah] = useState(selectedStudent?.currentMemorization.fromAyah || 1);
  const [toAyah, setToAyah] = useState(selectedStudent?.currentMemorization.toAyah || 5);  const [errors, setErrors] = useState<MemorizationError[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedWord, setSelectedWord] = useState<{word: string, index: number, ayahIndex: number, surahId: number}>({word: '', index: 0, ayahIndex: 0, surahId: 0});
  const [selectedErrorType, setSelectedErrorType] = useState<'حفظ' | 'تجويد' | 'نطق'>('حفظ');  const [finalScore, setFinalScore] = useState(100);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);const [sessionTimer, setSessionTimer] = useState<NodeJS.Timer | null>(null);
  const [notes, setNotes] = useState('');
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  // إضافة الدرجة المقترحة من 10
  const [suggestedGrade, setSuggestedGrade] = useState<string | number>(8);  // ✅ إضافة متغيرات الحالة الجديدة للـ API
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingErrors, setIsSendingErrors] = useState(false);
  const [isSavingResults, setIsSavingResults] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);// التأكد من وجود طالب ونوع تسميع
  useEffect(() => {
    console.log('MemorizationSession useEffect - selectedStudent:', selectedStudent?.name);
    console.log('MemorizationSession useEffect - memorizationMode:', memorizationMode);
    
    if (!selectedStudent) {
      console.log('لا يوجد طالب محدد، الانتقال إلى صفحة الطلاب');
      navigate('/students');
      return;
    }

    if (!memorizationMode) {
      console.log('لا يوجد نوع تسميع محدد، الانتقال إلى خيارات التسميع');
      navigate('/memorization-options');
      return;
    }

    // تحميل السورة المناسبة بالرسم العثماني
    const curriculum = selectedStudent.currentMemorization;
    let surah;
    let allRequiredAyahs: any[] = [];
    
    if (curriculum.isMultipleSurahs && curriculum.startSurah && curriculum.endSurah) {
      // التعامل مع السور المتعددة
      console.log('📚 منهج متعدد السور:', curriculum.startSurah, 'إلى', curriculum.endSurah);
      
      const startSurah = uthmaniSurahs.find(s => s.arabicName === curriculum.startSurah);
      const endSurah = uthmaniSurahs.find(s => s.arabicName === curriculum.endSurah);
      
      if (!startSurah || !endSurah) {
        console.error('لم يتم العثور على إحدى السور:', curriculum.startSurah, curriculum.endSurah);
        navigate('/memorization-options');
        return;
      }
      
      // استخدام السورة الأولى كالسورة الحالية للعرض
      surah = startSurah;
      
      // جمع الآيات من جميع السور المطلوبة
      if (startSurah.id === endSurah.id) {
        // نفس السورة
        const allAyahs = getAyahsBySurahId(startSurah.id);
        allRequiredAyahs = allAyahs.filter(ayah => 
          ayah.number >= curriculum.fromAyah && 
          ayah.number <= curriculum.toAyah
        );
      } else {
        // سور متعددة
        for (let surahId = startSurah.id; surahId <= endSurah.id; surahId++) {
          const currentSurahAyahs = getAyahsBySurahId(surahId);
          const surahInfo = uthmaniSurahs.find(s => s.id === surahId);
          
          if (surahId === startSurah.id) {
            // السورة الأولى - من الآية المحددة إلى النهاية
            allRequiredAyahs.push(...currentSurahAyahs.filter(ayah => ayah.number >= curriculum.fromAyah));
          } else if (surahId === endSurah.id) {
            // السورة الأخيرة - من البداية إلى الآية المحددة
            allRequiredAyahs.push(...currentSurahAyahs.filter(ayah => ayah.number <= curriculum.toAyah));
          } else {
            // السور الوسطى - كاملة
            allRequiredAyahs.push(...currentSurahAyahs);
          }
        }
      }
    } else {
      // التعامل مع سورة واحدة (الطريقة القديمة)
      surah = uthmaniSurahs.find(s => s.arabicName === curriculum.surahName);
      if (!surah) {
        console.error('لم يتم العثور على السورة:', curriculum.surahName);
        navigate('/memorization-options');
        return;
      }
      
      // تحميل الآيات المطلوبة بالرسم العثماني
      const allAyahs = getAyahsBySurahId(surah.id);
      allRequiredAyahs = allAyahs.filter(ayah => 
        ayah.number >= curriculum.fromAyah && 
        ayah.number <= curriculum.toAyah
      );
    }
    
    if (!surah) {
      console.error('فشل في تحديد السورة');
      navigate('/memorization-options');
      return;
    }
    
    console.log('تم العثور على السورة:', surah.arabicName);
    setCurrentSurah(surah);
    
    if (allRequiredAyahs.length === 0) {
      console.error('لم يتم العثور على آيات للنطاق المحدد');
      navigate('/memorization-options');
      return;
    }
    
    console.log('تم تحميل الآيات:', allRequiredAyahs.length, 'آيات من', curriculum.isMultipleSurahs ? 'سور متعددة' : 'سورة واحدة');
    setCurrentAyahs(allRequiredAyahs);
    setFromAyah(selectedStudent.currentMemorization.fromAyah);
    setToAyah(selectedStudent.currentMemorization.toAyah);
    
    // تعيين الصفحة كجاهزة
    setIsPageReady(true);
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

  // منع تحديث الصفحة أثناء الجلسة النشطة
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isSessionStarted) {
        const message = 'جلسة التسميع نشطة! إذا أعدت تحميل الصفحة، قد تفقد بيانات الجلسة. هل تريد المتابعة؟';
        event.preventDefault();
        event.returnValue = message; // للمتصفحات الحديثة
        return message; // للمتصفحات القديمة
      }
    };

    if (isSessionStarted) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSessionStarted]);
  // بدء جلسة التسميع
  const handleStartSession = async () => {
    if (!selectedStudent || !currentSurah) return;
    
    setIsCreatingSession(true);
    setApiError(null);
    
    try {      // إعداد بيانات الجلسة الجديدة
      const curriculum = selectedStudent.currentMemorization;
      let startSurahNumber, endSurahNumber, startVerse, endVerse;
      
      if (curriculum.isMultipleSurahs && curriculum.startSurahNumber && curriculum.endSurahNumber) {
        // سور متعددة
        startSurahNumber = curriculum.startSurahNumber;
        endSurahNumber = curriculum.endSurahNumber;
        startVerse = curriculum.fromAyah;
        endVerse = curriculum.toAyah;
        console.log('📚 إنشاء جلسة لسور متعددة:', startSurahNumber, 'إلى', endSurahNumber);
      } else {
        // سورة واحدة
        startSurahNumber = currentSurah.id;
        endSurahNumber = currentSurah.id;
        startVerse = fromAyah;
        endVerse = toAyah;
        console.log('📖 إنشاء جلسة لسورة واحدة:', currentSurah.arabicName);
      }
      
      const sessionData: CreateSessionData = {
        student_id: parseInt(selectedStudent.id),
        teacher_id: parseInt(user?.id || '1'), // استخدام معرف المعلم الحقيقي من السياق
        quran_circle_id: 1, // TODO: استخدام معرف الحلقة الحقيقي
        start_surah_number: startSurahNumber,
        start_verse: startVerse,
        end_surah_number: endSurahNumber,
        end_verse: endVerse,
        recitation_type: memorizationMode || 'حفظ',
        duration_minutes: 1, // ✅ بدء الجلسة بمدة 1 دقيقة (رقم صحيح يلبي متطلبات الـ API)
        grade: 8.5, // ✅ استخدام درجة من النطاق المسموح (0-10)
        evaluation: 'جيد جداً', // ✅ استخدام تقييم من القيم المُختبرة
        teacher_notes: curriculum.isMultipleSurahs 
          ? `جلسة جديدة - بدء التسميع للنطاق: ${curriculum.surahName}`
          : 'جلسة جديدة - بدء التسميع'
      };
      
      console.log('🚀 إنشاء جلسة تسميع جديدة...', sessionData);
      console.log('⏱️ بدء الجلسة بمدة 1 دقيقة (ستُحدث بالوقت الفعلي عند الانتهاء)');
      
      // استدعاء API لإنشاء الجلسة
      const response = await createRecitationSession(sessionData);
      
      if (response.success) {
        setCurrentSessionId(response.data.session_id);
        console.log('✅ تم إنشاء الجلسة بنجاح:', response.data.session_id);
        
        // بدء الجلسة في الواجهة
        setIsSessionStarted(true);
        setIsSessionActive(true);
        setErrors([]);
        setSessionTime(0);
      } else {
        throw new Error('فشل في إنشاء الجلسة');
      }
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء جلسة التسميع:', error);
      setApiError('حدث خطأ في إنشاء جلسة التسميع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCreatingSession(false);
    }
  };
  // معالجة اختيار كلمة للإشارة لوجود خطأ
  const handleWordClick = (event: React.MouseEvent<HTMLElement>, word: string, wordIndex: number, ayahIndex: number, surahId: number) => {
    if (!isSessionStarted) return;
    
    setSelectedWord({ word, index: wordIndex, ayahIndex, surahId });
    setAnchorEl(event.currentTarget);
    setIsDialogOpen(true);
  };
  // إضافة خطأ
  const handleAddError = () => {
    const newError: MemorizationError = {
      type: selectedErrorType,
      wordIndex: selectedWord.index,
      word: selectedWord.word,
      ayahIndex: selectedWord.ayahIndex,
      surahId: selectedWord.surahId
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
  const handleAddErrorType = async (errorType: 'حفظ' | 'تجويد' | 'نطق') => {
    if (!currentSessionId || !currentSurah) {
      console.warn('⚠️ لا يمكن إضافة خطأ: معرف الجلسة أو السورة غير متوفر');
      return;
    }
    
    const newError: MemorizationError = {
      type: errorType,
      wordIndex: selectedWord.index,
      word: selectedWord.word,
      ayahIndex: selectedWord.ayahIndex,
      surahId: selectedWord.surahId
    };
    
    // إضافة الخطأ محلياً فوراً
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
    
    // إرسال الخطأ للـ API
    setIsSendingErrors(true);
    try {
      const apiError: RecitationError = {
        surah_number: selectedWord.surahId,
        verse_number: selectedWord.ayahIndex,
        word_text: selectedWord.word,
        error_type: errorType,
        correction_note: `خطأ ${errorType} في كلمة "${selectedWord.word}"`,
        teacher_note: `تم تسجيل خطأ ${errorType} أثناء التسميع`,
        is_repeated: false,
        severity_level: penalty >= 3 ? 'شديد' : penalty >= 2 ? 'متوسط' : 'خفيف'
      };
      
      const errorsData: AddErrorsData = {
        session_id: currentSessionId,
        errors: [apiError]
      };
      
      console.log('🚀 إرسال خطأ للـ API...', errorsData);
      console.log('📖 السورة:', selectedWord.surahId, 'الآية:', selectedWord.ayahIndex, 'الكلمة:', selectedWord.word);
      
      const response = await addRecitationErrors(errorsData);
      
      if (response.success) {
        console.log('✅ تم إرسال الخطأ بنجاح:', response.data);
      } else {
        console.error('❌ فشل في إرسال الخطأ');
      }
      
    } catch (error) {
      console.error('❌ خطأ في إرسال الخطأ للـ API:', error);
      // الخطأ محفوظ محلياً، لذلك لا نحتاج لإظهار رسالة خطأ للمستخدم
    } finally {
      setIsSendingErrors(false);
    }
  };

  // إنهاء جلسة التسميع
  const handleFinishSession = () => {
    setIsSessionStarted(false);
    // حساب الدرجة المقترحة من 10 بناءً على النسبة المئوية
    const calculatedGrade = Math.max(0, Math.round((finalScore / 100) * 10));
    setSuggestedGrade(calculatedGrade);
    setShowScoreDialog(true);
  };// حفظ النتائج والعودة لصفحة الطلاب
  const handleSaveResults = async () => {
    if (!currentSessionId) {
      console.warn('⚠️ لا يمكن حفظ النتائج: معرف الجلسة غير متوفر');
      setShowScoreDialog(false);
      setIsSessionActive(false);
      navigate('/students');
      return;
    }
    
    setIsSavingResults(true);
    
    try {      // استخدام الدرجة المقترحة التي يمكن تعديلها من قبل المعلم
      const gradeForAPI = Math.max(0, Math.min(10, typeof suggestedGrade === 'string' ? parseFloat(suggestedGrade) || 0 : suggestedGrade));      // حساب مدة الجلسة بالدقائق (تحويل من ثواني إلى دقائق) مع ضمان حد أدنى
      const calculatedDurationMinutes = Math.round(sessionTime / 60 * 100) / 100;
      const durationMinutes = Math.max(0.01, calculatedDurationMinutes); // ✅ ضمان حد أدنى 0.01 دقيقة لتوافق متطلبات الـ API
      console.log('🕐 Duration calculation:', {
        sessionTime,
        calculatedDurationMinutes,
        durationMinutes,
        sessionTimeMinutes: sessionTime / 60
      });
      
      // إعداد التقييم النصي بناءً على الدرجة المئوية
      let evaluation = '';
      if (finalScore >= 95) evaluation = 'ممتاز';
      else if (finalScore >= 85) evaluation = 'جيد جداً';
      else if (finalScore >= 75) evaluation = 'جيد';
      else if (finalScore >= 65) evaluation = 'مقبول';
      else evaluation = 'يحتاج تحسين';
      
      // إعداد ملاحظات المعلم
      const teacherNotes = notes || `جلسة ${memorizationMode} - عدد الأخطاء: ${errors.length} - النسبة المئوية: ${finalScore}% - المدة: ${durationMinutes} دقيقة`;
      
      const updateData = {
        grade: gradeForAPI, // الدرجة من 0-10
        evaluation: evaluation,
        teacher_notes: teacherNotes,
        duration_minutes: durationMinutes // ✅ إرسال مدة الجلسة المحسوبة
      };      console.log('🚀 حفظ النتائج النهائية...', updateData);
      console.log(`📊 تحويل الدرجة: ${finalScore}% -> ${gradeForAPI}/10`);
      console.log(`⏱️ حساب المدة: ${sessionTime} ثانية -> ${durationMinutes} دقيقة (بدقة عالية)`);      const response = await updateRecitationSession(currentSessionId, updateData);
        console.log('✅ تم حفظ النتائج بنجاح:', response);
      
      // إغلاق حوار النتائج والعودة للصفحة الرئيسية مع معامل الإشعار
      setShowScoreDialog(false);
      setIsSessionActive(false);
      navigate('/students', { 
        state: { 
          showSuccessNotification: true,
          message: 'تم حفظ نتائج التسميع بنجاح!' 
        } 
      });
        } catch (error) {
      console.error('❌ خطأ في حفظ النتائج:', error);
      setApiError('حدث خطأ في حفظ النتائج. ستتم العودة للصفحة الرئيسية.');
      
      // في حالة الخطأ، العودة فوراً
      setShowScoreDialog(false);
      setIsSessionActive(false);
      navigate('/students');
    } finally {
      setIsSavingResults(false);
    }
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
  if (!selectedStudent) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>جاري التحقق من بيانات الطالب...</Typography>
        <Typography variant="body2" color="text.secondary">يتم إعادة التوجيه إلى صفحة الطلاب</Typography>
      </Box>
    );
  }

  if (!memorizationMode) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>لم يتم تحديد نوع التسميع</Typography>
        <Typography variant="body2" color="text.secondary">يتم إعادة التوجيه إلى خيارات التسميع</Typography>
      </Box>
    );
  }

  if (!currentSurah) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>جاري تحميل السورة...</Typography>
        <Typography variant="body2" color="text.secondary">يتم تحضير نص التسميع</Typography>
      </Box>
    );
  }
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: isMobile ? 2 : 10,
        pb: isMobile ? 3 : 5,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth={isMobile ? "sm" : "lg"}>
        {/* رأس الصفحة */}
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 3, 
            mb: isMobile ? 2 : 4, 
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)'
              : 'linear-gradient(135deg, #4a9fbe 0%, #1e6f8e 100%)',
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
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            zIndex: 1,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-start'
          }}>
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
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                component="h1" 
                fontWeight="bold"
              >
                {isMobile ? selectedStudent.name : `جلسة ${memorizationMode}`}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8, 
                  mt: 0.5,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {isMobile 
                  ? `${memorizationMode} - ${currentSurah.arabicName} (${fromAyah}-${toAyah})`
                  : `سورة ${currentSurah.arabicName} - الآيات (${fromAyah} - ${toAyah})`
                }
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            zIndex: 1,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end'
          }}>
            <Chip 
              icon={<TimerIcon />} 
              label={formatTime(sessionTime)}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.15)',
                mr: isMobile ? 1 : 2,
                border: 'none',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }} 
            />            <Button
              variant="contained"
              color={isSessionStarted ? "error" : "success"}
              startIcon={isSessionStarted ? <PauseIcon /> : (isCreatingSession ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />)}
              onClick={isSessionStarted ? handleFinishSession : handleStartSession}
              disabled={isCreatingSession}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                px: 3,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 10px rgba(0,0,0,0.2)'
                }
              }}
            >
              {isCreatingSession ? "جاري الإنشاء..." : (isSessionStarted ? "إنهاء التسميع" : "بدء التسميع")}
            </Button>
          </Box>
        </Paper>
        
        {/* ✅ إضافة رسائل الخطأ وحالات التحميل */}
        {apiError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setApiError(null)}
          >
            {apiError}
          </Alert>
        )}
          {isSavingResults && (
          <Alert 
            severity="info" 
            icon={<CircularProgress size={20} />}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            جاري حفظ النتائج...
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* معلومات الطالب - مخفي في الجوال */}
          {!isMobile && (
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
                  }}                >
                  {selectedStudent.name ? selectedStudent.name.charAt(0) : '؟'}
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
                        </Box>                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight="bold">
                            {getErrorSummary(type.id)}
                          </Typography>
                          {/* ✅ مؤشر إرسال الأخطاء */}
                          {isSendingErrors && (
                            <CircularProgress 
                              size={16} 
                              sx={{ ml: 1, color: 'primary.main' }}
                            />
                          )}
                        </Box>
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
                              "{error.word}" - {getSurahById(error.surahId)?.arabicName || 'سورة غير معروفة'} آية: {error.ayahIndex}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </>
                )}              </Paper>
            </Stack>
          </Grid>
          )}

          {/* محتوى التسميع */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            >              <Box 
                sx={{ 
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: isSessionStarted 
                    ? (theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark')
                    : (theme.palette.mode === 'light' ? 'background.default' : 'background.paper'),
                  borderRadius: '12px 12px 0 0',
                  border: `1px solid ${theme.palette.divider}`,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <FormatQuoteIcon 
                  sx={{ 
                    mr: 1, 
                    transform: 'rotate(180deg)',
                    color: isSessionStarted ? 'primary.contrastText' : 'primary.main'
                  }} 
                />
                <Typography 
                  variant="h6" 
                  sx={{
                    color: isSessionStarted 
                      ? 'primary.contrastText'
                      : (theme.palette.mode === 'light' ? 'text.primary' : 'text.primary'),
                    fontWeight: 'medium'
                  }}
                >
                  نص التسميع
                </Typography>
              </Box><Box 
                sx={{ 
                  p: 4, 
                  backgroundColor: theme.palette.mode === 'light' 
                    ? '#fdfdfd' 
                    : theme.palette.background.default,
                  direction: 'rtl',
                  position: 'relative',
                  minHeight: 400,
                  borderRadius: '0 0 12px 12px',
                  border: `1px solid ${theme.palette.divider}`,
                  borderTop: 'none'
                }}
              >                {!isSessionStarted && (
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
                      bgcolor: theme.palette.mode === 'light' 
                        ? 'rgba(255, 255, 255, 0.85)' 
                        : 'rgba(17, 34, 64, 0.90)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: theme.palette.mode === 'light' 
                        ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
                        : '0 4px 20px rgba(0, 0, 0, 0.3)',
                      zIndex: 1
                    }}
                  >
                    {isCreatingSession ? (
                      <CircularProgress 
                        sx={{ 
                          fontSize: 60, 
                          color: 'primary.main', 
                          mb: 2,
                          filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'none'
                        }} 
                      />
                    ) : (
                      <IconButton
                        onClick={handleStartSession}
                        disabled={isCreatingSession}
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: 'transparent',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <PlayArrowIcon 
                          sx={{ 
                            fontSize: 60, 
                            color: 'primary.main',
                            filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'none'
                          }} 
                        />
                      </IconButton>
                    )}
                    <Typography 
                      variant="h6" 
                      color="primary" 
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.7)' : 'none'
                      }}
                    >
                      {isCreatingSession ? "جاري البدء..." : "اضغط على \"بدء التسميع\" لتبدأ الجلسة"}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        textAlign: 'center',
                        opacity: 0.9,
                        textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.7)' : 'none'
                      }}
                    >
                      يمكنك النقر على الكلمات لتسجيل الأخطاء أثناء التسميع
                    </Typography>
                  </Box>
                )}{currentSurah && currentAyahs.length > 0 ? (
                  <Paper 
                    elevation={theme.palette.mode === 'light' ? 0 : 2} 
                    sx={{ 
                      p: 4,
                      borderRadius: 2, 
                      bgcolor: theme.palette.mode === 'light' 
                        ? 'background.paper' 
                        : 'rgba(17, 34, 64, 0.6)',
                      border: '1px solid',
                      borderColor: theme.palette.mode === 'light' 
                        ? 'divider' 
                        : 'rgba(75, 159, 190, 0.2)',
                      backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : 'none',
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                        : 'none'
                    }}
                  >                    <Box 
                      className="uthmani-text text-balanced"
                      sx={{ 
                        fontSize: '1.8rem',
                        lineHeight: 2.8,
                        fontFamily: '"Amiri Quran", "KFGQPC Uthmanic Script HAFS", "Noto Naskh Arabic", serif',
                        direction: 'rtl',
                        color: theme.palette.mode === 'light' ? '#2c3e50' : '#b8c6db',
                        textAlign: 'justify',
                        textJustify: 'inter-word',
                        textAlignLast: 'justify',
                        wordSpacing: '0.25em',
                        letterSpacing: '0.01em',
                        '& *': {
                          color: 'inherit !important'
                        }
                      }}
                    >{currentAyahs.map((ayah, ayahIndex) => (
                        <Box key={`surah-${ayah.surahId}-ayah-${ayah.number}`} component="span" sx={{ display: 'inline' }}>
                          {/* كلمات الآية */}
                          {ayah.words.map((wordObj, wordIndex) => (
                            <Tooltip 
                              key={`surah-${ayah.surahId}-ayah-${ayah.number}-word-${wordIndex}`} 
                              title={isSessionStarted ? `انقر لتحديد خطأ - ${wordObj.transliteration || ''}` : wordObj.transliteration || ""}
                              arrow
                              placement="top"
                            >
                              <Box
                                component="span"
                                onClick={(e) => handleWordClick(e, wordObj.text, wordIndex, ayah.number, ayah.surahId)}
                                className="uthmani-word"
                                sx={{ 
                                  color: getWordColor(wordObj.text, wordIndex, ayah.number),
                                  '& *': {
                                    color: 'inherit !important'
                                  },
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
                              color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.light',
                              backgroundColor: theme.palette.mode === 'light' 
                                ? 'background.paper' 
                                : 'rgba(17, 34, 64, 0.9)',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              mx: 1.5,
                              my: 0.5,
                              fontFamily: 'Arial, sans-serif',
                              boxShadow: theme.palette.mode === 'light' 
                                ? '0 1px 3px rgba(0,0,0,0.1)' 
                                : '0 2px 6px rgba(0,0,0,0.4)',
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
                  </Paper>                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      لا توجد آيات متاحة لهذه السورة
                    </Typography>
                  </Box>
                )}                {/* زر إنهاء الجلسة أسفل الآيات - يظهر فقط أثناء التسميع */}
                {isSessionStarted && (
                  <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<StopIcon />}
                      onClick={handleFinishSession}
                      sx={{ 
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        fontSize: '0.9rem',
                        fontWeight: 'medium',
                        minWidth: 160,
                        boxShadow: theme.palette.mode === 'light' 
                          ? '0 2px 8px rgba(244, 67, 54, 0.25)' 
                          : '0 2px 10px rgba(244, 67, 54, 0.3)',
                        '&:hover': {
                          boxShadow: theme.palette.mode === 'light' 
                            ? '0 4px 12px rgba(244, 67, 54, 0.35)' 
                            : '0 4px 14px rgba(244, 67, 54, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      إنهاء التسميع
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.75rem' }}>
                      اضغط عند الانتهاء
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>{/* قائمة أنواع الأخطاء السريعة */}
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

      {/* نافذة النتيجة النهائية - محسنة للجوال */}
      <Dialog 
        open={showScoreDialog} 
        onClose={() => setShowScoreDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            m: isMobile ? 0 : 2
          }
        }}
      >
        {/* رأس مبسط للجوال */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: isMobile ? 2 : 3,
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
              نتائج التسميع
            </Typography>
            {!isMobile && (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {memorizationMode} • {currentSurah.arabicName}
              </Typography>
            )}
          </Box>
        </Box>        {/* المحتوى المحسن والمضغوط */}
        <DialogContent sx={{ p: isMobile ? 2 : 4, pb: isMobile ? 1 : 3 }}>
          {/* الدرجة النهائية - في المقدمة */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              الدرجة النهائية
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <CircularProgress
                variant="determinate"
                value={finalScore}
                size={isMobile ? 100 : 120}
                thickness={6}
                sx={{ 
                  color: finalScore >= 90 ? 'success.main' : 
                        finalScore >= 70 ? 'primary.main' : 'warning.main'
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
                  variant={isMobile ? "h5" : "h4"}
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

          {/* معلومات سريعة في صف واحد */}
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 1.5, 
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.800', 
                borderRadius: 2, 
                textAlign: 'center' 
              }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  الطالب
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedStudent.name}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 1.5, 
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.800', 
                borderRadius: 2, 
                textAlign: 'center' 
              }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  المدة
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatTime(sessionTime)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 1.5, 
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.800', 
                borderRadius: 2, 
                textAlign: 'center' 
              }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  السورة
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {currentSurah.arabicName}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ 
                p: 1.5, 
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.800', 
                borderRadius: 2, 
                textAlign: 'center' 
              }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  الآيات
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {fromAyah} - {toAyah}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* ملخص الأخطاء مضغوط */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
              ملخص الأخطاء ({errors.length})
            </Typography>
            <Grid container spacing={1}>
              {errorTypes.map(type => (
                <Grid item xs={4} key={type.id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 1, 
                      textAlign: 'center', 
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'light' ? `${type.color}.light` : `${type.color}.dark`,
                      border: '1px solid',
                      borderColor: `${type.color}.main`
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color={theme.palette.mode === 'light' ? `${type.color}.dark` : `${type.color}.light`} 
                      fontWeight="medium" 
                      display="block"
                    >
                      {type.label}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={theme.palette.mode === 'light' ? `${type.color}.dark` : `${type.color}.light`} 
                      fontWeight="bold"
                    >
                      {getErrorSummary(type.id)}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ملاحظات المعلم مبسطة */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
              ملاحظات المعلم
            </Typography>
            <TextField
              multiline
              rows={isMobile ? 2 : 3}
              fullWidth
              placeholder="أضف ملاحظاتك هنا..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  bgcolor: 'background.paper'
                }
              }}
            />
          </Box>
        </DialogContent>
        
        {/* منطقة الإجراءات المحسنة */}
        <DialogActions sx={{ 
          p: isMobile ? 2 : 3, 
          pt: isMobile ? 1 : 2,
          flexDirection: 'column', 
          gap: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: isMobile ? (theme.palette.mode === 'light' ? 'grey.50' : 'grey.800') : 'transparent'
        }}>
          {/* الدرجة المقترحة - مربع مميز */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2,
              width: '100%',
              bgcolor: theme.palette.mode === 'light' ? 'primary.light' : 'primary.dark',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.main'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GradeIcon sx={{ 
                  color: theme.palette.mode === 'light' ? 'primary.main' : 'primary.light', 
                  fontSize: 20 
                }} />
                <Typography 
                  variant="body2" 
                  color={theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light'}
                  fontWeight="medium"
                  sx={{ fontSize: isMobile ? '0.875rem' : '0.9rem' }}
                >
                  يقترح النظام درجة:
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                  type="number"
                  value={suggestedGrade}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setSuggestedGrade('');
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setSuggestedGrade(Math.max(0, Math.min(10, numValue)));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // التأكد من وجود قيمة صالحة عند ترك الحقل
                    if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                      setSuggestedGrade(Math.round((finalScore / 10) * 2) / 2);
                    }
                  }}
                  inputProps={{ 
                    min: 0, 
                    max: 10,
                    step: 0.5,
                    inputMode: 'decimal'
                  }}
                  size="small"
                  sx={{ 
                    width: 70,
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      bgcolor: theme.palette.mode === 'light' ? 'white' : 'background.paper',
                      borderRadius: 1.5,
                      '& input': {
                        textAlign: 'center',
                        py: 0.5
                      }
                    }
                  }}
                />
                <Typography 
                  variant="body2" 
                  color={theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light'}
                  fontWeight="medium"
                  sx={{ fontSize: isMobile ? '0.875rem' : '0.9rem' }}
                >
                  / 10
                </Typography>
              </Box>
            </Box>
            
            {isMobile && (
              <Typography 
                variant="caption" 
                color={theme.palette.mode === 'light' ? 'primary.dark' : 'primary.light'}
                sx={{ 
                  display: 'block',
                  textAlign: 'center',
                  mt: 1,
                  fontSize: '0.7rem',
                  opacity: 0.8
                }}
              >
                يمكنك تعديل الدرجة حسب تقديرك
              </Typography>
            )}
          </Paper>
          
          {/* زر الحفظ */}
          <Button 
            onClick={handleSaveResults} 
            variant="contained" 
            color="primary"
            size="large"
            startIcon={isSavingResults ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={isSavingResults}
            sx={{ 
              width: '100%',
              py: isMobile ? 1.5 : 1.2,
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '0.95rem',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:active': {
                transform: 'translateY(0)'
              }
            }}
          >
            {isSavingResults ? "جاري الحفظ..." : "حفظ النتائج والعودة"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemorizationSession;