import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface IslamicAlertProps {
  title?: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error' | 'achievement';
  onClose?: () => void;
  showCloseButton?: boolean;
  autoHideDuration?: number;
  isOpen?: boolean;
  square?: boolean;
}

const IslamicAlert: React.FC<IslamicAlertProps> = ({
  title,
  message,
  severity,
  onClose,
  showCloseButton = true,
  autoHideDuration,
  isOpen = true,
  square = false
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(isOpen);
  
  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  React.useEffect(() => {
    if (autoHideDuration && open) {
      const timer = setTimeout(() => {
        setOpen(false);
        if (onClose) onClose();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, open, onClose]);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'achievement':
        return <AutoAwesomeIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getBackground = () => {
    switch (severity) {
      case 'success':
        return theme.palette.success.light;
      case 'warning':
        return theme.palette.warning.light;
      case 'error':
        return theme.palette.error.light;
      case 'achievement':
        return 'linear-gradient(135deg, #f8e3a3 0%, #f5d76e 100%)';
      default:
        return theme.palette.info.light;
    }
  };

  const getTextColor = () => {
    switch (severity) {
      case 'achievement':
        return '#5d4037';
      default:
        return '';
    }
  };

  const getBorderStyle = () => {
    switch (severity) {
      case 'achievement':
        return '1px solid #e6c351';
      default:
        return '';
    }
  };

  const getDecorationSvg = () => {
    if (severity === 'achievement') {
      return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24'%3E%3Cpath d='M12 2L9.5 8.5 2 9.5 7 14 5.5 21.5 12 18l6.5 3.5-1.5-7.5 5-4.5-7.5-1z' fill='%23e6c351' opacity='0.3'/%3E%3C/svg%3E")`;
    }
    return 'none';
  };

  return (
    <Collapse in={open}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: square ? 0 : 2,
          overflow: 'hidden',
          background: getBackground(),
          border: getBorderStyle(),
          position: 'relative',
          backgroundImage: getDecorationSvg(),
          backgroundRepeat: 'repeat',
          backgroundPosition: 'right top',
        }}
      >
        <Box
          sx={{
            padding: 2,
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ mr: 2, mt: 0.5, color: severity === 'achievement' ? '#e6c351' : '' }}>
            {getIcon()}
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            {title && (
              <Typography 
                variant="subtitle1" 
                component="h3" 
                sx={{ 
                  fontWeight: 600,
                  color: getTextColor() 
                }}
              >
                {title}
              </Typography>
            )}
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: getTextColor(),
                whiteSpace: 'pre-line'
              }}
            >
              {message}
            </Typography>
          </Box>
          
          {showCloseButton && (
            <IconButton 
              size="small" 
              onClick={handleClose}
              sx={{ ml: 1, mt: -0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Paper>
    </Collapse>
  );
};

export default IslamicAlert;
