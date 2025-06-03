import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  Bookmark,
  Share,
  InfoOutlined,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  UthmaniSurah,
  UthmaniAyah,
  UthmaniWord,
  getSurahById,
  getAyahsBySurahId,
} from '../data/quran-uthmani';

// تنسيق خاص للنص العثماني
const UthmaniText = styled(Typography)(({ theme }) => ({
  fontFamily: 'KFGQPC Uthmanic Script HAFS, Arial, sans-serif',
  fontSize: '28px',
  lineHeight: 2.2,
  textAlign: 'right',
  direction: 'rtl',
  color: theme.palette.text.primary,
  '&.highlighted': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: '4px',
    padding: '2px 4px',
  },
}));

const WordChip = styled(Chip)(({ theme }) => ({
  margin: '2px',
  fontFamily: 'KFGQPC Uthmanic Script HAFS, Arial, sans-serif',
  fontSize: '20px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  '&.selected': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const SurahHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  textAlign: 'center',
}));

interface UthmaniReaderProps {
  surahId: number;
  ayahNumber?: number;
  showWordBreakdown?: boolean;
  onWordClick?: (word: UthmaniWord, ayah: UthmaniAyah) => void;
}

const UthmaniReader: React.FC<UthmaniReaderProps> = ({
  surahId,
  ayahNumber,
  showWordBreakdown = true,
  onWordClick,
}) => {
  const [selectedWord, setSelectedWord] = useState<UthmaniWord | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const surah = getSurahById(surahId);
  const ayahs = getAyahsBySurahId(surahId);
  const displayAyahs = ayahNumber ? ayahs.filter(ayah => ayah.number === ayahNumber) : ayahs;

  const handleWordClick = useCallback((word: UthmaniWord, ayah: UthmaniAyah) => {
    setSelectedWord(word);
    onWordClick?.(word, ayah);
  }, [onWordClick]);

  const handleAyahClick = useCallback((ayahNum: number) => {
    setSelectedAyah(selectedAyah === ayahNum ? null : ayahNum);
  }, [selectedAyah]);

  if (!surah) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="error">
          السورة غير موجودة
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* رأس السورة */}
      <SurahHeader elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {surah.nameArabic}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {surah.englishName}
        </Typography>
        <Box mt={1} display="flex" justifyContent="center" gap={1}>
          <Chip
            label={surah.type === 'meccan' ? 'مكية' : 'مدنية'}
            size="small"
            color="secondary"
          />
          <Chip
            label={`${surah.totalAyahs} آية`}
            size="small"
            color="secondary"
          />
        </Box>
      </SurahHeader>

      {/* الآيات */}
      <Grid container spacing={2}>
        {displayAyahs.map((ayah) => (
          <Grid item xs={12} key={ayah.number}>
            <Card 
              elevation={selectedAyah === ayah.number ? 3 : 1}
              sx={{ 
                border: selectedAyah === ayah.number ? 2 : 0,
                borderColor: 'primary.main',
                transition: 'all 0.3s ease',
              }}
            >
              <CardContent>
                {/* رقم الآية وأدوات التحكم */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip 
                    label={ayah.number} 
                    color="primary" 
                    size="small"
                    onClick={() => handleAyahClick(ayah.number)}
                  />
                  <Box>
                    <Tooltip title="تشغيل">
                      <IconButton 
                        size="small" 
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="إضافة إلى المفضلة">
                      <IconButton size="small">
                        <Bookmark />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="مشاركة">
                      <IconButton size="small">
                        <Share />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* النص العثماني */}
                <UthmaniText paragraph>
                  {ayah.textUthmani}
                </UthmaniText>

                {/* تقسيم الكلمات (اختياري) */}
                {showWordBreakdown && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                      الكلمات:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="flex-end">
                      {ayah.words.map((word, index) => (
                        <WordChip
                          key={`${ayah.number}-${index}`}
                          label={word.text}
                          variant={selectedWord?.text === word.text ? "filled" : "outlined"}
                          className={selectedWord?.text === word.text ? "selected" : ""}
                          onClick={() => handleWordClick(word, ayah)}
                        />
                      ))}
                    </Box>
                  </>
                )}

                {/* الترجمة (إن وجدت) */}
                {ayah.translation && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left', direction: 'ltr' }}>
                      {ayah.translation}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* معلومات الكلمة المحددة */}
      {selectedWord && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            p: 2, 
            maxWidth: 300,
            bgcolor: 'background.paper',
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <InfoOutlined color="primary" />
            <Typography variant="h6">معلومات الكلمة</Typography>
          </Box>
          <UthmaniText variant="h5" gutterBottom>
            {selectedWord.text}
          </UthmaniText>
          <Typography variant="body2" color="text.secondary">
            الموضع: {selectedWord.position}
          </Typography>
          {selectedWord.transliteration && (
            <Typography variant="body2" color="text.secondary">
              النطق: {selectedWord.transliteration}
            </Typography>
          )}
          {selectedWord.meaning && (
            <Typography variant="body2" color="text.secondary">
              المعنى: {selectedWord.meaning}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UthmaniReader;
