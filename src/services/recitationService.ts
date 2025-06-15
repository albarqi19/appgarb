// خدمة التسميع والأخطاء - ربط مع API
import { API_BASE_URL, getApiHeaders } from './authService';

// ===== واجهات البيانات =====

// واجهة إنشاء جلسة تسميع جديدة
export interface CreateSessionData {
  student_id: number;
  teacher_id: number;
  quran_circle_id: number;
  start_surah_number: number;
  start_verse: number;
  end_surah_number: number;
  end_verse: number;
  recitation_type: string;
  duration_minutes?: number;
  grade?: number;
  evaluation?: string;
  teacher_notes?: string;
}

// واجهة استجابة إنشاء الجلسة
export interface CreateSessionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    session_id: string;
    student_id: number;
    teacher_id: number;
    quran_circle_id: number;
    curriculum_id?: number;
    start_surah_number: number;
    start_verse: number;
    end_surah_number: number;
    end_verse: number;
    recitation_type: string;
    duration_minutes: number;
    grade: string;
    evaluation: string;
    status: string;
    teacher_notes: string;
    has_errors: boolean;
    total_verses: number;
    created_at: string;
    updated_at: string;
  };
}

// واجهة إضافة الأخطاء
export interface AddErrorsData {
  session_id: string;
  errors: RecitationError[];
}

// واجهة خطأ التسميع
export interface RecitationError {
  surah_number: number;
  verse_number: number;
  word_text: string;
  error_type: string; // 'حفظ' | 'تجويد' | 'نطق' | 'ترتيل'
  correction_note?: string;
  teacher_note?: string;
  is_repeated?: boolean;
  severity_level?: string; // 'خفيف' | 'متوسط' | 'شديد'
}

// واجهة استجابة إضافة الأخطاء
export interface AddErrorsResponse {
  success: boolean;
  message: string;
  data: {
    session_id: string;
    errors_added: number;
    error_ids: number[];
  };
}

// واجهة جلسة التسميع الكاملة
export interface RecitationSession {
  session_id: string;
  database_id: number;
  student_id: number;
  teacher_id: number;
  quran_circle_id: number;
  start_surah_number: number;
  start_verse: number;
  end_surah_number: number;
  end_verse: number;
  recitation_type: string;
  duration_minutes?: number;
  grade: number;
  evaluation: string;
  teacher_notes: string;
  has_errors: boolean;
  errors: RecitationError[];
  created_at: string;
  updated_at?: string;
}

// ===== دوال الخدمة =====

/**
 * إنشاء جلسة تسميع جديدة
 */
