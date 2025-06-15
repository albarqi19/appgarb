import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,  Chip,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,  TextField
} from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  PictureAsPdf as PdfIcon,
  GetApp as ExcelIcon,
  Print as PrintIcon,
  Share as ShareIcon 
} from '@mui/icons-material';
import { SupervisorStudent, SupervisorTeacher, SupervisorCircle } from '../services/supervisorService';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  reportType: 'students' | 'teachers' | 'mosques' | 'ai' | null;
  students: SupervisorStudent[];
  teachers: SupervisorTeacher[];
  circles: SupervisorCircle[];
  aiRecommendations: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  reportType,
  students,
  teachers,
  circles,
  aiRecommendations
}) => {
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedMosque, setSelectedMosque] = useState('all');

  // إعداد البيانات للتقارير
  const getStudentsReportData = () => {
    const totalStudents = students.length;
    const avgScore = students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + (s.total_score || 0), 0) / students.length)
      : 0;
    
    // توزيع الدرجات
    const scoreDistribution = [
      { name: 'ممتاز (90-100)', value: students.filter(s => (s.total_score || 0) >= 90).length, color: '#4CAF50' },
      { name: 'جيد جداً (80-89)', value: students.filter(s => (s.total_score || 0) >= 80 && (s.total_score || 0) < 90).length, color: '#8BC34A' },
      { name: 'جيد (70-79)', value: students.filter(s => (s.total_score || 0) >= 70 && (s.total_score || 0) < 80).length, color: '#FFC107' },
      { name: 'مقبول (60-69)', value: students.filter(s => (s.total_score || 0) >= 60 && (s.total_score || 0) < 70).length, color: '#FF9800' },
      { name: 'يحتاج تحسين (<60)', value: students.filter(s => (s.total_score || 0) < 60).length, color: '#F44336' }
    ];

    // الطلاب حسب المسجد
    const mosqueStats = Array.from(new Set(circles.map(c => c.mosque.id))).map(mosqueId => {
      const mosque = circles.find(c => c.mosque.id === mosqueId)?.mosque;
      const mosqueStudents = students.filter(s => s.circle?.mosque?.id === mosqueId);
      const mosqueAvgScore = mosqueStudents.length > 0 
        ? Math.round(mosqueStudents.reduce((sum, s) => sum + (s.total_score || 0), 0) / mosqueStudents.length)
        : 0;
      
      return {
        name: mosque?.name || 'غير محدد',
        students: mosqueStudents.length,
        avgScore: mosqueAvgScore
      };
    });

    return {
      totalStudents,
      avgScore,
      scoreDistribution: scoreDistribution.filter(item => item.value > 0),
      mosqueStats,
      topPerformers: students
        .filter(s => (s.total_score || 0) >= 90)
        .sort((a, b) => (b.total_score || 0) - (a.total_score || 0))
        .slice(0, 5),
      needsAttention: students
        .filter(s => (s.total_score || 0) < 60)
        .sort((a, b) => (a.total_score || 0) - (b.total_score || 0))
        .slice(0, 5)
    };
  };

  const getTeachersReportData = () => {
    const totalTeachers = teachers.length;
    const avgStudentsPerTeacher = teachers.length > 0 
      ? Math.round(teachers.reduce((sum, t) => sum + t.students_count, 0) / teachers.length)
      : 0;
    const avgCirclesPerTeacher = teachers.length > 0 
      ? Math.round(teachers.reduce((sum, t) => sum + t.circles_count, 0) / teachers.length)
      : 0;

    // توزيع المعلمين حسب عدد الطلاب
    const teacherDistribution = [
      { name: '1-10 طلاب', value: teachers.filter(t => t.students_count <= 10).length },
      { name: '11-20 طالب', value: teachers.filter(t => t.students_count > 10 && t.students_count <= 20).length },
      { name: '21-30 طالب', value: teachers.filter(t => t.students_count > 20 && t.students_count <= 30).length },
      { name: 'أكثر من 30 طالب', value: teachers.filter(t => t.students_count > 30).length }
    ].filter(item => item.value > 0);

    return {
      totalTeachers,
      avgStudentsPerTeacher,
      avgCirclesPerTeacher,
      teacherDistribution,
      topTeachers: teachers
        .sort((a, b) => b.students_count - a.students_count)
        .slice(0, 5)
    };
  };

  const renderReport = () => {
    switch (reportType) {
      case 'students':
        const studentsData = getStudentsReportData();
        return (
          <Box>
            {/* إحصائيات عامة */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {studentsData.totalStudents}
                    </Typography>
                    <Typography variant="body2">إجمالي الطلاب</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {studentsData.avgScore}%
                    </Typography>
                    <Typography variant="body2">متوسط الدرجات</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {studentsData.topPerformers.length}
                    </Typography>
                    <Typography variant="body2">طلاب متفوقون</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* رسم بياني للدرجات */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>توزيع الدرجات</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={studentsData.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {studentsData.scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* إحصائيات المساجد */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>الطلاب حسب المسجد</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentsData.mosqueStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#8884d8" name="عدد الطلاب" />
                    <Bar dataKey="avgScore" fill="#82ca9d" name="متوسط الدرجات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* قوائم الطلاب */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      الطلاب المتفوقون
                    </Typography>
                    {studentsData.topPerformers.map((student, index) => (
                      <Box key={student.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'success.light' }}>
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.circle?.mosque?.name} - {student.total_score}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="error.main" gutterBottom>
                      يحتاجون اهتمام
                    </Typography>
                    {studentsData.needsAttention.map((student, index) => (
                      <Box key={student.id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'error.light' }}>
                          !
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.circle?.mosque?.name} - {student.total_score || 0}%
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 'teachers':
        const teachersData = getTeachersReportData();
        return (
          <Box>
            {/* إحصائيات المعلمين */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {teachersData.totalTeachers}
                    </Typography>
                    <Typography variant="body2">إجمالي المعلمين</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {teachersData.avgStudentsPerTeacher}
                    </Typography>
                    <Typography variant="body2">متوسط الطلاب/معلم</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {teachersData.avgCirclesPerTeacher}
                    </Typography>
                    <Typography variant="body2">متوسط الحلقات/معلم</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* توزيع المعلمين */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>توزيع المعلمين حسب عدد الطلاب</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={teachersData.teacherDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {teachersData.teacherDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* أفضل المعلمين */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>أفضل المعلمين (حسب عدد الطلاب)</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>الترتيب</TableCell>
                        <TableCell>اسم المعلم</TableCell>
                        <TableCell>عدد الطلاب</TableCell>
                        <TableCell>عدد الحلقات</TableCell>
                        <TableCell>المساجد</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teachersData.topTeachers.map((teacher, index) => (
                        <TableRow key={teacher.id}>
                          <TableCell>
                            <Avatar sx={{ bgcolor: index < 3 ? 'warning.main' : 'grey.400' }}>
                              {index + 1}
                            </Avatar>
                          </TableCell>
                          <TableCell>{teacher.name}</TableCell>
                          <TableCell>{teacher.students_count}</TableCell>
                          <TableCell>{teacher.circles_count}</TableCell>
                          <TableCell>
                            {teacher.mosques?.slice(0, 2).map(m => m.name).join(', ')}
                            {teacher.mosques && teacher.mosques.length > 2 && ` +${teacher.mosques.length - 2}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return (
          <Typography variant="body1" color="text.secondary">
            يرجى اختيار نوع التقرير
          </Typography>
        );
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'students': return 'تقرير الطلاب الشامل';
      case 'teachers': return 'تقرير المعلمين الشامل';
      case 'mosques': return 'تقرير المساجد الشامل';
      case 'ai': return 'تقرير التوصيات الذكية';
      default: return 'تقرير';
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // TODO: تنفيذ التصدير
    console.log(`تصدير التقرير بصيغة ${format}`);
    alert(`سيتم تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">
            {getReportTitle()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>الفترة</InputLabel>
              <Select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                label="الفترة"
              >
                <MenuItem value="weekly">أسبوعي</MenuItem>
                <MenuItem value="monthly">شهري</MenuItem>
                <MenuItem value="quarterly">ربع سنوي</MenuItem>
                <MenuItem value="yearly">سنوي</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {renderReport()}
      </DialogContent>
      
      <DialogActions>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<PdfIcon />}
              onClick={() => handleExport('pdf')}
              variant="outlined"
              color="error"
            >
              تصدير PDF
            </Button>
            <Button
              startIcon={<ExcelIcon />}
              onClick={() => handleExport('excel')}
              variant="outlined"
              color="success"
            >
              تصدير Excel
            </Button>
            <Button
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              variant="outlined"
            >
              طباعة
            </Button>
          </Box>
          <Button onClick={onClose} variant="contained">
            إغلاق
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;
