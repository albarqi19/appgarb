# خطة الانتقال إلى React Native - واجهة المعلم

## 📝 نظرة عامة
هذه خطة مفصلة للانتقال من منصة الويب الحالية إلى تطبيق React Native محمول مع التركيز على واجهة المعلم فقط كمرحلة أولى.

---

## 🎯 الأهداف الرئيسية

### 1. الأهداف الأساسية
- ✅ إنشاء تطبيق محمول للمعلمين فقط
- ✅ الحفاظ على جميع وظائف المعلم الأساسية
- ✅ تحسين تجربة المستخدم للأجهزة المحمولة
- ✅ ضمان الأداء السريع والسلس

### 2. النطاق المحدود (المعلم فقط)
- ✅ لوحة تحكم المعلم (Dashboard)
- ✅ إدارة الطلاب
- ✅ تسجيل الحضور
- ✅ جلسات التسميع
- ✅ الإحصائيات والتقارير البسيطة
- ✅ إعدادات الملف الشخصي

---

## 📱 تحليل الواجهة الحالية للمعلم

### 1. الصفحات الرئيسية المطلوبة
```
Teacher App Structure:
├── Authentication/
│   ├── Login Screen
│   └── Forgot Password
├── Dashboard/
│   ├── Overview Cards (الحلقات، الطلاب، المساجد)
│   ├── Quick Stats
│   └── Recent Activities
├── Students/
│   ├── Students List
│   ├── Student Details
│   ├── Add/Edit Student
│   └── Student Performance
├── Attendance/
│   ├── Mark Attendance
│   ├── Attendance History
│   └── Absent Students Alert
├── Recitation/
│   ├── Session Management
│   ├── Grading Interface
│   └── Progress Tracking
├── Reports/
│   ├── Basic Charts
│   └── Export Options
└── Profile/
    ├── Personal Info
    ├── Settings
    └── Logout
```

### 2. المكونات الحالية التي تحتاج تحويل
- **Dashboard**: بطاقات الإحصائيات، الرسوم البيانية البسيطة
- **StudentsList**: قائمة الطلاب مع البحث والفلترة
- **AttendanceManager**: تسجيل الحضور
- **MemorizationSession**: جلسات التسميع
- **Header/Navigation**: التنقل المحمول

---

## 🛠️ المرحلة 1: إعداد البيئة والبنية الأساسية

### 1.1 إعداد مشروع React Native جديد (أسبوع 1)

#### تثبيت الأدوات المطلوبة:
```bash
# React Native CLI
npm install -g @react-native-community/cli

# إنشاء مشروع جديد
npx react-native init GharbTeacherApp --template react-native-template-typescript

# الانتقال للمشروع
cd GharbTeacherApp
```

