// مكون إنشاء جلسة تسميع جديدة للمعلم
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  Divider,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  CircularProgress,
  useTheme,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GradeIcon from '@mui/icons-material/Grade';
import TimerIcon from '@mui/icons-material/Timer';
import NotesIcon from '@mui/icons-material/Notes';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { surahs } from '../data/quran';

// أنواع التسميع المتاحة
const RECITATION_TYPES = [
  'حفظ',
  'مراجعة صغرى', 
  'مراجعة كبرى',
  'تثبيت'
];

// أنواع الأخطاء المتاحة
const ERROR_TYPES = [
  { id: 'نسيان', label: 'نسيان', description: 'نسيان كلمة أو آية' },
  { id: 'إبدال', label: 'إبدال', description: 'استبدال كلمة بأخرى' },
  { id: 'تقديم وتأخير', label: 'تقديم وتأخير', description: 'تغيير ترتيب الكلمات' },
  { id: 'زيادة', label: 'زيادة', description: 'إضافة كلمة غير موجودة' },
  { id: 'نقصان', label: 'نقصان', description: 'حذف كلمة موجودة' },
  { id: 'لحن جلي', label: 'لحن جلي', description: 'خطأ في القراءة يؤثر على المعنى' },
  { id: 'لحن خفي', label: 'لحن خفي', description: 'خطأ في التجويد' }
];

// درجات التقييم
const EVALUATION_GRADES = [
  { value: 'ممتاز', label: 'ممتاز', minGrade: 9.0 },
  { value: 'جيد جداً', label: 'جيد جداً', minGrade: 8.0 },
  { value: 'جيد', label: 'جيد', minGrade: 7.0 },
  { value: 'مقبول', label: 'مقبول', minGrade: 6.0 },
  { value: 'ضعيف', label: 'ضعيف', minGrade: 0 }
];

interface RecitationError {
  error_type: string;
  surah_number: number;
  verse_number: number;
  error_description: string;
  correction: string;
}

