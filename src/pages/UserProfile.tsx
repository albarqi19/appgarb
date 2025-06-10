import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Divider,
  Chip,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  LockReset as LockResetIcon,
  Badge as BadgeIcon,
  Star as StarIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

interface UserSettings {
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
  };
}

const UserProfile: React.FC = () => {
  const theme = useTheme();
  const { user } = useAppContext();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [settings, setSettings] = useState<UserSettings>({
    language: 'ar',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showPhone: false,
      showEmail: false
    }
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  if (!user) {
    return null;
  }

  const handleSave = () => {
    // هنا سيتم حفظ البيانات
    setEditMode(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };
  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone || '',
      email: user.email || '',
      bio: user.bio || ''
    });
    setEditMode(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'teacher': return 'معلم';
      case 'parent': return 'ولي أمر';
      case 'student': return 'طالب';
      case 'supervisor': return 'مشرف';
      default: return 'مستخدم';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher': return <SchoolIcon />;
      case 'parent': return <PersonIcon />;
      case 'student': return <StarIcon />;
      case 'supervisor': return <BadgeIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'teacher': return 'primary';
      case 'parent': return 'secondary';
      case 'student': return 'success';
      case 'supervisor': return 'warning';
      default: return 'default';
    }
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        pt: 10,
        pb: 4,
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(245,247,250,1) 0%, rgba(255,255,255,1) 100%)'
          : 'linear-gradient(180deg, rgba(10,25,47,1) 0%, rgba(17,34,64,1) 100%)'
      }}
    >
      <Container maxWidth="lg">
        {showSuccessAlert && (
          <Alert severity="success" sx={{ mb: 3 }}>
            تم حفظ التغييرات بنجاح
          </Alert>
        )}

        {/* رأس الصفحة */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: theme.palette.mode === 'light' 
              ? 'linear-gradient(135deg, #1e6f8e 0%, #134b60 100%)'
              : 'linear-gradient(135deg, #4a9fbe 0%, #1e6f8e 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  mr: 2,
                  width: 56,
                  height: 56
                }}
              >
                <PersonIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  الملف الشخصي
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  إدارة معلوماتك الشخصية وإعداداتك
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* معلومات المستخدم الأساسية */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2.5rem',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {user.phone}
                  </Typography>
                  
                  {/* الأدوار */}
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                    {user.roles.map((role) => (
                      <Chip
                        key={role}
                        icon={getRoleIcon(role)}
                        label={getRoleLabel(role)}
                        color={getRoleColor(role) as any}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="رقم الهاتف"
                      secondary={user.phone}
                    />
                  </ListItem>
                  
                  {user.email && (
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="البريد الإلكتروني"
                        secondary={user.email}
                      />
                    </ListItem>
                  )}
                  
                  <ListItem>
                    <ListItemIcon>
                      <BadgeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="الدور الافتراضي"
                      secondary={getRoleLabel(user.defaultRole)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* معلومات التحرير والإعدادات */}
          <Grid item xs={12} md={8}>
            {/* تحرير المعلومات الشخصية */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    المعلومات الشخصية
                  </Typography>
                  {!editMode ? (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      variant="outlined"
                    >
                      تحرير
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                      >
                        حفظ
                      </Button>
                      <Button
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        variant="outlined"
                        color="secondary"
                      >
                        إلغاء
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="الاسم الكامل"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!editMode}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="رقم الهاتف"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="البريد الإلكتروني"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                      variant="outlined"
                      type="email"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="نبذة شخصية"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!editMode}
                      variant="outlined"
                      multiline
                      rows={3}
                      placeholder="اكتب نبذة مختصرة عنك..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* الإعدادات العامة */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SettingsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    الإعدادات العامة
                  </Typography>
                </Box>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="اللغة" />
                    <ListItemSecondaryAction>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        >
                          <MenuItem value="ar">العربية</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <PaletteIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="المظهر" />
                    <ListItemSecondaryAction>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={settings.theme}
                          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                        >
                          <MenuItem value="light">فاتح</MenuItem>
                          <MenuItem value="dark">داكن</MenuItem>
                          <MenuItem value="auto">تلقائي</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* إعدادات الإشعارات */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    إعدادات الإشعارات
                  </Typography>
                </Box>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="إشعارات البريد الإلكتروني"
                      secondary="تلقي الإشعارات عبر البريد الإلكتروني"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: e.target.checked }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="الإشعارات الفورية"
                      secondary="تلقي الإشعارات الفورية في التطبيق"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: e.target.checked }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="الرسائل النصية"
                      secondary="تلقي الإشعارات عبر الرسائل النصية"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sms: e.target.checked }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* الأمان والخصوصية */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    الأمان والخصوصية
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LockResetIcon />}
                      sx={{ py: 1.5 }}
                    >
                      تغيير كلمة المرور
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      sx={{ py: 1.5 }}
                    >
                      إعدادات الأمان
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  إعدادات الخصوصية
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="إظهار رقم الهاتف"
                      secondary="السماح للآخرين برؤية رقم هاتفك"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.privacy.showPhone}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, showPhone: e.target.checked }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText 
                      primary="إظهار البريد الإلكتروني"
                      secondary="السماح للآخرين برؤية بريدك الإلكتروني"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.privacy.showEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          privacy: { ...settings.privacy, showEmail: e.target.checked }
                        })}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfile;