export async function createRecitationSession(sessionData: CreateSessionData): Promise<CreateSessionResponse> {
  try {
    console.log('🚀 إنشاء جلسة تسميع جديدة...', sessionData);
    
    const response = await fetch(`${API_BASE_URL}/recitation/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ تم إنشاء الجلسة بنجاح:', data);
    return data;

  } catch (error) {
    console.error('❌ خطأ في إنشاء جلسة التسميع:', error);
    throw error;
  }
}

/**
 * إضافة أخطاء لجلسة تسميع موجودة
 */
export async function addRecitationErrors(errorsData: AddErrorsData): Promise<AddErrorsResponse> {
  try {
    console.log('🚀 إضافة أخطاء للجلسة...', errorsData);
    
    const response = await fetch(`${API_BASE_URL}/recitation/errors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(errorsData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ تم إضافة الأخطاء بنجاح:', data);
    return data;

  } catch (error) {
    console.error('❌ خطأ في إضافة الأخطاء:', error);
    throw error;
  }
}

/**
 * الحصول على تفاصيل جلسة تسميع
 */
export async function getRecitationSession(sessionId: string): Promise<RecitationSession> {
  try {
    console.log('🚀 جلب تفاصيل الجلسة:', sessionId);
    
    const response = await fetch(`${API_BASE_URL}/recitation/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ تم جلب تفاصيل الجلسة بنجاح:', data);
    return data;

  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل الجلسة:', error);
    throw error;
  }
}

/**
 * تحديث درجة وملاحظات جلسة التسميع
 */
export async function updateRecitationSession(
  sessionId: string, 
  updateData: {
    grade?: number;
    evaluation?: string;
    teacher_notes?: string;
    duration_minutes?: number;
  }
): Promise<any> {
  try {
    console.log('🚀 تحديث جلسة التسميع...', { sessionId, updateData });
    
    const response = await fetch(`${API_BASE_URL}/recitation/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ تم تحديث الجلسة بنجاح:', data);
    return data;

  } catch (error) {
    console.error('❌ خطأ في تحديث الجلسة:', error);
    throw error;
  }
}

/**
 * جلب آخر تسميع للطالب حسب نوع التسميع
 */
export async function getLastRecitationByType(
  studentId: number, 
  recitationType: string
): Promise<any | null> {
  try {
    console.log(`🔍 جلب آخر تسميع للطالب ${studentId} من نوع ${recitationType}`);
    
    // ترميز النص العربي بشكل صحيح
    const encodedType = encodeURIComponent(recitationType);
    const url = `${API_BASE_URL}/students/${studentId}/last-recitation?recitation_type=${encodedType}`;
    
    console.log(`🌐 URL المُستخدم: ${url}`);
      const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    console.log(`📡 رد الخادم - الحالة: ${response.status}, نوع المحتوى: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status} Error:`, errorText);
      
      if (response.status === 404) {
        console.log(`ℹ️ لا يوجد تسميع من نوع ${recitationType} للطالب ${studentId}`);
        return null;
      }
      
      // إذا كانت الاستجابة HTML بدلاً من JSON، فهذا يعني خطأ في الخادم
      if (errorText.includes('<!DOCTYPE')) {
        console.error('❌ الخادم أرجع صفحة HTML بدلاً من JSON - ربما مشكلة في المسار');
        return null;
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('❌ الاستجابة ليست JSON:', responseText.substring(0, 200));
      return null;
    }

    const data = await response.json();
    console.log(`✅ تم جلب آخر تسميع من نوع ${recitationType}:`, data);
    
    return data.success ? data.data : null;

  } catch (error) {
    console.error(`❌ خطأ في جلب آخر تسميع من نوع ${recitationType}:`, error);
    
    // إذا كان خطأ parsing JSON، فربما الخادم أرجع HTML
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      console.error('❌ خطأ في parsing JSON - ربما الخادم أرجع HTML بدلاً من JSON');
    }
    
    return null;
  }
}

// ===== دوال مساعدة =====

/**
 * تحويل نوع الخطأ من العربية للإنجليزية (إذا احتجنا لذلك مستقبلاً)
 */
export function translateErrorType(arabicType: string): string {
  const translations: { [key: string]: string } = {
    'حفظ': 'memory',
    'تجويد': 'tajweed',
    'نطق': 'pronunciation',
    'ترتيل': 'recitation'
  };
  
  return translations[arabicType] || arabicType;
}

/**
 * تحديد مستوى شدة الخطأ بناءً على نوعه
 */
export function calculateSeverityLevel(errorType: string): string {
  switch (errorType) {
    case 'حفظ':
      return 'شديد';
    case 'تجويد':
      return 'متوسط';
    case 'نطق':
      return 'خفيف';
    case 'ترتيل':
      return 'متوسط';
    default:
      return 'متوسط';
  }
}

/**
 * تحويل الدرجة الرقمية إلى تقييم نصي
 */
export function getEvaluationText(score: number): string {
  if (score >= 95) return 'ممتاز';
  if (score >= 85) return 'جيد جداً';
  if (score >= 75) return 'جيد';
  if (score >= 65) return 'مقبول';
  return 'ضعيف';
}

/**
 * تحويل معرف السورة من الاسم العربي إلى الرقم
 */
export function getSurahNumberByName(surahName: string): number {
  const surahMap: { [key: string]: number } = {
    'الفاتحة': 1,
    'البقرة': 2,
    'آل عمران': 3,
    'النساء': 4,
    'المائدة': 5,
    'الأنعام': 6,
    'الأعراف': 7,
    'الأنفال': 8,
    'التوبة': 9,
    'يونس': 10,
    // يمكن إكمال باقي السور حسب الحاجة
  };
  
  return surahMap[surahName] || 1;
}

/**
 * تنسيق تاريخ آخر تسميع لعرضه للمستخدم
 */
export function formatLastRecitationDate(sessionDate: string): string {
  try {
    const sessionDateTime = new Date(sessionDate);
    const now = new Date();
    const diffInMs = now.getTime() - sessionDateTime.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'آخر تسميع اليوم';
    } else if (diffInDays === 1) {
      return 'آخر تسميع أمس';
    } else if (diffInDays <= 7) {
      return `آخر تسميع قبل ${diffInDays} أيام`;
    } else if (diffInDays <= 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `آخر تسميع قبل ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `آخر تسميع قبل ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
    }
  } catch (error) {
    console.error('خطأ في تنسيق التاريخ:', error);
    return 'تاريخ غير صحيح';
  }
}

/**
 * تنسيق نطاق السور والآيات للعرض
 */
export function formatSurahRange(surahRange: any): string {
  if (!surahRange || !surahRange.start_surah || !surahRange.start_verse) {
    return '';
  }

  const startSurah = getSurahNameById(surahRange.start_surah);
  const endSurah = getSurahNameById(surahRange.end_surah);

  if (surahRange.start_surah === surahRange.end_surah) {
    // نفس السورة
    if (surahRange.start_verse === surahRange.end_verse) {
      return `سورة ${startSurah} آية ${surahRange.start_verse}`;
    } else {
      return `سورة ${startSurah} من ${surahRange.start_verse} إلى ${surahRange.end_verse}`;
    }
  } else {
    // سور مختلفة
    return `${startSurah} ${surahRange.start_verse} إلى ${endSurah} ${surahRange.end_verse}`;
  }
}

/**
 * الحصول على اسم السورة بالمعرف
 */
function getSurahNameById(surahId: number): string {
  const surahs: { [key: number]: string } = {
    1: 'الفاتحة',
    2: 'البقرة',
    3: 'آل عمران',
    4: 'النساء',
    5: 'المائدة',
    6: 'الأنعام',
    7: 'الأعراف',
    8: 'الأنفال',
    9: 'التوبة',
    10: 'يونس',
    11: 'هود',
    12: 'يوسف',
    13: 'الرعد',
    14: 'إبراهيم',
    15: 'الحجر',
    16: 'النحل',
    17: 'الإسراء',
    18: 'الكهف',
    19: 'مريم',
    20: 'طه',
    21: 'الأنبياء',
    22: 'الحج',
    23: 'المؤمنون',
    24: 'النور',
    25: 'الفرقان',
    26: 'الشعراء',
    27: 'النمل',
    28: 'القصص',
    29: 'العنكبوت',
    30: 'الروم',
    31: 'لقمان',
    32: 'السجدة',
    33: 'الأحزاب',
    34: 'سبأ',
    35: 'فاطر',
    36: 'يس',
    37: 'الصافات',
    38: 'ص',
    39: 'الزمر',
    40: 'غافر',
    41: 'فصلت',
    42: 'الشورى',
    43: 'الزخرف',
    44: 'الدخان',
    45: 'الجاثية',
    46: 'الأحقاف',
    47: 'محمد',
    48: 'الفتح',
    49: 'الحجرات',
    50: 'ق',
    51: 'الذاريات',
    52: 'الطور',
    53: 'النجم',
    54: 'القمر',
    55: 'الرحمن',
    56: 'الواقعة',
    57: 'الحديد',
    58: 'المجادلة',
    59: 'الحشر',
    60: 'الممتحنة',
    61: 'الصف',
    62: 'الجمعة',
    63: 'المنافقون',
    64: 'التغابن',
    65: 'الطلاق',
    66: 'التحريم',
    67: 'الملك',
    68: 'القلم',
    69: 'الحاقة',
    70: 'المعارج',
    71: 'نوح',
    72: 'الجن',
    73: 'المزمل',
    74: 'المدثر',
    75: 'القيامة',
    76: 'الإنسان',
    77: 'المرسلات',
    78: 'النبأ',
    79: 'النازعات',
    80: 'عبس',
    81: 'التكوير',
    82: 'الانفطار',
    83: 'المطففين',
    84: 'الانشقاق',
    85: 'البروج',
    86: 'الطارق',
    87: 'الأعلى',
    88: 'الغاشية',
    89: 'الفجر',
    90: 'البلد',
    91: 'الشمس',
    92: 'الليل',
    93: 'الضحى',
    94: 'الشرح',
    95: 'التين',
    96: 'العلق',
    97: 'القدر',
    98: 'البينة',
    99: 'الزلزلة',
    100: 'العاديات',
    101: 'القارعة',
    102: 'التكاثر',
    103: 'العصر',
    104: 'الهمزة',
    105: 'الفيل',
    106: 'قريش',
    107: 'الماعون',
    108: 'الكوثر',
    109: 'الكافرون',
    110: 'النصر',
    111: 'المسد',
    112: 'الإخلاص',
    113: 'الفلق',
    114: 'الناس'
  };
  
  return surahs[surahId] || `السورة ${surahId}`;
}
