import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  IconButton, 
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { students, StudentAttendance, MemorizationSession } from '../data/students';
import { aiRecommendations } from '../data/ai-insights';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import StudentStats from '../components/StudentStats';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const StyledAttendanceBox = styled(Box)(({ theme, status }: { theme: any, status: string }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  borderRadius: 4,
  minWidth: 100,
  backgroundColor: status === 'حاضر' ? theme.palette.success.light : theme.palette.error.light,
  color: status === 'حاضر' ? theme.palette.success.dark : theme.palette.error.dark,
  fontWeight: 'bold'
}));

const StudentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  
  const student = students.find(s => s.id === studentId);
  
  if (!student) {
    return (
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <Typography variant="h5">الطالب غير موجود</Typography>
        <IconButton onClick={() => navigate('/students')}>
          <ArrowBackIcon /> العودة
        </IconButton>
      </Container>
    );
  }

  // التوصيات المخصصة للطالب
  const studentRecommendations = aiRecommendations.filter(
    rec => rec.type === 'student' && rec.title.includes(student.name)
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderAttendanceHistory = (attendance: StudentAttendance[]) => (
    <Grid container spacing={2}>
      {attendance.map((record, index) => (
        <Grid item xs={6} sm={4} md={3} key={index}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <DateRangeIcon color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {record.date}
                </Typography>
              </Box>              <StyledAttendanceBox status={record.status} theme={theme}>
                {record.status === 'حاضر' ? (
                  <CheckCircleIcon sx={{ mr: 0.5 }} fontSize="small" />
                ) : (
                  <CancelIcon sx={{ mr: 0.5 }} fontSize="small" />
                )}
                {record.status}
              </StyledAttendanceBox>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderMemorizationHistory = (memorization: MemorizationSession[]) => (
    <List>
      {memorization.map((session) => (
        <Paper 
          key={session.id} 
          elevation={1} 
          sx={{ 
            mb: 2, 
            p: 2, 
            borderLeft: 6, 
            borderColor: 
              session.type === 'حفظ' ? 'primary.main' : 
              session.type === 'مراجعة صغرى' ? 'info.main' : 'success.main',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MenuBookIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                {session.surahName} ({session.fromAyah}-{session.toAyah})
              </Typography>
            </Box>
            <Chip 
              label={session.type} 
              color={
                session.type === 'حفظ' ? "primary" : 
                session.type === 'مراجعة صغرى' ? "info" : "success"
              } 
              size="small" 
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {session.date}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                الدرجة:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={
                session.score >= 90 ? "success.main" : 
                session.score >= 75 ? "primary.main" : "warning.main"
              }>
                {session.score}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                عدد الأخطاء:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={
                session.totalErrors <= 2 ? "success.main" : 
                session.totalErrors <= 5 ? "warning.main" : "error.main"
              }>
                {session.totalErrors}
              </Typography>
            </Grid>
          </Grid>
          
          {session.errors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                تفاصيل الأخطاء:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {session.errors.map((error, idx) => (
                  <Chip 
                    key={idx}
                    label={`${error.word} (${error.type})`}
                    size="small"
                    color={
                      error.type === 'حفظ' ? "error" : 
                      error.type === 'تجويد' ? "warning" : "info"
                    }
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      ))}
    </List>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/students')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" flex="1">
          تفاصيل الطالب
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* بطاقة معلومات الطالب */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mr: 2 }}>
                  <PersonIcon sx={{ fontSize: 35 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    العمر: {student.age} سنة
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  المستوى:
                </Typography>                <Chip 
                  label={student.level} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ width: '100%' }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  الحفظ الحالي:
                </Typography>                <Chip 
                  icon={<MenuBookIcon />}
                  label={`${student.currentMemorization.surahName} (${student.currentMemorization.fromAyah}-${student.currentMemorization.toAyah})`}
                  color="success"
                  sx={{ width: '100%' }}
                />
              </Box>

              {student.phone && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    رقم الهاتف:
                  </Typography>
                  <Typography variant="body2">
                    {student.phone}
                  </Typography>
                </Box>
              )}

              {student.parentPhone && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    رقم ولي الأمر:
                  </Typography>
                  <Typography variant="body2">
                    {student.parentPhone}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          
          {/* توصيات الذكاء الاصطناعي */}
          {studentRecommendations.length > 0 && (
            <Paper elevation={3} sx={{ p: 2, bgcolor: 'info.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LightbulbIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold" color="info.dark">
                  توصيات الذكاء الاصطناعي
                </Typography>
              </Box>
              <List>
                {studentRecommendations.map((rec) => (
                  <ListItem key={rec.id} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <LightbulbIcon fontSize="small" color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec.description}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* المحتوى الرئيسي مع تبويبات */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="الإحصائيات" />
              <Tab label="سجل الحضور" />
              <Tab label="سجل التسميع" />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <StudentStats student={student} />
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom color="primary">
                سجل الحضور
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                معدل الحضور الكلي: {student.attendanceRate}%
              </Typography>
              {renderAttendanceHistory(student.attendance)}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom color="primary">
                سجل التسميع
              </Typography>
              {renderMemorizationHistory(student.memorization)}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDetails;