#### المكتبات الأساسية المطلوبة:
```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.0",
    "react-navigation/native": "^6.1.0",
    "react-navigation/stack": "^6.3.0",
    "react-navigation/bottom-tabs": "^6.5.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-paper": "^5.10.0",
    "react-native-elements": "^3.4.3",
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "^13.4.0",
    "react-native-date-picker": "^4.3.0",
    "@tanstack/react-query": "^4.32.0",
    "axios": "^1.5.0",
    "react-native-async-storage": "^1.19.0",
    "react-native-keychain": "^8.1.0",
    "react-native-orientation-locker": "^1.5.0",
    "react-native-permissions": "^3.8.0",
    "react-native-splash-screen": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.72.0",
    "typescript": "^5.1.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### 1.2 إعداد بنية المشروع (أسبوع 1)

```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── Loading/
│   ├── navigation/
│   └── charts/
├── screens/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Students/
│   ├── Attendance/
│   ├── Recitation/
│   ├── Reports/
│   └── Profile/
├── services/
│   ├── api/
│   ├── storage/
│   └── auth/
├── hooks/
├── utils/
├── types/
├── theme/
└── constants/
```

### 1.3 إعداد Navigation (أسبوع 1)

```tsx
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Students" component={StudentsScreen} />
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
    <Tab.Screen name="Reports" component={ReportsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

---

## 🎨 المرحلة 2: تصميم نظام UI/UX (أسبوعان 2-3)

### 2.1 نظام الألوان والثيم

```tsx
// src/theme/colors.ts
export const colors = {
  primary: '#1e6f8e',
  primaryLight: '#4a9fbe',
  primaryDark: '#134b60',
  secondary: '#ff9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  border: '#e0e0e0'
};

// src/theme/typography.ts
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold', fontFamily: 'Cairo-Bold' },
  h2: { fontSize: 28, fontWeight: 'bold', fontFamily: 'Cairo-Bold' },
  h3: { fontSize: 24, fontWeight: '600', fontFamily: 'Cairo-SemiBold' },
  body1: { fontSize: 16, fontFamily: 'Cairo-Regular' },
  body2: { fontSize: 14, fontFamily: 'Cairo-Regular' },
  caption: { fontSize: 12, fontFamily: 'Cairo-Light' }
};
```

### 2.2 مكونات UI أساسية

#### Button Component
```tsx
// src/components/common/Button/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};
```

#### Card Component
```tsx
// src/components/common/Card/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  elevation = 2 
}) => {
  return (
    <View style={[styles.card, { elevation }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});
```

### 2.3 تصميم الشاشات الأساسية

#### Dashboard Layout
```tsx
// src/screens/Dashboard/DashboardScreen.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { StatsCards } from './components/StatsCards';
import { QuickActions } from './components/QuickActions';
import { RecentActivities } from './components/RecentActivities';

export const DashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <StatsCards />
      <QuickActions />
      <RecentActivities />
    </ScrollView>
  );
};
```

---

## 🔧 المرحلة 3: تحويل الخدمات والAPI (أسبوع 4)

### 3.1 إعداد HTTP Client

```tsx
// src/services/api/client.ts
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: 'https://api.gharb-platform.com', // استخدم نفس API الموجود
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private async setupInterceptors() {
    this.instance.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle auth errors
        if (error.response?.status === 401) {
          // Redirect to login
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.instance.get(url);
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.instance.post(url, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### 3.2 تحويل خدمات المعلم

```tsx
// src/services/teacher.service.ts
import { apiClient } from './api/client';
import { Teacher, Student, Circle, AttendanceRecord } from '../types';

export class TeacherService {
  
  async getTeacherDashboard(teacherId: string) {
    return apiClient.get(`/teacher/dashboard?teacher_id=${teacherId}`);
  }

  async getTeacherCircles(teacherId: string): Promise<Circle[]> {
    return apiClient.get(`/teacher/circles?teacher_id=${teacherId}`);
  }

  async getTeacherStudents(teacherId: string): Promise<Student[]> {
    return apiClient.get(`/teacher/students?teacher_id=${teacherId}`);
  }

  async markAttendance(attendanceData: AttendanceRecord) {
    return apiClient.post('/teacher/attendance', attendanceData);
  }

  async getTodayAttendance(teacherId: string) {
    const today = new Date().toISOString().split('T')[0];
    return apiClient.get(`/teacher/attendance?teacher_id=${teacherId}&date=${today}`);
  }

  async recordRecitationSession(sessionData: any) {
    return apiClient.post('/teacher/recitation', sessionData);
  }
}

export const teacherService = new TeacherService();
```

### 3.3 State Management مع React Query

```tsx
// src/hooks/useTeacher.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '../services/teacher.service';

export const useTeacherDashboard = (teacherId: string) => {
  return useQuery({
    queryKey: ['teacher-dashboard', teacherId],
    queryFn: () => teacherService.getTeacherDashboard(teacherId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTeacherStudents = (teacherId: string) => {
  return useQuery({
    queryKey: ['teacher-students', teacherId],
    queryFn: () => teacherService.getTeacherStudents(teacherId),
  });
};

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: teacherService.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-attendance'] });
    },
  });
};
```

---

## 📱 المرحلة 4: تطوير الشاشات الأساسية (أسابيع 5-8)

### 4.1 شاشة لوحة التحكم (أسبوع 5)

```tsx
// src/screens/Dashboard/DashboardScreen.tsx
import React from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { useTeacherDashboard } from '../../hooks/useTeacher';
import { StatsCard } from '../../components/StatsCard';
import { CirclesList } from './components/CirclesList';
import { RecentActivity } from './components/RecentActivity';

export const DashboardScreen: React.FC = () => {
  const { data: dashboardData, isLoading, refetch } = useTeacherDashboard('teacher-id');

  return (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={styles.statsContainer}>
        <StatsCard 
          title="الحلقات"
          value={dashboardData?.circles_count || 0}
          icon="users"
          color="#4caf50"
        />
        <StatsCard 
          title="الطلاب"
          value={dashboardData?.students_count || 0}
          icon="user"
          color="#2196f3"
        />
        <StatsCard 
          title="نسبة الحضور"
          value={`${dashboardData?.attendance_rate || 0}%`}
          icon="check-circle"
          color="#ff9800"
        />
      </View>
      
      <CirclesList circles={dashboardData?.circles || []} />
      <RecentActivity activities={dashboardData?.recent_activities || []} />
    </ScrollView>
  );
};
```

### 4.2 شاشة الطلاب (أسبوع 6)

```tsx
// src/screens/Students/StudentsListScreen.tsx
import React, { useState } from 'react';
import { FlatList, View, TextInput, TouchableOpacity } from 'react-native';
import { useTeacherStudents } from '../../hooks/useTeacher';
import { StudentCard } from './components/StudentCard';
import { SearchBar } from '../../components/SearchBar';

export const StudentsListScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: students = [], isLoading } = useTeacherStudents('teacher-id');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudent = ({ item }: { item: Student }) => (
    <StudentCard 
      student={item}
      onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="البحث عن طالب..."
      />
      
      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
```

### 4.3 شاشة الحضور (أسبوع 7)

```tsx
// src/screens/Attendance/AttendanceScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { useTeacherStudents, useMarkAttendance } from '../../hooks/useTeacher';
import { AttendanceCard } from './components/AttendanceCard';
import { Button } from '../../components/common/Button';

export const AttendanceScreen: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const { data: students = [] } = useTeacherStudents('teacher-id');
  const markAttendanceMutation = useMarkAttendance();

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const submitAttendance = async () => {
    try {
      const records = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        status,
        date: new Date().toISOString().split('T')[0]
      }));

      await markAttendanceMutation.mutateAsync({ records });
      Alert.alert('نجح', 'تم حفظ الحضور بنجاح');
      setAttendanceData({});
    } catch (error) {
      Alert.alert('خطأ', 'فشل في حفظ الحضور');
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <AttendanceCard
      student={item}
      selectedStatus={attendanceData[item.id]}
      onStatusChange={(status) => handleAttendanceChange(item.id, status)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id}
      />
      
      <Button
        title="حفظ الحضور"
        onPress={submitAttendance}
        disabled={Object.keys(attendanceData).length === 0}
        style={styles.submitButton}
      />
    </View>
  );
};
```

### 4.4 شاشة التسميع (أسبوع 8)

```tsx
// src/screens/Recitation/RecitationSessionScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Button } from '../../components/common/Button';
import { GradingPanel } from './components/GradingPanel';
import { ErrorTracker } from './components/ErrorTracker';

