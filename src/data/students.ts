// بيانات الطلاب
export interface StudentAttendance {
  date: string;
  status: 'حاضر' | 'غائب' | 'متأخر' | 'مستأذن';
  time?: string;
  notes?: string;
}

export interface MemorizationError {
  type: 'حفظ' | 'تجويد' | 'نطق';
  wordIndex: number;
  word: string;
  ayahIndex: number;
  surahId: number; // إضافة معرف السورة
}

export interface MemorizationSession {
  id: string;
  date: string;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  type: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى';
  score: number;
  totalErrors: number;
  errors: MemorizationError[];
}

export interface Student {
  id: string;
  name: string;
  age: number;
  mosqueId: string;
  circleId?: string; // معرف الحلقة التي ينتمي إليها الطالب
  level: string;
  attendanceRate: number;
  attendance: StudentAttendance[];
  memorization: MemorizationSession[];
  currentMemorization: {
    surahName: string;
    fromAyah: number;
    toAyah: number;
    // دعم السور المتعددة
    isMultipleSurahs?: boolean;
    startSurah?: string;
    endSurah?: string;
    startSurahNumber?: number;
    endSurahNumber?: number;
  };
  totalScore: number;
  phone?: string;
  parentPhone?: string;
  completedPages?: number; // عدد الصفحات المكتملة
  lastSession?: string; // تاريخ آخر جلسة
}

