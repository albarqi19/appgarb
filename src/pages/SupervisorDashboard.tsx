import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
  useTheme,
  Stack,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supervisors, teacherAttendanceData, studentTransferRequests, supervisorAIRecommendations } from '../data/supervisors';
import { students } from '../data/students';
import { mosques } from '../data/mosques';
import { studentAnalytics } from '../data/ai-insights';

// أيقونات
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ReportIcon from '@mui/icons-material/Report';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MosqueIcon from '@mui/icons-material/Mosque';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VacationIcon from '@mui/icons-material/BeachAccess';

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
      id={`supervisor-tabpanel-${index}`}
      aria-labelledby={`supervisor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SupervisorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [targetMosque, setTargetMosque] = useState('');
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [attendanceNotes, setAttendanceNotes] = useState('');

  // بيانات المشرف الحالي (في التطبيق الحقيقي ستأتي من تسجيل الدخول)
  const currentSupervisor = supervisors[0];
  const supervisedMosquesList = mosques.filter(m => currentSupervisor.supervisedMosques.includes(m.id));
  const supervisedStudents = students.filter(s => currentSupervisor.supervisedMosques.includes(s.mosqueId));
  const todayAttendance = teacherAttendanceData.filter(ta => ta.date === '2025-06-07' && currentSupervisor.supervisedMosques.includes(ta.mosqueId));

  // الحصول على إحصائيات المشرف
  const getSupervisorStats = () => {
    const totalMosques = supervisedMosquesList.length;
    const totalStudents = supervisedStudents.length;
    const presentTeachers = todayAttendance.filter(ta => ta.status === 'حاضر').length;
    const totalTeachers = todayAttendance.length;
    const attendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;
    const pendingTransfers = studentTransferRequests.filter(str => str.status === 'pending').length;

    return {
      totalMosques,
      totalStudents,
      attendanceRate,
      pendingTransfers,
      presentTeachers,
      totalTeachers
    };
  };

  const stats = getSupervisorStats();

  // معالجة طلب نقل طالب
  const handleStudentTransfer = () => {
    // في التطبيق الحقيقي سيتم إرسال الطلب لقاعدة البيانات
    console.log('طلب نقل:', {
      studentId: selectedStudent,
      targetMosque,
      reason: transferReason
    });
    setTransferDialogOpen(false);
    setSelectedStudent('');
    setTransferReason('');
    setTargetMosque('');
  };

  // معالجة تحضير المعلم
  const handleTeacherAttendance = () => {
    console.log('تحضير المعلم:', {
      teacherId: selectedTeacher,
      status: attendanceStatus,
      notes: attendanceNotes
    });
    setAttendanceDialogOpen(false);
    setSelectedTeacher('');
    setAttendanceStatus('');
    setAttendanceNotes('');
  };

  // الحصول على أيقونة الحضور
  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'حاضر':
        return <EventAvailableIcon color="success" />;
      case 'غائب':
        return <EventBusyIcon color="error" />;
      case 'متأخر':
        return <AccessTimeIcon color="warning" />;
      case 'إجازة':
        return <VacationIcon color="info" />;
      default:
        return <EventAvailableIcon />;
    }
  };

  // الحصول على لون حالة الحضور
  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'حاضر':
        return 'success';
      case 'غائب':
        return 'error';
      case 'متأخر':
        return 'warning';
      case 'إجازة':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        pt: 8,
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="lg">
        {/* رأس الصفحة - معلومات المشرف */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
              : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* خلفية زخرفية */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              zIndex: 0
            }}
          />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      mr: 2,
                      width: 60,
                      height: 60
                    }}
                  >
                    <SupervisorAccountIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                      أهلاً وسهلاً {currentSupervisor.name.split(' ')[0]}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                      لوحة تحكم المشرف - إدارة الحلقات والمعلمين
                    </Typography>
                  </Box>
                </Box>
                
                {/* معلومات سريعة */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {stats.totalMosques}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        المساجد
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {stats.totalStudents}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        الطلاب
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {stats.attendanceRate}%
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        حضور المعلمين
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {stats.pendingTransfers}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        طلبات النقل
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <NotificationsIcon sx={{ mr: 1, color: 'white' }} />
                      <Typography variant="h6" color="white">
                        التنبيهات العاجلة
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      {stats.pendingTransfers} طلب نقل بانتظار الموافقة
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {supervisorAIRecommendations.filter(r => r.priority === 'high').length} توصية ذكاء اصطناعي عالية الأولوية
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* تبويبات المحتوى */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            <Tab label="نظرة عامة" />
            <Tab label="المساجد والحلقات" />
            <Tab label="تحضير المعلمين" />
            <Tab label="نقل الطلاب" />
            <Tab label="التوصيات الذكية" />
            <Tab label="التقارير" />
          </Tabs>
        </Paper>

        {/* محتوى التبويبات */}
        
        {/* تبويبة نظرة عامة */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* بطاقات الإحصائيات */}
            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalMosques}
                    </Typography>
                    <Typography variant="body2">
                      المساجد المشرف عليها
                    </Typography>
                  </Box>
                  <MosqueIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalStudents}
                    </Typography>
                    <Typography variant="body2">
                      إجمالي الطلاب
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.presentTeachers}/{stats.totalTeachers}
                    </Typography>
                    <Typography variant="body2">
                      المعلمون الحاضرون اليوم
                    </Typography>
                  </Box>
                  <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.pendingTransfers}
                    </Typography>
                    <Typography variant="body2">
                      طلبات النقل المعلقة
                    </Typography>
                  </Box>
                  <TransferWithinAStationIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </Card>
            </Grid>

            {/* المساجد التي يشرف عليها */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  المساجد تحت إشرافي
                </Typography>
                <Grid container spacing={2}>
                  {supervisedMosquesList.map((mosque) => {
                    const mosqueStudents = supervisedStudents.filter(s => s.mosqueId === mosque.id);
                    const avgScore = mosqueStudents.reduce((sum, s) => sum + s.totalScore, 0) / mosqueStudents.length || 0;
                    
                    return (
                      <Grid item xs={12} md={6} lg={4} key={mosque.id}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                                <MosqueIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" fontWeight="bold">
                                  {mosque.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {mosque.location}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">عدد الطلاب:</Typography>
                                <Typography variant="body2" fontWeight="bold">{mosqueStudents.length}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">متوسط الدرجات:</Typography>
                                <Typography variant="body2" fontWeight="bold">{Math.round(avgScore)}%</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">عدد الحلقات:</Typography>
                                <Typography variant="body2" fontWeight="bold">{mosque.studentsCount > 0 ? Math.ceil(mosque.studentsCount / 15) : 0}</Typography>
                              </Box>
                            </Stack>
                            
                            <Box sx={{ mt: 2 }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                fullWidth
                                onClick={() => navigate(`/students?mosque=${mosque.id}`)}
                              >
                                عرض التفاصيل
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* تبويبة المساجد والحلقات */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    إدارة الطلاب والحلقات
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => setTransferDialogOpen(true)}
                  >
                    نقل طالب
                  </Button>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>اسم الطالب</TableCell>
                        <TableCell>المسجد</TableCell>
                        <TableCell>المستوى</TableCell>
                        <TableCell>الدرجة</TableCell>
                        <TableCell>الحضور</TableCell>
                        <TableCell>الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supervisedStudents.slice(0, 10).map((student) => {
                        const mosque = mosques.find(m => m.id === student.mosqueId);
                        const analytics = studentAnalytics[student.id];
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>                                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                                  {student.name ? student.name.charAt(0) : '؟'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {student.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {student.age} سنة
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{mosque?.name}</TableCell>
                            <TableCell>
                              <Chip 
                                label={student.level} 
                                size="small"
                                color={student.level === 'متقدم' ? 'success' : student.level === 'متوسط' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={student.totalScore} 
                                  sx={{ width: 60, mr: 1 }}
                                  color={student.totalScore >= 80 ? "success" : student.totalScore >= 60 ? "warning" : "error"}
                                />
                                <Typography variant="caption">
                                  {student.totalScore}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${student.attendanceRate}%`}
                                size="small"
                                color={student.attendanceRate >= 90 ? "success" : student.attendanceRate >= 70 ? "warning" : "error"}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/student-details/${student.id}`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* تبويبة تحضير المعلمين */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    تحضير المعلمين - اليوم {new Date().toLocaleDateString('ar-SA')}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setAttendanceDialogOpen(true)}
                  >
                    تسجيل حضور
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {todayAttendance.map((attendance) => (
                    <Grid item xs={12} md={6} lg={4} key={attendance.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            {getAttendanceIcon(attendance.status)}
                            <Box sx={{ ml: 2 }}>
                              <Typography variant="h6" fontWeight="bold">
                                {attendance.teacherName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {mosques.find(m => m.id === attendance.mosqueId)?.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Chip 
                            label={attendance.status}
                            color={getAttendanceColor(attendance.status) as any}
                            size="small"
                            sx={{ mb: 2 }}
                          />
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              عدد الحلقات: {attendance.sessionCount}
                            </Typography>
                            {attendance.notes && (
                              <Typography variant="body2" color="text.secondary">
                                ملاحظات: {attendance.notes}
                              </Typography>
                            )}
                          </Box>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            startIcon={<EditIcon />}
                            onClick={() => {
                              setSelectedTeacher(attendance.teacherId);
                              setAttendanceStatus(attendance.status);
                              setAttendanceNotes(attendance.notes || '');
                              setAttendanceDialogOpen(true);
                            }}
                          >
                            تعديل الحضور
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* تبويبة نقل الطلاب */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  طلبات نقل الطلاب
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>اسم الطالب</TableCell>
                        <TableCell>من</TableCell>
                        <TableCell>إلى</TableCell>
                        <TableCell>السبب</TableCell>
                        <TableCell>الحالة</TableCell>
                        <TableCell>تاريخ الطلب</TableCell>
                        <TableCell>الإجراءات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentTransferRequests.map((request) => {
                        const fromMosque = mosques.find(m => m.id === request.fromMosqueId);
                        const toMosque = mosques.find(m => m.id === request.toMosqueId);
                        
                        return (
                          <TableRow key={request.id}>
                            <TableCell>{request.studentName}</TableCell>
                            <TableCell>{fromMosque?.name}</TableCell>
                            <TableCell>{toMosque?.name}</TableCell>
                            <TableCell>{request.reason}</TableCell>
                            <TableCell>
                              <Chip 
                                label={request.status === 'pending' ? 'معلق' : request.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                                color={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{request.requestDate}</TableCell>
                            <TableCell>
                              {request.status === 'pending' && (
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => console.log('موافقة على النقل')}
                                  >
                                    موافقة
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() => console.log('رفض النقل')}
                                  >
                                    رفض
                                  </Button>
                                </Stack>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* تبويبة التوصيات الذكية */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            {supervisorAIRecommendations.map((recommendation) => (
              <Grid item xs={12} md={6} key={recommendation.id}>
                <Card 
                  elevation={0}
                  sx={{ 
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: recommendation.priority === 'high' ? 'error.main' : 
                                recommendation.priority === 'medium' ? 'warning.main' : 'info.main'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: recommendation.priority === 'high' ? 'error.light' : 
                                 recommendation.priority === 'medium' ? 'warning.light' : 'info.light',
                          mr: 2
                        }}
                      >
                        <SmartToyIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {recommendation.title}
                          </Typography>
                          <Chip 
                            label={recommendation.priority === 'high' ? 'عالية' : 
                                   recommendation.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            color={recommendation.priority === 'high' ? 'error' : 
                                   recommendation.priority === 'medium' ? 'warning' : 'info'}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {recommendation.description}
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            الأسباب:
                          </Typography>
                          <List dense>
                            {recommendation.reasons.map((reason, index) => (
                              <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 20 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={reason}
                                  primaryTypographyProps={{ variant: 'caption' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            دقة التوصية: {recommendation.confidence}%
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => console.log('تطبيق التوصية')}
                          >
                            تطبيق التوصية
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* تبويبة التقارير */}
        <TabPanel value={activeTab} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  إنشاء التقارير
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <ReportIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير الطلاب
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        أداء الطلاب ومعدلات التقدم
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير المعلمين
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        حضور وأداء المعلمين
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <MosqueIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير المساجد
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        إحصائيات المساجد والحلقات
                      </Typography>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                      <SmartToyIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        تقرير الذكاء الاصطناعي
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        توصيات وتحليلات ذكية
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* نافذة نقل الطالب */}
        <Dialog 
          open={transferDialogOpen} 
          onClose={() => setTransferDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>نقل طالب إلى مسجد آخر</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>اختر الطالب</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="اختر الطالب"
                >
                  {supervisedStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.name} - {mosques.find(m => m.id === student.mosqueId)?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>المسجد الجديد</InputLabel>
                <Select
                  value={targetMosque}
                  onChange={(e) => setTargetMosque(e.target.value)}
                  label="المسجد الجديد"
                >
                  {supervisedMosquesList.map((mosque) => (
                    <MenuItem key={mosque.id} value={mosque.id}>
                      {mosque.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="سبب النقل"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="اذكر سبب طلب النقل..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransferDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant="contained" 
              onClick={handleStudentTransfer}
              disabled={!selectedStudent || !targetMosque || !transferReason}
            >
              إرسال طلب النقل
            </Button>
          </DialogActions>
        </Dialog>

        {/* نافذة تحضير المعلم */}
        <Dialog 
          open={attendanceDialogOpen} 
          onClose={() => setAttendanceDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>تسجيل حضور المعلم</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>اختر المعلم</InputLabel>
                <Select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  label="اختر المعلم"
                >
                  {todayAttendance.map((attendance) => (
                    <MenuItem key={attendance.teacherId} value={attendance.teacherId}>
                      {attendance.teacherName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>حالة الحضور</InputLabel>
                <Select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  label="حالة الحضور"
                >
                  <MenuItem value="حاضر">حاضر</MenuItem>
                  <MenuItem value="غائب">غائب</MenuItem>
                  <MenuItem value="متأخر">متأخر</MenuItem>
                  <MenuItem value="إجازة">إجازة</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="ملاحظات"
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                placeholder="أضف ملاحظات إضافية..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAttendanceDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant="contained" 
              onClick={handleTeacherAttendance}
              disabled={!selectedTeacher || !attendanceStatus}
            >
              حفظ الحضور
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SupervisorDashboard;