export const RecitationSessionScreen: React.FC = ({ route }) => {
  const { student } = route.params;
  const [sessionData, setSessionData] = useState({
    grade: 0,
    errors: [],
    notes: '',
    surah: '',
    fromVerse: 1,
    toVerse: 10
  });

  const handleSubmitSession = async () => {
    try {
      await teacherService.recordRecitationSession({
        student_id: student.id,
        ...sessionData,
        date: new Date().toISOString()
      });
      
      Alert.alert('نجح', 'تم حفظ جلسة التسميع');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'فشل في حفظ الجلسة');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.surahInfo}>
          سورة {sessionData.surah} - الآيات {sessionData.fromVerse} إلى {sessionData.toVerse}
        </Text>
      </View>

      <GradingPanel
        grade={sessionData.grade}
        onGradeChange={(grade) => setSessionData(prev => ({ ...prev, grade }))}
      />

      <ErrorTracker
        errors={sessionData.errors}
        onErrorsChange={(errors) => setSessionData(prev => ({ ...prev, errors }))}
      />

      <Button
        title="حفظ الجلسة"
        onPress={handleSubmitSession}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};
```

---

## 📊 المرحلة 5: الرسوم البيانية والتقارير (أسبوع 9)

### 5.1 إعداد مكتبة الرسوم البيانية

```tsx
// src/components/charts/BarChart.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';
import { colors } from '../../theme/colors';

const screenWidth = Dimensions.get('window').width;

interface BarChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <View style={styles.container}>
      <RNBarChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(30, 111, 142, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </View>
  );
};
```

### 5.2 شاشة التقارير

```tsx
// src/screens/Reports/ReportsScreen.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart } from '../../components/charts/PieChart';
import { useTeacherReports } from '../../hooks/useTeacher';

