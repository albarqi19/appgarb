import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search,
  MenuBook,
  Bookmark,
  History,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import UthmaniReader from '../components/UthmaniReader';
import QuranSearch from '../components/QuranSearch';
import FontTest from '../components/FontTest';
import {
  uthmaniSurahs,
  UthmaniSurah,
  UthmaniAyah,
  UthmaniWord,
  getSurahsByType,
} from '../data/quran-uthmani';

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const SurahListContainer = styled(Paper)(({ theme }) => ({
  height: '70vh',
  overflow: 'auto',
  padding: theme.spacing(1),
}));

const SurahListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiChip-root': {
      backgroundColor: theme.palette.primary.contrastText,
      color: theme.palette.primary.main,
    },
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`quran-tabpanel-${index}`}
      aria-labelledby={`quran-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const QuranPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSurah, setSelectedSurah] = useState<UthmaniSurah | null>(null);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [surahFilter, setSurahFilter] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState<UthmaniSurah[]>([]);

  // فلترة السور حسب البحث
  const filteredSurahs = uthmaniSurahs.filter(surah =>
    surah.arabicName.includes(surahFilter) ||
    surah.englishName.toLowerCase().includes(surahFilter.toLowerCase()) ||
    surah.id.toString().includes(surahFilter)
  );

  const meccanSurahs = getSurahsByType('meccan');
  const medinanSurahs = getSurahsByType('medinan');

  // التعامل مع اختيار السورة
  const handleSurahSelect = useCallback((surah: UthmaniSurah) => {
    setSelectedSurah(surah);
    setSelectedAyah(null);
    setSelectedTab(0); // الانتقال إلى تبويب القراءة
    
    // إضافة إلى المشاهدة الأخيرة
    setRecentlyViewed(prev => {
      const filtered = prev.filter(s => s.id !== surah.id);
      return [surah, ...filtered].slice(0, 5);
    });
  }, []);

  // التعامل مع البحث في القرآن
  const handleSearchResult = useCallback((surah: UthmaniSurah, ayah: UthmaniAyah) => {
    setSelectedSurah(surah);
    setSelectedAyah(ayah.number);
    setSelectedTab(0);
  }, []);

  // التعامل مع النقر على الكلمة
  const handleWordClick = useCallback((word: UthmaniWord, ayah: UthmaniAyah) => {
    console.log('تم النقر على الكلمة:', word.text, 'في الآية:', ayah.number);
    // يمكن إضافة وظائف إضافية هنا مثل إظهار التفسير أو المعنى
  }, []);

  return (
    <PageContainer>
      <Grid container spacing={2}>
        {/* الشريط الجانبي - قائمة السور */}
        <Grid item xs={12} md={4} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                سور القرآن الكريم
              </Typography>
              
              {/* بحث السور */}
              <TextField
                fullWidth
                placeholder="ابحث عن سورة..."
                value={surahFilter}
                onChange={(e) => setSurahFilter(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              {/* إحصائيات سريعة */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={`${meccanSurahs.length} مكية`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
                <Chip 
                  label={`${medinanSurahs.length} مدنية`} 
                  size="small" 
                  color="secondary"
                  variant="outlined"
                />
              </Box>

              {/* قائمة السور */}
              <SurahListContainer>
                <List dense>
                  {filteredSurahs.map((surah) => (
                    <ListItem key={surah.id} disablePadding>
                      <SurahListItem
                        className={selectedSurah?.id === surah.id ? 'selected' : ''}
                        onClick={() => handleSurahSelect(surah)}
                      >
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {surah.arabicName}
                              </Typography>
                              <Chip 
                                label={surah.id} 
                                size="small"
                                color="default"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {surah.englishName}
                              </Typography>
                              <Box display="flex" gap={1} mt={0.5}>
                                <Chip
                                  label={surah.type === 'meccan' ? 'مكية' : 'مدنية'}
                                  size="small"
                                  color={surah.type === 'meccan' ? 'primary' : 'secondary'}
                                  variant="outlined"
                                />
                                <Chip
                                  label={`${surah.totalAyahs} آية`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </SurahListItem>
                    </ListItem>
                  ))}
                </List>
              </SurahListContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* المحتوى الرئيسي */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2 }}>
            {/* التبويبات */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
                <Tab 
                  icon={<MenuBook />} 
                  label="القراءة" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<Search />} 
                  label="البحث" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<Bookmark />} 
                  label="المفضلة" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<History />} 
                  label="الأخيرة" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* محتوى التبويبات */}
            <TabPanel value={selectedTab} index={0}>
              {selectedSurah ? (
                <UthmaniReader
                  surahId={selectedSurah.id}
                  ayahNumber={selectedAyah || undefined}
                  showWordBreakdown={true}
                  onWordClick={handleWordClick}
                />
              ) : (
                <Box textAlign="center" py={8}>
                  <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    اختر سورة للبدء
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    اختر سورة من القائمة الجانبية لعرضها بالرسم العثماني
                  </Typography>
                </Box>
              )}
            </TabPanel>

            <TabPanel value={selectedTab} index={1}>
              <QuranSearch onResultClick={handleSearchResult} />
            </TabPanel>

            <TabPanel value={selectedTab} index={2}>
              <Box textAlign="center" py={8}>
                <Bookmark sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  المفضلة
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ستظهر هنا الآيات والسور المفضلة
                </Typography>
              </Box>
            </TabPanel>

            <TabPanel value={selectedTab} index={3}>
              {recentlyViewed.length > 0 ? (
                <List>
                  {recentlyViewed.map((surah) => (
                    <ListItem key={surah.id} disablePadding>
                      <ListItemButton onClick={() => handleSurahSelect(surah)}>
                        <ListItemText
                          primary={surah.arabicName}
                          secondary={`${surah.englishName} - ${surah.totalAyahs} آية`}
                        />
                        <Chip
                          label={surah.type === 'meccan' ? 'مكية' : 'مدنية'}
                          size="small"
                          color={surah.type === 'meccan' ? 'primary' : 'secondary'}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box textAlign="center" py={8}>
                  <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    المشاهدة الأخيرة
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ستظهر هنا السور التي شاهدتها مؤخراً
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default QuranPage;