export const students: Student[] = [  {
    id: '1',
    name: 'أحمد محمد العمري',
    age: 12,
    mosqueId: '1',
    circleId: '1', // حلقة الفجر - المعلم أحمد محمد العمري
    level: 'متوسط',
    attendanceRate: 95,
    attendance: [
      { date: '2025-05-25', status: 'حاضر' },
      { date: '2025-05-24', status: 'حاضر' },
      { date: '2025-05-23', status: 'حاضر' },
      { date: '2025-05-22', status: 'غائب' },
      { date: '2025-05-21', status: 'حاضر' },
    ],
    memorization: [
      {
        id: 'm1',
        date: '2025-05-25',
        surahName: 'البقرة',
        fromAyah: 1,
        toAyah: 5,
        type: 'حفظ',
        score: 90,
        totalErrors: 2,
        errors: [
          { type: 'حفظ', wordIndex: 3, word: 'الرحيم', ayahIndex: 1, surahId: 2 },
          { type: 'تجويد', wordIndex: 2, word: 'العالمين', ayahIndex: 2, surahId: 2 }
        ]
      }
    ],
    currentMemorization: {
      surahName: 'البقرة',
      fromAyah: 6,
      toAyah: 10
    },
    totalScore: 85,
    phone: '05XXXXXXXX',
    parentPhone: '05XXXXXXXX'
  },  {
    id: '2',
    name: 'خالد سعد القحطاني',
    age: 14,
    mosqueId: '1',
    circleId: '3', // حلقة العصر المتقدمة - المعلم محمد عبدالله الشهري
    level: 'متقدم',
    attendanceRate: 87,
    attendance: [
      { date: '2025-05-25', status: 'حاضر' },
      { date: '2025-05-24', status: 'غائب' },
      { date: '2025-05-23', status: 'حاضر' },
      { date: '2025-05-22', status: 'حاضر' },
      { date: '2025-05-21', status: 'حاضر' },
    ],
    memorization: [
      {
        id: 'm2',
        date: '2025-05-23',
        surahName: 'آل عمران',
        fromAyah: 10,
        toAyah: 15,
        type: 'مراجعة صغرى',
        score: 95,
        totalErrors: 1,
        errors: [
          { type: 'تجويد', wordIndex: 5, word: 'النار', ayahIndex: 12, surahId: 3 }
        ]
      }
    ],
    currentMemorization: {
      surahName: 'آل عمران',
      fromAyah: 16,
      toAyah: 20
    },
    totalScore: 92,
    phone: '05XXXXXXXX',
    parentPhone: '05XXXXXXXX'
  },  {
    id: '3',
    name: 'عبدالرحمن ناصر السلمي',
    age: 10,
    mosqueId: '1',
    circleId: '2', // حلقة المغرب - المعلم أحمد محمد العمري (معرف 1)
    level: 'مبتدئ',
    attendanceRate: 90,
    attendance: [
      { date: '2025-05-25', status: 'حاضر' },
      { date: '2025-05-24', status: 'حاضر' },
      { date: '2025-05-23', status: 'حاضر' },
      { date: '2025-05-22', status: 'حاضر' },
      { date: '2025-05-21', status: 'غائب' },
    ],
    memorization: [
      {
        id: 'm3',
        date: '2025-05-25',
        surahName: 'الفاتحة',
        fromAyah: 1,
        toAyah: 7,
        type: 'حفظ',
        score: 85,
        totalErrors: 3,
        errors: [
          { type: 'حفظ', wordIndex: 2, word: 'الرحمن', ayahIndex: 1, surahId: 1 },
          { type: 'نطق', wordIndex: 1, word: 'المستقيم', ayahIndex: 6, surahId: 1 },
          { type: 'تجويد', wordIndex: 3, word: 'عليهم', ayahIndex: 7, surahId: 1 }
        ]
      }
    ],
    currentMemorization: {
      surahName: 'البقرة',
      fromAyah: 1,
      toAyah: 5
    },
    totalScore: 78,
    phone: '05XXXXXXXX',
    parentPhone: '05XXXXXXXX'
  },
  {
    id: '4',
    name: 'محمد عبدالله الشهري',
    age: 13,
    mosqueId: '2',
    level: 'متوسط',
    attendanceRate: 92,
    attendance: [
      { date: '2025-05-25', status: 'حاضر' },
      { date: '2025-05-24', status: 'حاضر' },
      { date: '2025-05-23', status: 'غائب' },
      { date: '2025-05-22', status: 'حاضر' },
      { date: '2025-05-21', status: 'حاضر' },
    ],
    memorization: [
      {
        id: 'm4',
        date: '2025-05-22',
        surahName: 'يس',
        fromAyah: 1,
        toAyah: 10,
        type: 'حفظ',
        score: 88,
        totalErrors: 4,
        errors: [
          { type: 'حفظ', wordIndex: 1, word: 'الحكيم', ayahIndex: 2, surahId: 36 },
          { type: 'تجويد', wordIndex: 2, word: 'المرسلين', ayahIndex: 3, surahId: 36 },
          { type: 'نطق', wordIndex: 1, word: 'مستقيم', ayahIndex: 4, surahId: 36 },
          { type: 'حفظ', wordIndex: 3, word: 'الرحيم', ayahIndex: 5, surahId: 36 }
        ]
      }
    ],
    currentMemorization: {
      surahName: 'يس',
      fromAyah: 11,
      toAyah: 20
    },
    totalScore: 82,
    phone: '05XXXXXXXX',
    parentPhone: '05XXXXXXXX'
  },
  {
    id: '5',
    name: 'سعود فهد العتيبي',
    age: 11,
    mosqueId: '2',
    level: 'مبتدئ',
    attendanceRate: 80,
    attendance: [
      { date: '2025-05-25', status: 'غائب' },
      { date: '2025-05-24', status: 'حاضر' },
      { date: '2025-05-23', status: 'حاضر' },
      { date: '2025-05-22', status: 'غائب' },
      { date: '2025-05-21', status: 'حاضر' },
    ],
    memorization: [
      {
        id: 'm5',
        date: '2025-05-24',
        surahName: 'الناس',
        fromAyah: 1,
        toAyah: 6,
        type: 'حفظ',
        score: 95,
        totalErrors: 1,
        errors: [
          { type: 'تجويد', wordIndex: 1, word: 'الوسواس', ayahIndex: 4, surahId: 114 }
        ]
      }
    ],
    currentMemorization: {
      surahName: 'الفلق',
      fromAyah: 1,
      toAyah: 5
    },
    totalScore: 76,
    phone: '05XXXXXXXX',
    parentPhone: '05XXXXXXXX'
  },
  {
    id: '6',
    name: 'فاطمة أحمد المطيري',
    age: 11,
    mosqueId: '1',
    circleId: '2', // حلقة المغرب - المعلم أحمد محمد العمري
    level: 'متوسط',
    attendanceRate: 96,
    attendance: [
      { date: '2025-05-25', status: 'حاضر' },
      { date: '2025-05-24', status: 'حاضر' },
      { date: '2025-05-23', status: 'حاضر' },
      { date: '2025-05-22', status: 'حاضر' },
      { date: '2025-05-21', status: 'حاضر' },
    ],
    memorization: [
      {
        id: 'm6',
        date: '2025-05-25',
        surahName: 'الفاتحة إلى الإخلاص',
        fromAyah: 1,
        toAyah: 4,
        type: 'حفظ',
        score: 93,
        totalErrors: 1,
        errors: [
          { type: 'تجويد', wordIndex: 2, word: 'أحد', ayahIndex: 1, surahId: 112 }
        ]
      }
    ],
    currentMemorization: {
      surahName: 'الفاتحة 1 إلى الإخلاص 4',
      fromAyah: 1,
      toAyah: 4,
      // دعم السور المتعددة
      isMultipleSurahs: true,
      startSurah: 'الفاتحة',
      endSurah: 'الإخلاص',
      startSurahNumber: 1,
      endSurahNumber: 112
    },
    totalScore: 89,
    phone: '05XXXXXXXX',
    parentPhone: '05XXXXXXXX'
  }
];
