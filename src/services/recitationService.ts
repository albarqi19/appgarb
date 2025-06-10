// خدمة التسميع والأخطاء - ربط مع API
import { API_BASE_URL } from './authService';

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
