import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Grid,
  Paper,
  Divider,
  Chip,
  IconButton,
  Alert,
  Fade,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { surahs } from '../data/quran';
import { uthmaniSurahs } from '../data/quran-uthmani';

interface CurriculumEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (curriculum: { surahName: string; fromAyah: number; toAyah: number }) => void;
  currentCurriculum: {
    surahName: string;
    fromAyah: number;
    toAyah: number;
  };
  studentName: string;
}

const CurriculumEditor: React.FC<CurriculumEditorProps> = ({
  open,
  onClose,
  onSave,
  currentCurriculum,
  studentName
}) => {
  const theme = useTheme();
  const [selectedSurah, setSelectedSurah] = useState(currentCurriculum.surahName);
  const [fromAyah, setFromAyah] = useState(currentCurriculum.fromAyah);
  const [toAyah, setToAyah] = useState(currentCurriculum.toAyah);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  // العثور على السورة المحددة
  const currentSurah = uthmaniSurahs.find(s => s.arabicName === selectedSurah) || 
                     surahs.find(s => s.arabicName === selectedSurah);

  // إعادة تعيين القيم عند فتح النافذة
  useEffect(() => {
    if (open) {
      setSelectedSurah(currentCurriculum.surahName);
      setFromAyah(currentCurriculum.fromAyah);
      setToAyah(currentCurriculum.toAyah);
      setIsValid(true);
      setValidationMessage('');
    }
  }, [open, currentCurriculum]);

  // التحقق من صحة المدخلات
  useEffect(() => {
    if (!currentSurah) {
      setIsValid(false);
      setValidationMessage('يرجى اختيار سورة صحيحة');
      return;
    }

    if (fromAyah < 1 || toAyah < 1) {
      setIsValid(false);
      setValidationMessage('رقم الآية يجب أن يكون أكبر من صفر');
      return;
    }

    if (fromAyah > currentSurah.totalAyahs || toAyah > currentSurah.totalAyahs) {
      setIsValid(false);
      setValidationMessage(`السورة تحتوي على ${currentSurah.totalAyahs} آية فقط`);
      return;
    }

    if (fromAyah > toAyah) {
      setIsValid(false);
      setValidationMessage('رقم الآية الأولى يجب أن يكون أقل من أو يساوي رقم الآية الأخيرة');
      return;
    }

    const ayahRange = toAyah - fromAyah + 1;
    if (ayahRange > 20) {
      setIsValid(false);
      setValidationMessage('نطاق الآيات كبير جداً. يُفضل ألا يتجاوز 20 آية');
      return;
    }

    setIsValid(true);
    setValidationMessage('');
  }, [selectedSurah, fromAyah, toAyah, currentSurah]);

  const handleSurahChange = (surahName: string) => {
    setSelectedSurah(surahName);
    // إعادة تعيين الآيات إلى القيم الافتراضية
    setFromAyah(1);
    setToAyah(Math.min(5, uthmaniSurahs.find(s => s.arabicName === surahName)?.totalAyahs || 5));
  };

  const handleSave = () => {
    if (isValid) {
      onSave({
        surahName: selectedSurah,
        fromAyah,
        toAyah
      });
      onClose();
    }
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
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          background: theme.palette.mode === 'light' 
            ? 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)'
            : 'linear-gradient(135deg, #4a9fbe 0%, #1e6f8e 100%)',
          color: 'white',
          py: 3,
          position: 'relative'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon sx={{ mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                تعديل منهج الحفظ
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                للطالب: {studentName}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : 'rgba(255,255,255,0.05)',
              borderColor: 'primary.light'
            }}
          >
            <Typography variant="subtitle1" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MenuBookIcon sx={{ mr: 1, fontSize: 20 }} />
              المنهج الحالي
            </Typography>
            <Chip 
              label={`${currentCurriculum.surahName} (الآيات ${currentCurriculum.fromAyah}-${currentCurriculum.toAyah})`}
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
          المنهج الجديد
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>اختر السورة</InputLabel>
              <Select
                value={selectedSurah}
                label="اختر السورة"
                onChange={(e) => handleSurahChange(e.target.value)}
              >
                {uthmaniSurahs.map((surah) => (
                  <MenuItem key={surah.id} value={surah.arabicName}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography>
                        {surah.arabicName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({surah.totalAyahs} آية)
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="من الآية"
              type="number"
              fullWidth
              value={fromAyah}
              onChange={(e) => setFromAyah(parseInt(e.target.value) || 1)}
              inputProps={{ 
                min: 1, 
                max: currentSurah?.totalAyahs || 1 
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="إلى الآية"
              type="number"
              fullWidth
              value={toAyah}
              onChange={(e) => setToAyah(parseInt(e.target.value) || 1)}
              inputProps={{ 
                min: fromAyah, 
                max: currentSurah?.totalAyahs || 1 
              }}
            />
          </Grid>
        </Grid>

        {currentSurah && (
          <Box sx={{ mt: 3 }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: 'background.default'
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                معاينة المنهج الجديد:
              </Typography>
              <Typography variant="body1" color="primary.main" fontWeight="medium">
                سورة {selectedSurah} من الآية {fromAyah} إلى الآية {toAyah}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                عدد الآيات: {toAyah - fromAyah + 1} آية
              </Typography>
            </Paper>
          </Box>
        )}

        {!isValid && (
          <Fade in={!isValid}>
            <Alert 
              severity="warning" 
              sx={{ mt: 2 }}
              icon={false}
            >
              {validationMessage}
            </Alert>
          </Fade>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          إلغاء
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={!isValid}
          startIcon={isValid ? <SaveIcon /> : undefined}
          sx={{
            background: isValid 
              ? 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)'
              : undefined,
            '&:hover': isValid ? {
              background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)'
            } : undefined
          }}
        >
          {isValid ? 'حفظ التغييرات' : 'يرجى تصحيح الأخطاء'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CurriculumEditor;
