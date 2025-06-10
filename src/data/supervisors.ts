// بيانات المشرفين وصلاحياتهم
export interface Supervisor {
  id: string;
  name: string;
  email: string;
  phone: string;
  supervisedMosques: string[]; // معرفات المساجد التي يشرف عليها
  permissions: SupervisorPermission[];
  joinDate: string;
  isActive: boolean;
}

export interface SupervisorPermission {
  type: 'view_students' | 'manage_students' | 'move_students' | 'teacher_attendance' | 'generate_reports' | 'ai_recommendations' | 'curriculum_management';
  description: string;
}

export interface TeacherAttendance {
  id: string;
  teacherId: string;
  teacherName: string;
  mosqueId: string;
  date: string;
  status: 'حاضر' | 'غائب' | 'متأخر' | 'إجازة';
  notes?: string;
  sessionCount: number; // عدد الحلقات المسؤول عنها
}

export interface StudentTransferRequest {
  id: string;
  studentId: string;
  studentName: string;
  fromMosqueId: string;
  toMosqueId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestDate: string;
  approvedBy?: string;
  approvalDate?: string;
}

export interface SupervisorReport {
  id: string;
  title: string;
  type: 'student_progress' | 'teacher_performance' | 'mosque_overview' | 'ai_insights';
  mosqueId: string;
  generatedBy: string;
  generatedDate: string;
  content: {
    summary: string;
    statistics: Record<string, number>;
    recommendations: string[];
    charts?: any[];
  };
}

// بيانات المشرفين
export const supervisors: Supervisor[] = [
  {
    id: 'sup1',
    name: 'أحمد محمد الغامدي',
    email: 'ahmed.ghamdi@gharb.sa',
    phone: '0551234567',
    supervisedMosques: ['1', '2'], // يشرف على مسجد النور والهدى
    permissions: [
      { type: 'view_students', description: 'عرض الطلاب والحلقات' },
      { type: 'manage_students', description: 'إدارة بيانات الطلاب' },
      { type: 'move_students', description: 'نقل الطلاب بين الحلقات' },
      { type: 'teacher_attendance', description: 'تحضير المعلمين' },
      { type: 'generate_reports', description: 'إنشاء التقارير' },
      { type: 'ai_recommendations', description: 'التوصيات الذكية' },
      { type: 'curriculum_management', description: 'إدارة المناهج' }
    ],
    joinDate: '2024-01-15',
    isActive: true
  },
  {
    id: 'sup2',
    name: 'فاطمة سالم العتيبي',
    email: 'fatima.otaibi@gharb.sa',
    phone: '0559876543',
    supervisedMosques: ['3'], // تشرف على مسجد الرحمة
    permissions: [
      { type: 'view_students', description: 'عرض الطلاب والحلقات' },
      { type: 'manage_students', description: 'إدارة بيانات الطلاب' },
      { type: 'teacher_attendance', description: 'تحضير المعلمين' },
      { type: 'generate_reports', description: 'إنشاء التقارير' },
      { type: 'ai_recommendations', description: 'التوصيات الذكية' }
    ],
    joinDate: '2024-02-01',
    isActive: true
  }
];

// بيانات حضور المعلمين
export const teacherAttendanceData: TeacherAttendance[] = [
  {
    id: 'ta1',
    teacherId: 't1',
    teacherName: 'محمد الأحمد',
    mosqueId: '1',
    date: '2025-06-07',
    status: 'حاضر',
    sessionCount: 3,
    notes: 'وصل في الموعد المحدد'
  },
  {
    id: 'ta2',
    teacherId: 't2',
    teacherName: 'عبدالله الخالد',
    mosqueId: '1',
    date: '2025-06-07',
    status: 'متأخر',
    sessionCount: 2,
    notes: 'تأخر 15 دقيقة'
  },
  {
    id: 'ta3',
    teacherId: 't3',
    teacherName: 'عائشة السعيد',
    mosqueId: '2',
    date: '2025-06-07',
    status: 'حاضر',
    sessionCount: 4
  },
  {
    id: 'ta4',
    teacherId: 't4',
    teacherName: 'نورا الحميد',
    mosqueId: '3',
    date: '2025-06-07',
    status: 'إجازة',
    sessionCount: 3,
    notes: 'إجازة طارئة'
  }
];