export const ReportsScreen: React.FC = () => {
  const { data: reportsData } = useTeacherReports('teacher-id');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>توزيع الطلاب حسب المستوى</Text>
        <PieChart data={reportsData?.levelDistribution} />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>معدل الحضور الأسبوعي</Text>
        <BarChart data={reportsData?.weeklyAttendance} />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>متوسط درجات التسميع</Text>
        <BarChart data={reportsData?.recitationGrades} />
      </View>
    </ScrollView>
  );
};
```

---

## 🔐 المرحلة 6: المصادقة والأمان (أسبوع 10)

### 6.1 شاشة تسجيل الدخول

```tsx
// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { TextInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export const LoginScreen: React.FC = ({ navigation }) => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login(credentials.phone, credentials.password);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تسجيل الدخول');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>منصة غرب - المعلم</Text>
      
      <TextInput
        label="رقم الهاتف"
        value={credentials.phone}
        onChangeText={(phone) => setCredentials(prev => ({ ...prev, phone }))}
        keyboardType="phone-pad"
        placeholder="05xxxxxxxx"
      />

      <TextInput
        label="كلمة المرور"
        value={credentials.password}
        onChangeText={(password) => setCredentials(prev => ({ ...prev, password }))}
        secureTextEntry
        placeholder="••••••••"
      />

      <Button
        title="تسجيل الدخول"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.loginButton}
      />
    </View>
  );
};
```

### 6.2 إدارة التوكن والجلسات

```tsx
// src/services/auth/authManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export class AuthManager {
  
  async saveCredentials(token: string, refreshToken: string) {
    try {
      await AsyncStorage.setItem('auth_token', token);
      await Keychain.setInternetCredentials(
        'gharb_teacher_app',
        'user',
        refreshToken
      );
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      return null;
    }
  }

  async clearCredentials() {
    try {
      await AsyncStorage.removeItem('auth_token');
      await Keychain.resetInternetCredentials('gharb_teacher_app');
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }
}

export const authManager = new AuthManager();
```

---

## 🧪 المرحلة 7: الاختبار والتحسين (أسبوع 11)

### 7.1 اختبارات الوحدة

```tsx
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../src/components/common/Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

### 7.2 اختبارات التكامل

```tsx
// __tests__/screens/Dashboard.integration.test.tsx
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardScreen } from '../src/screens/Dashboard/DashboardScreen';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: any) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Dashboard Integration Tests', () => {
  it('loads dashboard data correctly', async () => {
    const Wrapper = createWrapper();
    const { getByText } = render(<DashboardScreen />, { wrapper: Wrapper });
    
    await waitFor(() => {
      expect(getByText('الحلقات')).toBeTruthy();
    });
  });
});
```

### 7.3 تحسين الأداء

```tsx
// src/utils/performance.ts
import { InteractionManager } from 'react-native';

export const runAfterInteractions = (callback: () => void) => {
  InteractionManager.runAfterInteractions(callback);
};

export const useDebouncedCallback = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};
```

---

## 📱 المرحلة 8: التطبيق والنشر (أسبوع 12)

### 8.1 إعداد البناء للإنتاج

```bash
# Android
cd android
./gradlew assembleRelease

# iOS
cd ios
xcodebuild -workspace GharbTeacherApp.xcworkspace -scheme GharbTeacherApp -configuration Release
```

### 8.2 إعداد التوقيع والشهادات

#### Android:
```bash
# إنشاء مفتاح التوقيع
keytool -genkey -v -keystore gharb-teacher-release-key.keystore -alias gharb-teacher -keyalg RSA -keysize 2048 -validity 10000

# إضافة المفتاح إلى gradle.properties
MYAPP_RELEASE_STORE_FILE=gharb-teacher-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=gharb-teacher
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

#### iOS:
- إعداد Apple Developer Account
- إنشاء App ID في Apple Developer Portal
- إعداد Distribution Certificate
- إعداد Provisioning Profile

### 8.3 نشر التطبيق

#### Google Play Store:
1. رفع APK إلى Google Play Console
2. إضافة وصف التطبيق باللغة العربية
3. إضافة لقطات الشاشة
4. إعداد معلومات الخصوصية
5. إرسال للمراجعة

#### Apple App Store:
1. رفع التطبيق عبر App Store Connect
2. إضافة البيانات التعريفية
3. إضافة لقطات الشاشة لجميع أحجام الشاشات
4. إرسال للمراجعة

---

## 📋 المتطلبات التقنية التفصيلية

### 1. متطلبات الأجهزة
```
Android:
- Android 8.0 (API level 26) أو أحدث
- RAM: 3GB كحد أدنى
- مساحة تخزين: 100MB

