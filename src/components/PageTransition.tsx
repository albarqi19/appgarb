import React from 'react';
import { Box, Fade, Grow } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'grow';
  duration?: number;
  delay?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 800,
  delay = 150
}) => {
  if (type === 'grow') {
    return (
      <Grow 
        in={true} 
        style={{ transformOrigin: 'center center' }}
        timeout={{ enter: duration, exit: duration / 2 }}
      >
        <Box sx={{ height: '100%', width: '100%' }}>{children}</Box>
      </Grow>
    );
  }

  return (
    <Fade 
      in={true} 
      timeout={{ enter: duration, exit: duration / 2 }}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Box sx={{ height: '100%', width: '100%' }}>{children}</Box>
    </Fade>
  );
};

export default PageTransition;
