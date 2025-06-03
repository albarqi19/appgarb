// توصيات الذكاء الاصطناعي
export interface AIRecommendation {
  id: string;
  type: 'general' | 'student' | 'memorization';
  title: string;
  description: string;
  confidence: number; // من 0 إلى 100
  relevance: number; // من 0 إلى 100
  tags: string[]; // كلمات مفتاحية للتوصية
}

export interface AIStudentAnalysis {
  studentId: string;
  strengths: string[];
  weaknesses: string[];
  recommendedFocus: string[];
  progress: {
    lastMonth: number; // -100 إلى 100 (تراجع/تقدم مقارنة بالمتوسط)
    trend: 'up' | 'stable' | 'down';
  };
  predictions: {
    expectedProgressRate: number; // معدل التقدم المتوقع (0-100)
    areas: {
      name: string;
      score: number; // 0-100
    }[];
  };
}

// بيانات توصيات الذكاء الاصطناعي المعدة مسبقاً
export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'rec1',
    type: 'general',
    title: 'تطوير مهارات التجويد',
    description: 'أظهرت بيانات الحلقة تراجعًا في مستوى التجويد بشكل عام. يوصى بتخصيص جلسة أسبوعية مخصصة لمراجعة وتطبيق قواعد التجويد الأساسية.',
    confidence: 95,
    relevance: 92,
    tags: ['تجويد', 'تطوير عام', 'مهارات أساسية']
  },
  {
    id: 'rec2',
    type: 'general',
    title: 'تنظيم مسابقة للحفظ',
    description: 'يقترح النظام تنظيم مسابقة شهرية للحفظ لتحفيز الطلاب وزيادة الحماس. أظهرت البيانات تحسنًا بنسبة 40٪ في الأداء عند تطبيق أساليب تحفيزية مماثلة.',
    confidence: 87,
    relevance: 85,
    tags: ['تحفيز', 'مسابقات', 'أنشطة']
  },
  {
    id: 'rec3',
    type: 'student',
    title: 'تركيز إضافي على التجويد لأحمد العمري',
    description: 'يواجه الطالب أحمد صعوبات متكررة في قواعد التجويد خاصة في أحكام الميم الساكنة والإدغام. يوصى بتخصيص 15 دقيقة إضافية معه.',
    confidence: 92,
    relevance: 89,
    tags: ['طالب محدد', 'تجويد', 'خطة فردية']
  },
  {
    id: 'rec4',
    type: 'student',
    title: 'مراجعة مكثفة لسعود العتيبي',
    description: 'يحتاج سعود العتيبي إلى مراجعة مكثفة للمحتوى السابق قبل الانتقال للحفظ الجديد. نسبة النسيان لديه مرتفعة (27٪) مقارنة بالمتوسط (12٪).',
    confidence: 88,
    relevance: 90,
    tags: ['مراجعة', 'طالب محدد', 'تثبيت الحفظ']
  },
  {
    id: 'rec5',
    type: 'memorization',
    title: 'تقنية التكرار المتباعد',
    description: 'استنادًا إلى أبحاث علم النفس المعرفي، توصي التحليلات بتطبيق تقنية التكرار المتباعد مع الطلاب المتقدمين: مراجعة بعد ساعة، ثم بعد يوم، ثم بعد أسبوع.',
    confidence: 94,
    relevance: 88,
    tags: ['تقنية حفظ', 'تثبيت', 'منهجية']
  },
  {
    id: 'rec6',
    type: 'memorization',
    title: 'الحفظ بطريقة تقسيم الآيات',
    description: 'يُوصى بتطبيق تقنية تقسيم الآيات الطويلة إلى مقاطع قصيرة مترابطة المعنى للطلاب المبتدئين، مما يسهّل عملية الحفظ ويزيد من تثبيت المعلومات.',
    confidence: 85,
    relevance: 82,
    tags: ['تسهيل الحفظ', 'مبتدئين', 'تقطيع']
  },
  {
    id: 'rec7',
    type: 'general',
    title: 'تطوير برنامج المراجعة الأسبوعية',    description: 'اقتراح تحسين جدول المراجعة الأسبوعي بحيث يتم تخصيص وقت أطول للمراجعة العامة يوم الخميس، مع التركيز على المقاطع التي سجلت أعلى نسبة أخطاء.',
    confidence: 89,
    relevance: 87,
    tags: ['تخطيط', 'جدولة', 'مراجعة']
  }
];