iOS:
- iOS 12.0 أو أحدث
- iPhone 7 أو أحدث
- iPad (الجيل السادس) أو أحدث
```

### 2. متطلبات الخادم
```
- نفس API المستخدم في النسخة الحالية
- دعم HTTPS
- معدل الاستجابة < 2 ثانية
- تشفير البيانات الحساسة
```

### 3. متطلبات الشبكة
```
- اتصال إنترنت مستقر
- دعم العمل Offline للميزات الأساسية
- مزامنة البيانات عند عودة الاتصال
```

---

## 🎯 الميزات المطلوبة حسب الأولوية

### أولوية عالية (Critical)
- [x] تسجيل الدخول/الخروج
- [x] عرض لوحة التحكم الأساسية
- [x] قائمة الطلاب
- [x] تسجيل الحضور
- [x] جلسات التسميع الأساسية

### أولوية متوسطة (Important)
- [ ] الإحصائيات البسيطة
- [ ] البحث والفلترة
- [ ] إشعارات الدفع
- [ ] التحديث التلقائي للبيانات
- [ ] إعدادات المستخدم

### أولوية منخفضة (Nice to have)
- [ ] الرسوم البيانية المتقدمة
- [ ] تصدير التقارير
- [ ] الوضع الليلي
- [ ] دعم عدة لغات
- [ ] التكامل مع التقويم

---

## ⏰ الجدول الزمني المفصل

### الأسبوع 1: إعداد البيئة
- **الأيام 1-2**: تثبيت React Native وإعداد المشروع
- **الأيام 3-4**: إعداد Navigation والبنية الأساسية
- **الأيام 5-7**: إعداد Theme وأول مكون UI

### الأسبوع 2-3: نظام التصميم
- **الأسبوع 2**: تطوير المكونات الأساسية (Button, Card, Input)
- **الأسبوع 3**: تصميم layouts الشاشات الرئيسية

### الأسبوع 4: API والخدمات
- **الأيام 1-3**: إعداد HTTP client وخدمات API
- **الأيام 4-5**: إعداد React Query وState Management
- **الأيام 6-7**: اختبار اتصال API

### الأسبوع 5-8: الشاشات الأساسية
- **الأسبوع 5**: Dashboard وإحصائيات
- **الأسبوع 6**: شاشة الطلاب والبحث
- **الأسبوع 7**: شاشة الحضور
- **الأسبوع 8**: شاشة التسميع

### الأسبوع 9: التقارير والرسوم البيانية
- **الأيام 1-4**: إعداد مكتبة Charts
- **الأيام 5-7**: تطوير شاشة التقارير

### الأسبوع 10: الأمان والمصادقة
- **الأيام 1-3**: شاشة تسجيل الدخول
- **الأيام 4-5**: إدارة التوكن والجلسات
- **الأيام 6-7**: حماية الطرق والشاشات

### الأسبوع 11: الاختبار والتحسين
- **الأيام 1-4**: كتابة الاختبارات
- **الأيام 5-7**: تحسين الأداء وإصلاح الأخطاء

### الأسبوع 12: النشر
- **الأيام 1-3**: إعداد البناء للإنتاج
- **الأيام 4-5**: اختبار نسخة الإنتاج
- **الأيام 6-7**: رفع التطبيق للمتاجر

---

## 💰 تقدير التكلفة

### تكلفة التطوير
```
- مطور React Native senior: 12 أسبوع × 40 ساعة × $50 = $24,000
- مصمم UI/UX: 3 أسابيع × 30 ساعة × $40 = $3,600
- مطور Backend (تعديلات API): 2 أسبوع × 20 ساعة × $45 = $1,800
- QA Tester: 2 أسبوع × 30 ساعة × $25 = $1,500

إجمالي تكلفة التطوير: $30,900
```

### تكاليف إضافية
```
- Apple Developer Program: $99/سنة
- Google Play Console: $25 (مرة واحدة)
- SSL Certificate: $50/سنة
- App Store Optimization: $500
- اختبار على أجهزة حقيقية: $1,000

