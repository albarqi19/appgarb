import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
  Badge,
  Tooltip,
  Container,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MosqueIcon from '@mui/icons-material/Mosque';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { aiRecommendations } from '../data/ai-insights';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { currentMosque, themeMode, toggleThemeMode, user, currentRole, logout, isAuthenticated } = useAppContext();
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  const handleLogout = () => {
    logout();
    navigate('/login');
    handleUserMenuClose();
  };

  const handleRoleSwitch = () => {
    navigate('/role-selection');
    handleUserMenuClose();
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

  // إخفاء الهيدر في صفحة تسجيل الدخول وصفحة اختيار الدور
  if (location.pathname === '/login' || location.pathname === '/role-selection') {
    return null;
  }  // قائمة العناصر في القائمة الجانبية
  const drawerItems = [
    { text: 'لوحة التحكم', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'المدارس القرآنية', icon: <MosqueIcon />, path: '/' },
    { text: 'القرآن الكريم', icon: <MenuBookIcon />, path: '/quran' },
    { text: 'قائمة الطلاب', icon: <PeopleIcon />, path: '/students', disabled: !currentMosque },
    { text: 'سجل التحضير', icon: <AssignmentIcon />, path: '/attendance-log', disabled: !currentMosque }
  ];
  const drawer = (
    <Box sx={{ width: 280 }}>
      <Toolbar /> {/* مساحة للشريط العلوي */}
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(30, 111, 142, 0.05) 0%, rgba(30, 111, 142, 0.02) 100%)'
        }}
      >
        <Avatar 
          sx={{ 
            width: 75, 
            height: 75, 
            bgcolor: 'primary.main', 
            mb: 2,
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}
        >
          <MenuBookIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" color="primary.dark" fontWeight="bold" sx={{ mb: 0.5 }}>
          منصة غرب
        </Typography>
        <Typography variant="body2" color="text.secondary">
          لإدارة حلقات القرآن الكريم
        </Typography>
      </Box>
      <Divider />
      <List sx={{ p: 2 }}>
        {drawerItems.map((item) => (
          <ListItem
            component="div"
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            disabled={item.disabled}
            selected={location.pathname === item.path}
            sx={{
              mb: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
              '&:hover': {
                backgroundColor: item.disabled ? '' : 'rgba(30, 111, 142, 0.1)'
              },
              cursor: item.disabled ? 'default' : 'pointer'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 'bold' : 'normal' }} 
            />
          </ListItem>
        ))}
      </List>      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Button 
          variant="outlined" 
          color="primary"
          fullWidth 
          startIcon={themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          onClick={toggleThemeMode}
          sx={{ borderRadius: 2, mb: 2, py: 1 }}
        >
          {themeMode === 'dark' ? 'وضع النهار' : 'الوضع الليلي'}
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          fullWidth 
          startIcon={<ExitToAppIcon />}
          onClick={() => console.log('تسجيل الخروج - للعرض فقط')}
          sx={{ borderRadius: 2, py: 1 }}
        >
          تسجيل الخروج
        </Button>
      </Box>
    </Box>
  );

  return (
    <React.Fragment>      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: themeMode === 'light' 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'rgba(17, 34, 64, 0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: themeMode === 'light' 
            ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
            : '0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>              <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              aria-label="قائمة"
              sx={{ mr: 2, color: themeMode === 'light' ? 'primary.main' : 'primary.light' }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                flexGrow: { xs: 1, md: 0 } 
              }}
              onClick={() => navigate('/')}
            >
              <Avatar 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  bgcolor: 'primary.main', 
                  mr: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <MenuBookIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography 
                variant="h6" 
                component="div"                sx={{ 
                  fontWeight: 'bold',
                  color: themeMode === 'light' ? 'primary.dark' : 'primary.light',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                منصة غرب
              </Typography>
            </Box>
            
            {/* روابط التنقل للشاشات المتوسطة والكبيرة */}
            <Box 
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'none', md: 'flex' },
                px: 3,
                justifyContent: 'center'
              }}
            >
              {drawerItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => handleNavigation(item.path)}
                  disabled={item.disabled}
                  startIcon={item.icon}
                  color={location.pathname === item.path ? 'primary' : 'inherit'}
                  variant={location.pathname === item.path ? 'contained' : 'text'}
                  sx={{ 
                    mx: 1, 
                    borderRadius: 2,
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    boxShadow: location.pathname === item.path ? 2 : 0
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={themeMode === 'dark' ? 'وضع النهار' : 'الوضع الليلي'}>
                <IconButton 
                  onClick={toggleThemeMode}
                  sx={{ 
                    mx: 0.5,
                    bgcolor: 'background.default',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="الإشعارات">
                <IconButton 
                  sx={{ 
                    mx: 0.5,
                    bgcolor: 'background.default',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <Badge 
                    badgeContent={aiRecommendations.length} 
                    color="error"
                  >
                    <NotificationsIcon color="primary" />
                  </Badge>
                </IconButton>
              </Tooltip>
                <Tooltip title="توصيات الذكاء الاصطناعي">
                <IconButton 
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    mx: 0.5,
                    bgcolor: 'background.default',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  <LightbulbIcon color="warning" />
                </IconButton>
              </Tooltip>

              {/* معلومات المستخدم */}
              {isAuthenticated && user && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  {/* عرض الأدوار للمستخدمين الذين لديهم أكثر من دور */}
                  {user.roles.length > 1 && (
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>                      {user.roles.map((role, index) => (
                        <Chip
                          key={role}
                          label={getRoleLabel(role)}
                          size="small"
                          variant={role === (currentRole || user.defaultRole) ? "filled" : "outlined"}
                          color={role === (currentRole || user.defaultRole) ? "primary" : "default"}
                          sx={{ 
                            mr: index < user.roles.length - 1 ? 0.5 : 0,
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* زر المستخدم */}
                  <Tooltip title={user.name}>
                    <IconButton
                      onClick={handleUserMenuOpen}
                      sx={{
                        bgcolor: 'background.default',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: 'primary.main',
                          fontSize: '0.9rem'
                        }}
                      >
                        {user.name.split(' ')[0][0]}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  {/* قائمة المستخدم */}
                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={handleUserMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 220,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    {/* معلومات المستخدم */}
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.phone}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={getRoleLabel(role)}
                            size="small"
                            variant={role === (currentRole || user.defaultRole) ? "filled" : "outlined"}
                            color={role === (currentRole || user.defaultRole) ? "primary" : "default"}
                          />
                        ))}
                      </Box>
                    </Box>                    {/* عنصر الملف الشخصي */}
                    <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
                      <AccountCircleIcon sx={{ mr: 1 }} />
                      الملف الشخصي
                    </MenuItem>{/* تبديل الدور للمستخدمين الذين لديهم أكثر من دور */}
                    {user.roles.length > 1 && (
                      <MenuItem onClick={handleRoleSwitch}>
                        <SwitchAccountIcon sx={{ mr: 1 }} />
                        تبديل الدور
                      </MenuItem>
                    )}

                    <Divider />

                    {/* تسجيل الخروج */}
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <LogoutIcon sx={{ mr: 1 }} />
                      تسجيل الخروج
                    </MenuItem>
                  </Menu>
                </Box>
              )}

              {/* زر تسجيل الدخول للمستخدمين غير المسجلين */}
              {!isAuthenticated && (
                <Box sx={{ display: { xs: 'none', sm: 'block' }, ml: 2 }}>
                  <Button
                    color="primary" 
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    onClick={() => navigate('/login')}
                    sx={{ borderRadius: 2 }}
                  >
                    تسجيل الدخول
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // لأداء أفضل على الأجهزة المحمولة
        }}
        PaperProps={{
          sx: {
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: (theme) => theme.zIndex.drawer,
            width: 280,
          }
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
    </React.Fragment>
  );
};

export default Header;