const CreateRecitationSession: React.FC = () => {
  const navigate = useNavigate();
  const { selectedStudent, user, currentMosque } = useAppContext();
  const theme = useTheme();

  // حالات النموذج الأساسية
  const [sessionData, setSessionData] = useState({
    student_id: selectedStudent?.id || 1,
    teacher_id: user?.id || 1,
    quran_circle_id: selectedStudent?.circleId || 1,
    start_surah_number: 1,
    start_verse: 1,
    end_surah_number: 1,
    end_verse: 7,
    recitation_type: 'حفظ',
    duration_minutes: 30,
    grade: 10.0,
    evaluation: 'ممتاز',
    teacher_notes: ''
  });

  // حالات إدارة الأخطاء
  const [errors, setErrors] = useState<RecitationError[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [currentError, setCurrentError] = useState<RecitationError>({
    error_type: 'نسيان',
    surah_number: 1,
    verse_number: 1,
    error_description: '',
    correction: ''
  });

  // حالات واجهة المستخدم
  const [loading, setLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // التحقق من وجود طالب محدد
  useEffect(() => {
    if (!selectedStudent) {
      navigate('/students');
    }
  }, [selectedStudent, navigate]);

  // تحديث التقييم تلقائياً بناءً على الدرجة
  useEffect(() => {
    const grade = parseFloat(sessionData.grade.toString());
    let evaluation = 'ضعيف';
    
    for (const evalGrade of EVALUATION_GRADES) {
      if (grade >= evalGrade.minGrade) {
        evaluation = evalGrade.value;
        break;
      }
    }
    
    setSessionData(prev => ({ ...prev, evaluation }));
  }, [sessionData.grade]);

  // التعامل مع تغيير بيانات الجلسة
  const handleSessionDataChange = (field: string, value: any) => {
    setSessionData(prev => ({ ...prev, [field]: value }));
  };

  // إضافة خطأ جديد
  const handleAddError = () => {
    if (!currentError.error_description.trim()) {
      setSnackbarMessage('يرجى إدخال وصف الخطأ');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }

    setErrors(prev => [...prev, { ...currentError }]);
    setCurrentError({
      error_type: 'نسيان',
      surah_number: sessionData.start_surah_number,
      verse_number: sessionData.start_verse,
      error_description: '',
      correction: ''
    });
    setShowErrorDialog(false);
  };

  // حذف خطأ
  const handleDeleteError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  // إرسال بيانات الجلسة إلى API
  const handleSubmitSession = async () => {
    setLoading(true);
    
    try {      // إرسال بيانات الجلسة أولاً
      const sessionResponse = await fetch('https://inviting-pleasantly-barnacle.ngrok-free.app/api/recitation/sessions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(sessionData)
      });

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        throw new Error(`فشل في إنشاء الجلسة: ${errorText}`);
      }

      const sessionResult = await sessionResponse.json();
      const sessionId = sessionResult.data?.session_id || sessionResult.session_id;

      console.log('تم إنشاء الجلسة بنجاح:', sessionId);

      // إرسال الأخطاء إذا وجدت
      if (errors.length > 0 && sessionId) {
        for (const error of errors) {
          const errorData = {
            session_id: sessionId,
            ...error
          };          const errorResponse = await fetch('https://inviting-pleasantly-barnacle.ngrok-free.app/api/recitation/errors/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify(errorData)
          });

          if (!errorResponse.ok) {
            console.warn('فشل في إضافة خطأ:', error);
          }
        }
      }

      setSnackbarMessage('تم حفظ جلسة التسميع بنجاح!');
      setSnackbarSeverity('success');
      setShowSnackbar(true);

      // العودة إلى قائمة الطلاب بعد ثانيتين
      setTimeout(() => {
        navigate('/students');
      }, 2000);

    } catch (error) {
      console.error('خطأ في حفظ الجلسة:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'حدث خطأ في حفظ الجلسة');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStudent) {
    return (
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">لم يتم اختيار طالب</Typography>
          <Button onClick={() => navigate('/students')} sx={{ mt: 2 }}>
            العودة لقائمة الطلاب
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      {/* رأس الصفحة */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate('/students')} 
              sx={{ mr: 2, color: 'white' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" component="h1" fontWeight="bold">
                إنشاء جلسة تسميع جديدة
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                الطالب: {selectedStudent.name}
              </Typography>
            </Box>
          </Box>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: 'rgba(255,255,255,0.2)' 
            }}
          >
            <PersonIcon sx={{ fontSize: 30 }} />
          </Avatar>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* معلومات الطالب */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main', 
                  mx: 'auto', 
                  mb: 2 
                }}
              >
                {selectedStudent.name.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                {selectedStudent.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudent.level} • {selectedStudent.age} سنة
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    الدرجة الإجمالية
                  </Typography>
                  <Chip 
                    label={`${selectedStudent.totalScore}%`}
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    نسبة الحضور
                  </Typography>
                  <Chip 
                    label={`${selectedStudent.attendanceRate}%`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* نموذج إدخال الجلسة */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <MenuBookIcon sx={{ mr: 1 }} color="primary" />
                بيانات جلسة التسميع
              </Typography>

              <Grid container spacing={3}>
                {/* نوع التسميع */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>نوع التسميع</InputLabel>
                    <Select
                      value={sessionData.recitation_type}
                      label="نوع التسميع"
                      onChange={(e) => handleSessionDataChange('recitation_type', e.target.value)}
                    >
                      {RECITATION_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* مدة الجلسة */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="مدة الجلسة (دقيقة)"
                    value={sessionData.duration_minutes}
                    onChange={(e) => handleSessionDataChange('duration_minutes', parseInt(e.target.value) || 0)}
                    InputProps={{
                      startAdornment: <TimerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                {/* السورة الأولى */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>السورة الأولى</InputLabel>
                    <Select
                      value={sessionData.start_surah_number}
                      label="السورة الأولى"
                      onChange={(e) => handleSessionDataChange('start_surah_number', e.target.value)}
                    >
                      {surahs.map(surah => (
                        <MenuItem key={surah.id} value={surah.id}>
                          {surah.id}. {surah.arabicName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* الآية الأولى */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="الآية الأولى"
                    value={sessionData.start_verse}
                    onChange={(e) => handleSessionDataChange('start_verse', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                {/* السورة الأخيرة */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>السورة الأخيرة</InputLabel>
                    <Select
                      value={sessionData.end_surah_number}
                      label="السورة الأخيرة"
                      onChange={(e) => handleSessionDataChange('end_surah_number', e.target.value)}
                    >
                      {surahs.map(surah => (
                        <MenuItem key={surah.id} value={surah.id}>
                          {surah.id}. {surah.arabicName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* الآية الأخيرة */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="الآية الأخيرة"
                    value={sessionData.end_verse}
                    onChange={(e) => handleSessionDataChange('end_verse', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                {/* الدرجة */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="الدرجة (من 10)"
                    value={sessionData.grade}
                    onChange={(e) => handleSessionDataChange('grade', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 10, step: 0.25 }}
                    InputProps={{
                      startAdornment: <GradeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                {/* التقييم */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>التقييم</InputLabel>
                    <Select
                      value={sessionData.evaluation}
                      label="التقييم"
                      onChange={(e) => handleSessionDataChange('evaluation', e.target.value)}
                    >
                      {EVALUATION_GRADES.map(grade => (
                        <MenuItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* ملاحظات المعلم */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="ملاحظات المعلم"
                    value={sessionData.teacher_notes}
                    onChange={(e) => handleSessionDataChange('teacher_notes', e.target.value)}
                    placeholder="أضف ملاحظاتك حول أداء الطالب..."
                    InputProps={{
                      startAdornment: <NotesIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* قسم الأخطاء */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon sx={{ mr: 1 }} color="error" />
                  أخطاء التسميع ({errors.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowErrorDialog(true)}
                  size="small"
                >
                  إضافة خطأ
                </Button>
              </Box>

              {errors.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="body1" color="success.main">
                    لا توجد أخطاء في هذه الجلسة
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    أداء ممتاز من الطالب!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {errors.map((error, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        mb: 1
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteError(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <ErrorIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${error.error_type} - السورة ${error.surah_number}, الآية ${error.verse_number}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              الوصف: {error.error_description}
                            </Typography>
                            {error.correction && (
                              <Typography variant="body2" color="success.main">
                                التصحيح: {error.correction}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* أزرار العمليات */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/students')}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmitSession}
              disabled={loading}
              sx={{ minWidth: 140 }}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الجلسة'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* نافذة إضافة خطأ */}
      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة خطأ جديد</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>نوع الخطأ</InputLabel>
                <Select
                  value={currentError.error_type}
                  label="نوع الخطأ"
                  onChange={(e) => setCurrentError(prev => ({ ...prev, error_type: e.target.value }))}
                >
                  {ERROR_TYPES.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box>
                        <Typography variant="body1">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="رقم السورة"
                value={currentError.surah_number}
                onChange={(e) => setCurrentError(prev => ({ ...prev, surah_number: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1, max: 114 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="رقم الآية"
                value={currentError.verse_number}
                onChange={(e) => setCurrentError(prev => ({ ...prev, verse_number: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="وصف الخطأ"
                value={currentError.error_description}
                onChange={(e) => setCurrentError(prev => ({ ...prev, error_description: e.target.value }))}
                placeholder="وصف مفصل للخطأ..."
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="التصحيح (اختياري)"
                value={currentError.correction}
                onChange={(e) => setCurrentError(prev => ({ ...prev, correction: e.target.value }))}
                placeholder="الكلمة أو العبارة الصحيحة..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)}>إلغاء</Button>
          <Button onClick={handleAddError} variant="contained">إضافة الخطأ</Button>
        </DialogActions>
      </Dialog>

      {/* إشعار النجاح/الفشل */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateRecitationSession;
