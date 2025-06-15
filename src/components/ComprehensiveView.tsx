import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MosqueIcon from '@mui/icons-material/Mosque';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import comprehensiveService, { ComprehensiveOverview } from '../services/comprehensiveService';

const ComprehensiveView: React.FC = () => {  const theme = useTheme();
  const { user } = useAppContext();
  
  const supervisorId = 1; // مؤقتاً
  // جلب البيانات الشاملة باستخدام React Query
  const {
    data,
    isLoading: loading,
    error: queryError,
    isError
  } = useQuery({
    queryKey: ['comprehensiveOverview', supervisorId],
    queryFn: async () => {
      console.log('🚀 React Query: بدء جلب النظرة الشاملة من API');
      const result = await comprehensiveService.getComprehensiveOverview(supervisorId, user?.token);
      console.log('✅ React Query: تم جلب النظرة الشاملة من API:', result);
      return result;
    },
    enabled: true, // تفعيل Query دائماً لأن API يعمل بدون token في البيئة الحالية
    retry: 1,
  });

  const error = isError ? 'فشل في تحميل البيانات الشاملة' : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            جاري تحميل النظرة الشاملة...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error || 'لم يتم العثور على البيانات'}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* معلومات المشرف */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 60, height: 60 }}>
            <PersonIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {data.supervisor.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {data.supervisor.email}
            </Typography>
          </Box>
        </Box>

        {/* الإحصائيات العامة */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={2.4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <MosqueIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {data.summary.total_mosques}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                مسجد
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {data.summary.total_circles}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                حلقة
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <GroupIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {data.summary.total_groups}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                مجموعة فرعية
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <PersonIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {data.summary.total_teachers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                معلم
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {data.summary.total_students}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                طالب
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* تفاصيل المساجد */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        تفاصيل المساجد والحلقات
      </Typography>

      {data.mosques.map((mosqueData, index) => (
        <Accordion key={mosqueData.mosque.id} sx={{ mb: 2, borderRadius: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              borderRadius: 1,
              '&:hover': { bgcolor: 'primary.main' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <MosqueIcon sx={{ mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {mosqueData.mosque.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {mosqueData.mosque.neighborhood} • {mosqueData.mosque_summary.circles_count} حلقة • {mosqueData.mosque_summary.students_count} طالب
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', mr: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  {mosqueData.mosque_summary.groups_count}
                </Typography>
                <Typography variant="caption">
                  مجموعة فرعية
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={3}>
              {mosqueData.circles.map((circle) => (
                <Grid item xs={12} key={circle.id}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      {/* معلومات الحلقة */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {circle.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {circle.type} • {circle.time_period} • {circle.status}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${circle.circle_summary.students_count} طالب`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* المعلمون */}
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        المعلمون ({circle.circle_summary.teachers_count})
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {circle.teachers.map((teacher) => (
                          <Grid item xs={12} md={6} key={teacher.id}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2, bgcolor: 'success.light' }}>
                                  {teacher.name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {teacher.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {teacher.phone} • {teacher.job_title}
                                  </Typography>
                                  <br />
                                  <Typography variant="caption" color="text.secondary">
                                    {teacher.task_type} • {teacher.work_time}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      {/* المجموعات الفرعية */}
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        المجموعات الفرعية ({circle.circle_summary.groups_count})
                      </Typography>
                      <Grid container spacing={2}>
                        {circle.groups.map((group) => (
                          <Grid item xs={12} md={4} key={group.id}>
                            <Card variant="outlined" sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {group.name}
                                </Typography>
                                <Chip 
                                  label={group.status}
                                  size="small"
                                  color={group.status === 'نشطة' ? 'success' : 'default'}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {group.description || 'لا يوجد وصف'}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  عدد الطلاب:
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                  {group.students_count}
                                </Typography>
                              </Box>
                              
                              {/* شريط التقدم */}
                              <LinearProgress 
                                variant="determinate" 
                                value={group.students_count > 0 ? (group.students_count / 15) * 100 : 0} // افتراض الحد الأقصى 15 طالب
                                sx={{ mt: 1 }}
                                color={group.students_count > 10 ? "success" : group.students_count > 5 ? "warning" : "error"}
                              />
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default ComprehensiveView;
