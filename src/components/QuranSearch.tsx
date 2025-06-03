import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  InputAdornment,
  IconButton,
  Collapse,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Clear,
  ExpandMore,
  ExpandLess,
  BookmarkBorder,
  VolumeUp,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  searchInQuran,
  UthmaniSurah,
  UthmaniAyah,
  quranStats,
} from '../data/quran-uthmani';

const SearchContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ResultItem = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    elevation: 3,
    backgroundColor: theme.palette.action.hover,
  },
}));

const UthmaniResultText = styled(Typography)(({ theme }) => ({
  fontFamily: 'KFGQPC Uthmanic Script HAFS, Arial, sans-serif',
  fontSize: '24px',
  lineHeight: 2,
  textAlign: 'right',
  direction: 'rtl',
  color: theme.palette.text.primary,
  '& .highlight': {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    borderRadius: '4px',
    padding: '2px 4px',
    fontWeight: 'bold',
  },
}));

interface SearchResult {
  surah: UthmaniSurah;
  ayah: UthmaniAyah;
}

interface QuranSearchProps {
  onResultClick?: (surah: UthmaniSurah, ayah: UthmaniAyah) => void;
  maxResults?: number;
}

const QuranSearch: React.FC<QuranSearchProps> = ({
  onResultClick,
  maxResults = 50,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  // تسليط الضوء على النص المطابق
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }, []);

  // البحث في القرآن
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // محاكاة التأخير للبحث (للتجربة)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const results = searchInQuran(query.trim());
      setSearchResults(results.slice(0, maxResults));
    } catch (error) {
      console.error('خطأ في البحث:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [maxResults]);

  // التعامل مع تغيير النص
  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    handleSearch(query);
  }, [handleSearch]);

  // مسح البحث
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setExpandedResults(new Set());
  }, []);

  // توسيع/طي النتيجة
  const toggleExpanded = useCallback((resultId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resultId)) {
        newSet.delete(resultId);
      } else {
        newSet.add(resultId);
      }
      return newSet;
    });
  }, []);

  // معلومات إحصائية
  const searchStats = useMemo(() => {
    if (!searchQuery.trim() || searchResults.length === 0) return null;
    
    const surahIds = new Set(searchResults.map(r => r.surah.id));
    return {
      totalResults: searchResults.length,
      surahs: surahIds.size,
      hasMore: searchResults.length === maxResults,
    };
  }, [searchResults, searchQuery, maxResults]);

  return (
    <Box>
      {/* حقل البحث */}
      <SearchContainer elevation={2}>
        <TextField
          fullWidth
          placeholder="ابحث في القرآن الكريم..."
          value={searchQuery}
          onChange={handleQueryChange}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isSearching ? <CircularProgress size={20} /> : <Search />}
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '18px',
              direction: 'rtl',
            },
          }}
        />
        
        {/* إحصائيات سريعة */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label={`${quranStats.totalSurahs} سورة`} 
            size="small" 
            variant="outlined"
          />
          <Chip 
            label={`${quranStats.totalAyahs} آية`} 
            size="small" 
            variant="outlined"
          />
          <Chip 
            label={`${quranStats.meccanSurahs} مكية`} 
            size="small" 
            variant="outlined"
          />
          <Chip 
            label={`${quranStats.medinanSurahs} مدنية`} 
            size="small" 
            variant="outlined"
          />
        </Box>
      </SearchContainer>

      {/* إحصائيات البحث */}
      {searchStats && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            تم العثور على <strong>{searchStats.totalResults}</strong> نتيجة 
            في <strong>{searchStats.surahs}</strong> سورة
            {searchStats.hasMore && ' (عرض أول 50 نتيجة)'}
          </Typography>
        </Alert>
      )}

      {/* نتائج البحث */}
      {searchResults.length > 0 && (
        <List sx={{ p: 0 }}>
          {searchResults.map((result, index) => {
            const resultId = `${result.surah.id}-${result.ayah.number}`;
            const isExpanded = expandedResults.has(resultId);
            
            return (
              <ResultItem key={resultId} elevation={1}>
                <ListItemButton
                  onClick={() => {
                    toggleExpanded(resultId);
                    onResultClick?.(result.surah, result.ayah);
                  }}
                  sx={{ p: 0 }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" gap={1} alignItems="center">
                          <Chip
                            label={`${result.surah.arabicName} - ${result.ayah.number}`}
                            color="primary"
                            size="small"
                          />
                          <Chip
                            label={result.surah.type === 'meccan' ? 'مكية' : 'مدنية'}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton size="small">
                            <BookmarkBorder />
                          </IconButton>
                          <IconButton size="small">
                            <VolumeUp />
                          </IconButton>
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <UthmaniResultText
                        dangerouslySetInnerHTML={{
                          __html: highlightText(result.ayah.textUthmani, searchQuery)
                        }}
                      />
                    }
                  />
                </ListItemButton>

                <Collapse in={isExpanded}>
                  <Box pt={2}>
                    <Divider sx={{ mb: 2 }} />
                    
                    {/* معلومات إضافية */}
                    <Box display="flex" gap={2} mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>السورة:</strong> {result.surah.englishName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>النوع:</strong> {result.surah.type === 'meccan' ? 'مكية' : 'مدنية'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>عدد الآيات:</strong> {result.surah.totalAyahs}
                      </Typography>
                    </Box>

                    {/* الكلمات */}
                    <Typography variant="subtitle2" gutterBottom>
                      كلمات الآية:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="flex-end">
                      {result.ayah.words.map((word, wordIndex) => (
                        <Chip
                          key={`${resultId}-word-${wordIndex}`}
                          label={word.text}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontFamily: 'KFGQPC Uthmanic Script HAFS, Arial, sans-serif',
                            fontSize: '16px',
                          }}
                        />
                      ))}
                    </Box>

                    {/* الترجمة */}
                    {result.ayah.translation && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          الترجمة:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ textAlign: 'left', direction: 'ltr' }}
                        >
                          {result.ayah.translation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </ResultItem>
            );
          })}
        </List>
      )}

      {/* رسالة عدم وجود نتائج */}
      {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لم يتم العثور على نتائج
          </Typography>
          <Typography variant="body2" color="text.secondary">
            جرب البحث بكلمات أخرى أو تأكد من الإملاء
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default QuranSearch;
