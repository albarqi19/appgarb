import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Switch,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stack,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme
} from '@mui/material';
import {
  NotificationsActive as NotificationsIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Psychology as AIIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Star as StarIcon,
  TrendingDown as AlertIcon,
  Event as EventIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { students } from '../data/students';
import { studentAnalytics } from '../data/ai-insights';

interface ParentNotification {
  id: string;
  type: 'attendance' | 'performance' | 'ai_insight' | 'schedule' | 'achievement' | 'warning';
  title: string;
  message: string;
  childId: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: boolean;
}

const ParentNotifications: React.FC = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<ParentNotification[]>([
    {
      id: '1',
      type: 'ai_insight',
      title: 'توصية ذكية: تحسين الحفظ',
      message: 'يُنصح بزيادة وقت المراجعة لأحمد بنسبة 20% لتحسين معدل التثبيت',
      childId: '1',
      timestamp: '2025-05-25T10:30:00',
      isRead: false,
      priority: 'high',
      actionRequired: true
    },
    {
      id: '2',
      type: 'attendance',
      title: 'تنبيه غياب',
      message: 'غاب محمد عن جلسة التحفيظ اليوم. يرجى التواصل معنا لمعرفة السبب',
      childId: '2',
      timestamp: '2025-05-25T16:15:00',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'إنجاز رائع!',
      message: 'حصل أحمد على درجة ممتازة (95%) في تسميع سورة البقرة',
      childId: '1',
      timestamp: '2025-05-24T14:20:00',
      isRead: true,
      priority: 'low'
    },
    {
      id: '4',
      type: 'performance',
      title: 'تراجع في الأداء',
      message: 'لوحظ انخفاض في درجات فاطمة خلال الأسبوعين الماضيين',
      childId: '3',
      timestamp: '2025-05-23T11:45:00',
      isRead: false,
      priority: 'high',
      actionRequired: true
    },
    {
      id: '5',
      type: 'schedule',
      title: 'تذكير موعد التسميع',
      message: 'موعد تسميع أحمد غداً الساعة 4:00 م - سورة آل عمران',
      childId: '1',
      timestamp: '2025-05-25T09:00:00',
      isRead: true,
      priority: 'medium'
    }
  ]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    attendance: true,
    performance: true,
    ai_insights: true,
    achievements: true,
    schedule: true,
    method: 'app', // 'app', 'email', 'sms'
    frequency: 'immediate' // 'immediate', 'daily', 'weekly'
  });

  // تصفية الإشعارات حسب النوع
  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  // عدد الإشعارات غير المقروءة
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // الحصول على أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <ScheduleIcon />;
      case 'performance':
        return <AssessmentIcon />;
      case 'ai_insight':
        return <AIIcon />;
      case 'schedule':
        return <CalendarIcon />;
      case 'achievement':
        return <StarIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // الحصول على لون حسب نوع الإشعار
  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'error';
    if (type === 'achievement') return 'success';
    if (type === 'ai_insight') return 'primary';
    return 'info';
  };

  // تحديد الطفل المرتبط بالإشعار
  const getChildName = (childId: string) => {
    const child = students.find(s => s.id === childId);
    return child ? child.name.split(' ')[0] : 'غير محدد';
  };

  // تحديث حالة القراءة للإشعار
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  // حذف إشعار
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // تنسيق الوقت
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'منذ أقل من ساعة';
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${Math.floor(diffHours / 24)} يوم`;
  };

  return (
    <Box>
      {/* رأس الإشعارات */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={unreadCount} color="error" sx={{ mr: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <NotificationsIcon />
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                الإشعارات والتنبيهات
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount} إشعار جديد
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* الإشعارات المهمة */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          الإشعارات المهمة
        </Typography>
        
        {notifications
          .filter(n => n.priority === 'high' || n.actionRequired)
          .map((notification) => (
            <Alert
              key={notification.id}
              severity={notification.type === 'achievement' ? 'success' : 'warning'}
              sx={{ mb: 2, borderRadius: 2 }}
              action={
                <Stack direction="row" spacing={1}>
                  {!notification.isRead && (
                    <IconButton 
                      size="small" 
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton 
                    size="small" 
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {notification.title} - {getChildName(notification.childId)}
              </Typography>
              <Typography variant="body2">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(notification.timestamp)}
              </Typography>
            </Alert>
          ))}
      </Paper>

      {/* جميع الإشعارات مجمعة حسب النوع */}
      <Paper elevation={0} sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            جميع الإشعارات
          </Typography>
        </Box>

        {/* إشعارات الذكاء الاصطناعي */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <AIIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                توصيات الذكاء الاصطناعي
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={getNotificationsByType('ai_insight').filter(n => !n.isRead).length} 
                  size="small" 
                  color="primary" 
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {getNotificationsByType('ai_insight').map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{ 
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      <AIIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${getChildName(notification.childId)}: ${notification.title}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {!notification.isRead && (
                          <IconButton 
                            size="small" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < getNotificationsByType('ai_insight').length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* إشعارات الحضور */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ScheduleIcon sx={{ mr: 2, color: 'warning.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                الحضور والغياب
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={getNotificationsByType('attendance').filter(n => !n.isRead).length} 
                  size="small" 
                  color="warning" 
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {getNotificationsByType('attendance').map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{ 
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      <ScheduleIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${getChildName(notification.childId)}: ${notification.title}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {!notification.isRead && (
                          <IconButton 
                            size="small" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < getNotificationsByType('attendance').length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* إشعارات الإنجازات */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <StarIcon sx={{ mr: 2, color: 'success.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                الإنجازات والتميز
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                <Chip 
                  label={getNotificationsByType('achievement').filter(n => !n.isRead).length} 
                  size="small" 
                  color="success" 
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {getNotificationsByType('achievement').map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{ 
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                      borderRadius: 1
                    }}
                  >
                    <ListItemIcon>
                      <StarIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${getChildName(notification.childId)}: ${notification.title}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        {!notification.isRead && (
                          <IconButton 
                            size="small" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckIcon />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < getNotificationsByType('achievement').length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* إعدادات الإشعارات */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          إعدادات الإشعارات
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              أنواع الإشعارات
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText primary="إشعارات الحضور والغياب" />
                <Switch 
                  checked={notificationSettings.attendance}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    attendance: e.target.checked
                  }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText primary="إشعارات الأداء" />
                <Switch 
                  checked={notificationSettings.performance}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    performance: e.target.checked
                  }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <AIIcon />
                </ListItemIcon>
                <ListItemText primary="توصيات الذكاء الاصطناعي" />
                <Switch 
                  checked={notificationSettings.ai_insights}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    ai_insights: e.target.checked
                  }))}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <StarIcon />
                </ListItemIcon>
                <ListItemText primary="إشعارات الإنجازات" />
                <Switch 
                  checked={notificationSettings.achievements}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    achievements: e.target.checked
                  }))}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              طريقة الإشعار
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={notificationSettings.method}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  method: e.target.value
                }))}
              >
                <FormControlLabel value="app" control={<Radio />} label="داخل التطبيق" />
                <FormControlLabel value="email" control={<Radio />} label="البريد الإلكتروني" />
                <FormControlLabel value="sms" control={<Radio />} label="الرسائل النصية" />
              </RadioGroup>
            </FormControl>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              تكرار الإشعارات
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={notificationSettings.frequency}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  frequency: e.target.value
                }))}
              >
                <FormControlLabel value="immediate" control={<Radio />} label="فوري" />
                <FormControlLabel value="daily" control={<Radio />} label="تقرير يومي" />
                <FormControlLabel value="weekly" control={<Radio />} label="تقرير أسبوعي" />
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            إلغاء
          </Button>
          <Button variant="contained">
            حفظ الإعدادات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentNotifications;