إجمالي التكاليف الإضافية: $1,674
```

### إجمالي التكلفة المقدرة: $32,574

---

## 🚨 المخاطر المحتملة والحلول

### 1. مخاطر تقنية
**المخاطر:**
- مشاكل في أداء التطبيق على الأجهزة القديمة
- صعوبات في تحويل الرسوم البيانية المعقدة
- مشاكل في التوافق مع API الحالي

**الحلول:**
- اختبار مكثف على أجهزة مختلفة
- استخدام رسوم بيانية مبسطة في البداية
- إعداد API wrapper للتوافق

### 2. مخاطر زمنية
**المخاطر:**
- تأخير في إعداد البيئة التقنية
- تعقيدات غير متوقعة في UI/UX
- مراجعة طويلة من متاجر التطبيقات

**الحلول:**
- بدء مبكر بإعداد البيئة
- استخدام مكتبات UI جاهزة
- إرسال مبكر للمراجعة مع التحديثات

### 3. مخاطر الميزانية
**المخاطر:**
- تكاليف إضافية غير متوقعة
- حاجة لخبراء إضافيين
- تكاليف اختبار أعلى من المتوقع

**الحلول:**
- إضافة 20% هامش أمان للميزانية
- التعاقد مع فريق شامل من البداية
- استخدام أدوات اختبار مجانية

---

## 📈 مؤشرات النجاح

### مؤشرات تقنية
- [ ] وقت تحميل الشاشات < 2 ثانية
- [ ] معدل تعطل التطبيق < 1%
- [ ] نسبة نجاح API calls > 99%
- [ ] دعم جميع أحجام الشاشات

### مؤشرات المستخدم
- [ ] معدل رضا المعلمين > 85%
- [ ] معدل استخدام يومي > 70%
- [ ] تقييم في المتاجر > 4.0/5
- [ ] معدل الاحتفاظ بالمستخدمين > 80%

### مؤشرات العمل
- [ ] تقليل وقت تسجيل الحضور بنسبة 50%
- [ ] زيادة دقة البيانات بنسبة 30%
- [ ] تحسين تجربة المعلم بشكل عام

---

## 🔄 خطة الصيانة والتحديث

### صيانة دورية (شهرياً)
- [ ] فحص أمني للتطبيق
- [ ] تحديث المكتبات للإصدارات الآمنة
- [ ] مراقبة الأداء والاستخدام
- [ ] إصلاح الأخطاء المكتشفة

### تحديثات ربع سنوية
- [ ] إضافة ميزات جديدة حسب احتياجات المعلمين
- [ ] تحسينات في الواجهة
- [ ] تحديث التوافق مع إصدارات نظام التشغيل الجديدة

### تحديثات سنوية
- [ ] مراجعة شاملة للأمان
- [ ] تحديث التصميم حسب الاتجاهات الجديدة
- [ ] إضافة ميزات متقدمة

---

## 📞 التواصل والدعم

### فريق التطوير
- مدير المشروع: مسؤول عن التنسيق والمتابعة
- مطور React Native: تطوير التطبيق
- مصمم UI/UX: تصميم الواجهات
- مطور Backend: تعديل APIs
- مختبر QA: ضمان الجودة

### خطة التواصل
- اجتماعات أسبوعية لمتابعة التقدم
- تقارير يومية للمشاكل والحلول
- demo أسبوعي لعرض التقدم
- مراجعة نهاية كل مرحلة

---

## ✅ الخطوات التالية

### للبدء الفوري:
1. **موافقة على الخطة** - مراجعة وتعديل أي جوانب
2. **تجهيز البيئة** - إعداد أجهزة التطوير والحسابات
3. **تشكيل الفريق** - تعيين أو توظيف المطورين
4. **إعداد المشروع** - إنشاء repositories وأدوات التعاون

### للأسبوع الأول:
1. إعداد React Native environment
2. إنشاء مشروع جديد بالبنية المطلوبة
3. إعداد Git repository وContinuous Integration
4. بدء تطوير المكونات الأساسية

---

## 📝 ملاحظات إضافية

### نصائح للنجاح:
- **ابدأ بسيط**: ركز على الميزات الأساسية أولاً
- **اختبر بكثرة**: استخدم أجهزة حقيقية متنوعة
- **استمع للمعلمين**: اجمع آراءهم باستمرار
- **وثق كل شيء**: للصيانة المستقبلية

### تحديات متوقعة:
- تحويل التصاميم المعقدة للأجهزة المحمولة
- ضمان أداء سريع مع كمية البيانات الكبيرة  
- التوافق مع مختلف إصدارات نظم التشغيل
- إدارة حالة التطبيق Offline/Online

---

*هذه الخطة قابلة للتعديل والتطوير حسب الاحتياجات والظروف المستجدة*

**تاريخ إعداد الخطة:** يونيو 2025  
**الإصدار:** 1.0  
**مُعد الخطة:** GitHub Copilot AI Assistant