// طلبات نقل الطلاب
export const studentTransferRequests: StudentTransferRequest[] = [
  {
    id: 'str1',
    studentId: '1',
    studentName: 'عبدالرحمن أحمد المالكي',
    fromMosqueId: '1',
    toMosqueId: '2',
    reason: 'تغيير مكان السكن',
    status: 'pending',
    requestedBy: 'sup1',
    requestDate: '2025-06-05'
  },
  {
    id: 'str2',
    studentId: '3',
    studentName: 'يوسف سعد القحطاني',
    fromMosqueId: '2',
    toMosqueId: '1',
    reason: 'طلب ولي الأمر',
    status: 'approved',
    requestedBy: 'sup1',
    requestDate: '2025-06-03',
    approvedBy: 'sup1',
    approvalDate: '2025-06-04'
  }
];

// توصيات الذكاء الاصطناعي للمشرف
export const supervisorAIRecommendations = [
  {
    id: 'ai_sup_1',
    type: 'curriculum_change',
    priority: 'high',
    title: 'تعديل منهج الطالب عبدالرحمن المالكي',
    description: 'يُنصح بتقليل عدد الآيات في كل جلسة من 10 إلى 7 آيات لتحسين معدل الحفظ',
    studentId: '1',
    mosqueId: '1',
    suggestedAction: 'تعديل الخطة الدراسية',
    confidence: 85,
    reasons: [
      'انخفاض في معدل الحفظ خلال الأسبوعين الماضيين',
      'زيادة في عدد الأخطاء مقارنة بالمتوسط',
      'تحليل نمط التعلم يشير لحاجة المزيد من الوقت للمراجعة'
    ]
  },
  {
    id: 'ai_sup_2',
    type: 'teacher_support',
    priority: 'medium',
    title: 'دعم إضافي للمعلم عبدالله الخالد',
    description: 'المعلم يحتاج دورة تدريبية في طرق التدريس الحديثة',
    teacherId: 't2',
    mosqueId: '1',
    suggestedAction: 'إلحاق المعلم بدورة تدريبية',
    confidence: 78,
    reasons: [
      'انخفاض في متوسط درجات طلابه',
      'زيادة في معدل غياب الطلاب في حلقته',
      'تحليل أساليب التدريس يشير لحاجة التطوير'
    ]
  },
  {
    id: 'ai_sup_3',
    type: 'student_grouping',
    priority: 'medium',
    title: 'إعادة تجميع الطلاب في مسجد النور',
    description: 'فصل الطلاب المتقدمين عن المبتدئين لتحسين النتائج',
    mosqueId: '1',
    suggestedAction: 'إعادة تنظيم الحلقات',
    confidence: 82,
    reasons: [
      'فجوة كبيرة في مستوى الطلاب داخل نفس الحلقة',
      'الطلاب المتقدمون يحتاجون تحدي أكبر',
      'المبتدئون يحتاجون اهتمام أكثر'
    ]
  },
  {
    id: 'ai_sup_4',
    type: 'schedule_optimization',
    priority: 'low',
    title: 'تحسين جدولة الحلقات',
    description: 'تقترح إضافة حلقة مسائية لاستيعاب المزيد من الطلاب',
    mosqueId: '2',
    suggestedAction: 'إضافة حلقة جديدة',
    confidence: 75,
    reasons: [
      'قائمة انتظار طويلة للطلاب الجدد',
      'معدل حضور عالي في الحلقات الحالية',
      'توفر معلمين إضافيين'
    ]
  }
];