// تحليلات الذكاء الاصطناعي للطلاب
export const studentAnalytics: { [studentId: string]: AIStudentAnalysis } = {
  '1': {
    studentId: '1',
    strengths: ['الحفظ السريع', 'التركيز العالي', 'الالتزام بالحضور'],
    weaknesses: ['التجويد', 'تراكم المحفوظات السابقة'],
    recommendedFocus: ['مراجعة قواعد التجويد', 'المراجعة المتكررة للمحفوظات القديمة'],
    progress: {
      lastMonth: 35, // تقدم جيد مقارنة بالمتوسط
      trend: 'up'
    },
    predictions: {
      expectedProgressRate: 88,
      areas: [
        { name: 'الحفظ', score: 92 },
        { name: 'التجويد', score: 70 },
        { name: 'الالتزام', score: 95 }
      ]
    }
  },
  '2': {
    studentId: '2',
    strengths: ['إتقان التجويد', 'الدقة في المراجعة', 'الثبات في الأداء'],
    weaknesses: ['بطء الحفظ الجديد', 'الغياب المتكرر أحياناً'],
    recommendedFocus: ['تسريع وتيرة الحفظ', 'التركيز على الانتظام في الحضور'],
    progress: {
      lastMonth: 10, // تقدم طفيف مقارنة بالمتوسط
      trend: 'stable'
    },
    predictions: {
      expectedProgressRate: 75,
      areas: [
        { name: 'الحفظ', score: 65 },
        { name: 'التجويد', score: 96 },
        { name: 'الالتزام', score: 82 }
      ]
    }
  },
  '3': {
    studentId: '3',
    strengths: ['الحماس والدافعية', 'التفاعل مع المعلم', 'سرعة التعلم'],
    weaknesses: ['النطق', 'نقص الخبرة'],
    recommendedFocus: ['التدريب على النطق', 'تعلم أساسيات التجويد'],
    progress: {
      lastMonth: 42, // تقدم ممتاز مقارنة بالمتوسط
      trend: 'up'
    },
    predictions: {
      expectedProgressRate: 85,
      areas: [
        { name: 'الحفظ', score: 83 },
        { name: 'التجويد', score: 65 },
        { name: 'الالتزام', score: 90 }
      ]
    }
  },
  '4': {
    studentId: '4',
    strengths: ['الذاكرة القوية', 'الاستيعاب السريع'],
    weaknesses: ['التركيز لفترات طويلة', 'التثبيت'],
    recommendedFocus: ['تمارين تركيز', 'جلسات تثبيت مكثفة'],
    progress: {
      lastMonth: -5, // تراجع طفيف مقارنة بالمتوسط
      trend: 'down'
    },
    predictions: {
      expectedProgressRate: 68,
      areas: [
        { name: 'الحفظ', score: 80 },
        { name: 'التجويد', score: 75 },
        { name: 'الالتزام', score: 60 }
      ]
    }
  },
  '5': {
    studentId: '5',
    strengths: ['الالتزام بالمنهج', 'الإصغاء الجيد'],
    weaknesses: ['الغياب المتكرر', 'صعوبة حفظ المقاطع الطويلة'],
    recommendedFocus: ['تقسيم المقاطع الطويلة', 'تحسين الالتزام بالحضور'],
    progress: {
      lastMonth: -12, // تراجع ملحوظ مقارنة بالمتوسط
      trend: 'down'
    },
    predictions: {
      expectedProgressRate: 60,
      areas: [
        { name: 'الحفظ', score: 65 },
        { name: 'التجويد', score: 72 },
        { name: 'الالتزام', score: 50 }
      ]
    }
  }
};
