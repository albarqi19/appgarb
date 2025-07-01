import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';

const API_BASE_URL = 'https://inviting-pleasantly-barnacle.ngrok-free.app';

const TestTeacherAPI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      // اختبار بدون تصريح أولاً
      const response = await fetch(
        `${API_BASE_URL}/api/supervisors/teachers-daily-activity?supervisor_id=1&date=2025-07-01`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
      }

      const result = await response.json();
      console.log('Success response:', result);
      setData(result);

    } catch (err: any) {
      console.error('Test error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWithDifferentParams = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      // اختبار مع معرف مختلف
      const response = await fetch(
        `${API_BASE_URL}/api/supervisors/teachers-daily-activity?supervisor_id=34&date=2025-07-01`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      setData(result);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🧪 اختبار API متابعة المعلمين
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          هذه صفحة اختبار للتأكد من عمل API متابعة نشاط المعلمين
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={testAPI}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            اختبار supervisor_id=1
          </Button>
          
          <Button
            variant="outlined"
            onClick={testWithDifferentParams}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            اختبار supervisor_id=34
          </Button>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6">خطأ في الاستجابة:</Typography>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {error}
            </pre>
          </Alert>
        )}

        {data && (
          <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
            <Typography variant="h6" color="success.dark" gutterBottom>
              ✅ نجح الطلب! البيانات المستلمة:
            </Typography>
            
            {data.data && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">معلومات المشرف</Typography>
                      <Typography>الاسم: {data.data.supervisor?.name || 'غير محدد'}</Typography>
                      <Typography>المعرف: {data.data.supervisor?.id || 'غير محدد'}</Typography>
                      <Typography>التاريخ: {data.data.date}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">ملخص النشاط</Typography>
                      {data.data.summary && (
                        <>
                          <Typography>إجمالي المعلمين: {data.data.summary.total_teachers}</Typography>
                          <Typography>معلمين نشطين: {data.data.summary.active_teachers}</Typography>
                          <Typography>معدل الإنجاز: {data.data.summary.completion_rate}%</Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {data.data.teachers_activity && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      قائمة المعلمين ({data.data.teachers_activity.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {data.data.teachers_activity.slice(0, 4).map((teacher: any, index: number) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {teacher.teacher_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {teacher.phone}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                المسجد: {teacher.mosque?.name}
                              </Typography>
                              <Typography variant="body2">
                                الحلقة: {teacher.circle?.name}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={teacher.daily_activity?.activity_status || 'غير محدد'}
                                  color={
                                    teacher.daily_activity?.status_color === 'green' ? 'success' :
                                    teacher.daily_activity?.status_color === 'orange' ? 'warning' : 'error'
                                  }
                                  size="small"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                )}
              </Grid>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                البيانات الكاملة (JSON):
              </Typography>
              <pre style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '10px',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            </Box>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default TestTeacherAPI;
