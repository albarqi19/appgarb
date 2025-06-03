import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  useCustomSpinner?: boolean;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'جاري التحميل...',
  size = 'medium',
  useCustomSpinner = true,
  fullScreen = false
}) => {
  const theme = useTheme();
  
  const getSizeValue = () => {
    switch (size) {
      case 'small': return { spinner: 40, image: 60 };
      case 'large': return { spinner: 80, image: 120 };
      default: return { spinner: 60, image: 80 };
    }
  };
  
  const sizeValue = getSizeValue();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullScreen ? '100vw' : '100%',
        height: fullScreen ? '100vh' : '100%',
        padding: 3,
        backdropFilter: fullScreen ? 'blur(4px)' : 'none',
        position: fullScreen ? 'fixed' : 'relative',
        top: fullScreen ? 0 : 'auto',
        left: fullScreen ? 0 : 'auto',
        zIndex: fullScreen ? 9999 : 1
      }}
    >
      {useCustomSpinner ? (
        <Box
          component="img"
          src="/assets/islamic-spinner.svg"
          alt="جاري التحميل"
          sx={{
            width: sizeValue.image,
            height: sizeValue.image,
            mb: 2
          }}
        />
      ) : (
        <CircularProgress
          size={sizeValue.spinner}
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
            mb: 2
          }}
        />
      )}
      
      {message && (
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: 300
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
