import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Stack,
  Chip,
  Tab,
  Tabs,
  CardHeader,
  CardActionArea,
  LinearProgress,
  Tooltip,
  Badge,
  alpha,
  AvatarGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { mosques } from '../data/mosques';
import { students } from '../data/students';
import { surahs } from '../data/quran';
import { aiRecommendations } from '../data/ai-insights';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MosqueIcon from '@mui/icons-material/Mosque';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PieChartIcon from '@mui/icons-material/PieChart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import AIRecommendationsPanel from '../components/AIRecommendationsPanel';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentMosque } = useAppContext();
  const [statsPeriod, setStatsPeriod] = useState(0); // 0: أسبوعي، 1: شهري، 2: سنوي
  const [activeTab, setActiveTab] = useState(0);

  // بيانات للرسم البياني الدائري للطلاب حسب المستوى
  const getLevelDistributionData = () => {
    const levelCounts = { مبتدئ: 0, متوسط: 0, متقدم: 0 };
    
    students.forEach(student => {
      if (levelCounts[student.level as keyof typeof levelCounts] !== undefined) {
        levelCounts[student.level as keyof typeof levelCounts] += 1;
      }
    });
    
    return [
      { name: 'مبتدئ', value: levelCounts.مبتدئ, color: '#2196f3' },
      { name: 'متوسط', value: levelCounts.متوسط, color: '#ff9800' },
      { name: 'متقدم', value: levelCounts.متقدم, color: '#4caf50' }
    ];
  };

  // بيانات للرسم البياني الشريطي للطلاب حسب المسجد
  const getStudentsPerMosqueData = () => {
    return mosques.map(mosque => ({
      name: mosque.name.split(' ').slice(-1)[0], // الاسم الأخير فقط للعرض
      'عدد الطلاب': mosque.studentsCount,
      color: '#1e6f8e'
    }));
  };

  // بيانات للرسم البياني الخطي للحضور
  const getAttendanceData = () => {
    const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    
    return days.map(day => ({
      name: day,
      نسبة: Math.floor(Math.random() * 30) + 70, // نسبة عشوائية بين 70-100
      color: '#4caf50'
    }));
  };

  // بيانات الإنجاز الشهري
  const getMonthlyProgressData = () => {
    return [
      { name: 'مارس', حفظ: 65, مراجعة: 75 },
      { name: 'أبريل', حفظ: 72, مراجعة: 78 },
      { name: 'مايو', حفظ: 80, مراجعة: 85 },
    ];
  };

  // اختيار مسجد والانتقال لصفحة الطلاب
  const handleMosqueSelect = (mosqueId: string) => {
    const selected = mosques.find(m => m.id === mosqueId);
    if (selected) {
      setCurrentMosque(selected);
      navigate('/students');
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 10, 
        pb: 4,
        background: 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
      }}
    >
      <Container maxWidth="xl">
        {/* رأس الصفحة */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
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

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 2 
                }}
              >
                <DashboardIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  لوحة التحكم
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  مرحباً بك في منصة غرب لإدارة حلقات تحفيظ القرآن الكريم
                </Typography>
              </Box>
            </Box>

            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                mt: 2,
                '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)' },
                '& .Mui-selected': { color: 'white' },
                '& .MuiTabs-indicator': { bgcolor: 'white', height: 3 }
              }}
            >
              <Tab label="نظرة عامة" />
              <Tab label="الطلاب" />
              <Tab label="المدارس القرآنية" />
              <Tab label="التوصيات" />
            </Tabs>
          </Box>
        </Paper>

        {/* بطاقات المعلومات الرئيسية */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
                  <Box 
                    component="svg" 
                    viewBox="0 0 24 24" 
                    sx={{ 
                      position: 'absolute', 
                      width: '200%', 
                      height: '200%', 
                      top: '-50%', 
                      left: '-50%',
                      opacity: 0.1,
                      transform: 'rotate(20deg)'
                    }}
                  >
                    <path 
                      d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"
                      fill="#FFFFFF"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="medium">
                      المدارس القرآنية
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 40,
                        height: 40
                      }}
                    >
                      <MosqueIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                    {mosques.length}
                  </Typography>
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label="نشطة بالكامل" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: 'none'
                    }} 
                  />
                </Box>
              </Box>
              
              <CardActionArea onClick={() => navigate('/')} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    عرض القائمة الكاملة
                  </Typography>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #2196f3 0%, #0d47a1 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
                  <Box 
                    component="svg" 
                    viewBox="0 0 24 24" 
                    sx={{ 
                      position: 'absolute', 
                      width: '200%', 
                      height: '200%', 
                      top: '-50%', 
                      left: '-50%',
                      opacity: 0.1,
                      transform: 'rotate(20deg)'
                    }}
                  >
                    <path 
                      d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14 18.67,13 16,13M8,13C5.33,13 1,14 1,16.5V19H15V16.5C15,14 10.67,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"
                      fill="#FFFFFF"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="medium">
                      طلاب التحفيظ
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 40,
                        height: 40
                      }}
                    >
                      <PeopleIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                    {students.length}
                  </Typography>
                  <Chip 
                    icon={<EventAvailableIcon />} 
                    label={`${Math.round(students.reduce((avg, s) => avg + s.attendanceRate, 0) / students.length)}% نسبة الحضور`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: 'none'
                    }} 
                  />
                </Box>
              </Box>
              
              <CardActionArea onClick={() => navigate('/students')} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    عرض قائمة الطلاب
                  </Typography>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
                  <Box 
                    component="svg" 
                    viewBox="0 0 24 24" 
                    sx={{ 
                      position: 'absolute', 
                      width: '200%', 
                      height: '200%', 
                      top: '-50%', 
                      left: '-50%',
                      opacity: 0.1,
                      transform: 'rotate(20deg)'
                    }}
                  >
                    <path 
                      d="M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z"
                      fill="#FFFFFF"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="medium">
                      السور القرآنية
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 40,
                        height: 40
                      }}
                    >
                      <MenuBookIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                    {surahs.length}
                  </Typography>
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label="متاحة للتسميع" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      border: 'none'
                    }} 
                  />
                </Box>
              </Box>
              
              <CardActionArea sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    عرض تفاصيل الحفظ
                  </Typography>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, #9c27b0 0%, #4a148c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
                  <Box 
                    component="svg" 
                    viewBox="0 0 24 24" 
                    sx={{ 
                      position: 'absolute', 
                      width: '200%', 
                      height: '200%', 
                      top: '-50%', 
                      left: '-50%',
                      opacity: 0.1,
                      transform: 'rotate(20deg)'
                    }}
                  >
                    <path 
                      d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"
                      fill="#FFFFFF"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="medium">
                      توصيات ذكية
                    </Typography>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        width: 40,
                        height: 40
                      }}
                    >
                      <LightbulbIcon />
                    </Avatar>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                    {aiRecommendations.length}
                  </Typography>
                  <Badge badgeContent="جديد" color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}>
                    <Chip 
                      icon={<AutoAwesomeIcon />} 
                      label="مدعومة بالذكاء الاصطناعي" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        border: 'none'
                      }} 
                    />
                  </Badge>
                </Box>
              </Box>
              
              <CardActionArea sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    عرض كافة التوصيات
                  </Typography>
                  <ArrowForwardIcon fontSize="small" color="primary" />
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* المخططات البيانية */}
          <Grid item xs={12} lg={8}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha('#1e6f8e', 0.1),
                        mr: 2
                      }}
                    >
                      <PieChartIcon sx={{ color: 'primary.main' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      الإحصائيات العامة
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant={statsPeriod === 0 ? "contained" : "outlined"} 
                      onClick={() => setStatsPeriod(0)}
                    >
                      أسبوعي
                    </Button>
                    <Button 
                      size="small" 
                      variant={statsPeriod === 1 ? "contained" : "outlined"}
                      onClick={() => setStatsPeriod(1)}
                    >
                      شهري
                    </Button>
                    <Button 
                      size="small" 
                      variant={statsPeriod === 2 ? "contained" : "outlined"}
                      onClick={() => setStatsPeriod(2)}
                    >
                      سنوي
                    </Button>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        توزيع الطلاب حسب المستوى
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        نسبة توزيع الطلاب في كل مستوى من مستويات التحفيظ
                      </Typography>
                    </Box>
                    <Box sx={{ height: 260, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getLevelDistributionData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={2}
                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {getLevelDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} />
                          <RechartsTooltip formatter={(value, name) => [`${value} طالب`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        معدل الحضور الأسبوعي
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        نسبة حضور الطلاب في أيام الأسبوع
                      </Typography>
                    </Box>
                    <Box sx={{ height: 260, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getAttendanceData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                          <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                          <RechartsTooltip 
                            formatter={(value) => [`${value}%`, 'نسبة الحضور']}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="نسبة" 
                            stroke="#4caf50" 
                            fill="url(#gradientColor)" 
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          <defs>
                            <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#4caf50" stopOpacity={0.05}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        الإنجاز الشهري في الحفظ والمراجعة
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        متوسط درجات الطلاب في جلسات الحفظ والمراجعة
                      </Typography>
                    </Box>
                    <Box sx={{ height: 260, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMonthlyProgressData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke="#888" 
                            tick={{ fill: '#888', fontSize: 12 }} 
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="#888" 
                            tick={{ fill: '#888', fontSize: 12 }} 
                            axisLine={false}
                            tickLine={false}
                            domain={[50, 100]}
                          />
                          <RechartsTooltip 
                            formatter={(value) => [`${value}%`, '']}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                          />
                          <Legend align="right" />
                          <Bar 
                            dataKey="حفظ" 
                            fill="#2196f3" 
                            barSize={20} 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="مراجعة" 
                            fill="#ff9800" 
                            barSize={20} 
                            radius={[4, 4, 0, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        
          {/* المدارس القرآنية */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha('#4caf50', 0.1),
                        mr: 2
                      }}
                    >
                      <MosqueIcon sx={{ color: '#4caf50' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      المدارس القرآنية
                    </Typography>
                  </Box>
                  <Tooltip title="عرض كافة المدارس">
                    <IconButton size="small" onClick={() => navigate('/')}>
                      <ListAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ p: 1, flex: 1, overflow: 'auto' }}>
                <List disablePadding>
                  {mosques.map((mosque, index) => (
                    <Paper
                      key={mosque.id}
                      elevation={0}
                      sx={{
                        mb: 1,
                        mx: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <ListItem
                        secondaryAction={
                          <Button 
                            endIcon={<ArrowForwardIcon />} 
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                            onClick={() => handleMosqueSelect(mosque.id)}
                          >
                            الطلاب
                          </Button>
                        }
                        sx={{ py: 1.5, px: 2 }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: index % 3 === 0 ? 'primary.light' : 
                                      index % 3 === 1 ? 'secondary.light' : 'success.light',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {mosque.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography fontWeight="medium" variant="body1">
                              {mosque.name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <PeopleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem', color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {mosque.studentsCount} طالب
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
          
          {/* الطلاب المميزين والأكثر التزاماً */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha('#ff9800', 0.1),
                        mr: 2
                      }}
                    >
                      <EmojiEventsIcon sx={{ color: '#ff9800' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      الطلاب المتميزون
                    </Typography>
                  </Box>
                  <Tooltip title="عرض جميع الطلاب">
                    <IconButton size="small" onClick={() => navigate('/students')}>
                      <PeopleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {students
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .slice(0, 3)
                    .map((student, index) => (
                      <Grid item xs={12} key={student.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.3s',
                            borderColor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32',
                            bgcolor: index === 0 ? alpha('#ffc107', 0.05) : 'transparent',
                            '&:hover': {
                              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative', mr: 2 }}>
                            <Avatar 
                              sx={{ 
                                width: 50, 
                                height: 50,
                                bgcolor: index === 0 ? '#ffc107' : index === 1 ? '#9e9e9e' : '#cd7f32',
                                border: '2px solid',
                                borderColor: index === 0 ? '#ffc107' : index === 1 ? '#9e9e9e' : '#cd7f32'
                              }}
                            >
                              {student.name.charAt(0)}
                            </Avatar>
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                bgcolor: 'background.paper',
                                borderRadius: '50%',
                                width: 22,
                                height: 22,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                border: '1px solid',
                                borderColor: index === 0 ? 'gold' : index === 1 ? 'silver' : '#cd7f32',
                                fontSize: '0.75rem'
                              }}
                            >
                              {index + 1}
                            </Box>
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="medium">
                                {student.name}
                              </Typography>
                              <Chip 
                                label={`${student.totalScore}%`}
                                size="small"
                                color={student.totalScore >= 90 ? "success" : "primary"}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                {student.level}
                              </Typography>
                              <Box sx={{ backgroundColor: 'divider', width: 1, height: 12, mx: 1 }} />
                              <Typography variant="caption" color="text.secondary">
                                سورة {student.currentMemorization.surahName}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          {/* السور الأكثر حفظاً */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha('#9c27b0', 0.1),
                        mr: 2
                      }}
                    >
                      <LocalLibraryIcon sx={{ color: '#9c27b0' }} />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold">
                      السور الأكثر حفظاً
                    </Typography>
                  </Box>
                  <Tooltip title="إحصائيات الحفظ">
                    <IconButton size="small">
                      <BarChartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {['الفاتحة', 'البقرة', 'آل عمران', 'الكهف', 'يس'].map((surahName, index) => {
                    const count = Math.floor(Math.random() * 20) + 10;
                    const percentage = count / students.length * 100;
                    
                    return (
                      <Grid item xs={12} key={index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            '&:hover': {
                              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.light',
                                width: 32,
                                height: 32,
                                mr: 1.5
                              }}
                            >
                              <MenuBookIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body1" fontWeight="medium">
                              سورة {surahName}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ px: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {count} طالب ({Math.round(percentage)}%)
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" color="primary.main">
                                {percentage > 50 ? 'مرتفع' : 'متوسط'}
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate" 
                              value={percentage} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                bgcolor: alpha('#1e6f8e', 0.1)
                              }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Grid>
          
          {/* توصيات الذكاء الاصطناعي */}
          <Grid item xs={12}>
            <AIRecommendationsPanel />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
