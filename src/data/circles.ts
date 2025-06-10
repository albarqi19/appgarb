// بيانات الحلقات (دوائر التحفيظ)
export interface Circle {
  id: string;
  name: string;
  mosqueId: string;
  mosqueName?: string;
  teacherId?: string;
  teacherName?: string;
  studentsCount: number;
  level: 'مبتدئ' | 'متوسط' | 'متقدم' | 'مختلط' | string;
  maxCapacity?: number;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  } | any;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

export const circles: Circle[] = [
  {
    id: '1',
    name: 'حلقة الفجر',
    mosqueId: '1',
    teacherId: '1',
    teacherName: 'أحمد محمد العمري',
    studentsCount: 15,
    level: 'متوسط',
    maxCapacity: 20,
    schedule: {
      days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'],
      startTime: '05:30',
      endTime: '06:30'
    },
    description: 'حلقة تحفيظ للطلاب المتوسطين بعد صلاة الفجر',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'حلقة المغرب',
    mosqueId: '1',
    teacherId: '1',
    teacherName: 'أحمد محمد العمري',
    studentsCount: 12,
    level: 'مبتدئ',
    maxCapacity: 15,
    schedule: {
      days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'],
      startTime: '18:00',
      endTime: '19:00'
    },
    description: 'حلقة تحفيظ للطلاب المبتدئين بعد صلاة المغرب',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'حلقة العصر المتقدمة',
    mosqueId: '1',
    teacherId: '2',
    teacherName: 'محمد عبدالله الشهري',
    studentsCount: 8,
    level: 'متقدم',
    maxCapacity: 12,
    schedule: {
      days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'],
      startTime: '15:30',
      endTime: '16:30'
    },
    description: 'حلقة تحفيظ للطلاب المتقدمين والحفاظ',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'حلقة الضحى',
    mosqueId: '2',
    teacherId: '3',
    teacherName: 'عبدالرحمن سالم الحربي',
    studentsCount: 18,
    level: 'مختلط',
    maxCapacity: 25,
    schedule: {
      days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'],
      startTime: '09:00',
      endTime: '10:30'
    },
    description: 'حلقة مختلطة لجميع المستويات وقت الضحى',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'حلقة النساء',
    mosqueId: '2',
    teacherId: '4',
    teacherName: 'فاطمة أحمد الزهراني',
    studentsCount: 10,
    level: 'متوسط',
    maxCapacity: 15,
    schedule: {
      days: ['السبت', 'الأحد', 'الثلاثاء', 'الأربعاء'],
      startTime: '10:00',
      endTime: '11:30'
    },
    description: 'حلقة تحفيظ للنساء والفتيات',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'حلقة الأطفال',
    mosqueId: '3',
    teacherId: '5',
    teacherName: 'عمر يوسف العتيبي',
    studentsCount: 20,
    level: 'مبتدئ',
    maxCapacity: 25,
    schedule: {
      days: ['الجمعة', 'السبت'],
      startTime: '16:00',
      endTime: '17:30'
    },    description: 'حلقة مخصصة للأطفال من سن 6-12 سنة',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  // حلقات للمعلم أحمد10 (معرفات مختلفة محتملة)
  {
    id: '7',
    name: 'حلقة أحمد - الصباح',
    mosqueId: '1',
    teacherId: '2', // معرف المعلم أحمد10
    teacherName: 'أحمد10',
    studentsCount: 8,
    level: 'متوسط',
    maxCapacity: 12,
    schedule: {
      days: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء'],
      startTime: '09:00',
      endTime: '10:30'
    },
    description: 'حلقة تحفيظ صباحية للمستوى المتوسط',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'حلقة أحمد - المساء',
    mosqueId: '1',
    teacherId: '2',
    teacherName: 'أحمد10',
    studentsCount: 6,
    level: 'مبتدئ',
    maxCapacity: 10,
    schedule: {
      days: ['الأربعاء', 'الخميس'],
      startTime: '17:00',
      endTime: '18:00'
    },
    description: 'حلقة تحفيظ مسائية للمبتدئين',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  // حلقات بمعرفات أخرى محتملة
  {
    id: '9',
    name: 'حلقة التميز',
    mosqueId: '2',
    teacherId: '3',
    teacherName: 'أحمد محمد',
    studentsCount: 10,
    level: 'متقدم',
    maxCapacity: 12,
    schedule: {
      days: ['السبت', 'الثلاثاء', 'الخميس'],
      startTime: '14:00',
      endTime: '15:30'
    },
    description: 'حلقة للطلاب المتقدمين',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '10',
    name: 'حلقة النهضة',
    mosqueId: '1',
    teacherId: '10', // معرف آخر محتمل
    teacherName: 'معلم تجريبي',
    studentsCount: 7,
    level: 'مختلط',
    maxCapacity: 15,
    schedule: {
      days: ['الجمعة', 'السبت', 'الأحد'],
      startTime: '10:00',
      endTime: '11:30'
    },
    description: 'حلقة مختلطة لجميع المستويات',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z'
  }
];
