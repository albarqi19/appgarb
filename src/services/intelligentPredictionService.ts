// نظام التنبؤ الذكي للبيانات - منصة غرب
// يتنبأ بالبيانات التي سيحتاجها المعلم ويحملها مسبقاً

export interface UserPattern {
  teacherId: string;
  commonActions: string[];
  preferredTime: string;
  frequentlyAccessedStudents: string[];
  lastSessionDuration: number;
  deviceInfo: {
    platform: string;
    connectionSpeed: 'fast' | 'medium' | 'slow';
    memoryCapacity: 'high' | 'medium' | 'low';
  };
}

export interface PredictionResult {
  action: string;
  confidence: number; // 0-1
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedTime: number; // متى سيحتاج البيانات (بالدقائق)
  dataType: string;
  cacheKey: string;
}

export class IntelligentPredictionService {
  private static instance: IntelligentPredictionService;
  private userPatterns: Map<string, UserPattern> = new Map();
  private actionHistory: Map<string, { action: string; timestamp: number }[]> = new Map();
  
  private constructor() {
    this.loadUserPatterns();
    this.startPatternAnalysis();
  }

  static getInstance(): IntelligentPredictionService {
    if (!IntelligentPredictionService.instance) {
      IntelligentPredictionService.instance = new IntelligentPredictionService();
    }
    return IntelligentPredictionService.instance;
  }

  /**
   * تسجيل إجراء المستخدم لبناء نمط السلوك
   */
  recordUserAction(teacherId: string, action: string, metadata?: any) {
    const timestamp = Date.now();
    
    // تسجيل في تاريخ الإجراءات
    if (!this.actionHistory.has(teacherId)) {
      this.actionHistory.set(teacherId, []);
    }
    
    const history = this.actionHistory.get(teacherId)!;
    history.push({ action, timestamp });
    
    // الاحتفاظ بآخر 100 إجراء فقط
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    // تحديث نمط المستخدم
    this.updateUserPattern(teacherId, action, metadata);
    
    console.log(`📊 تم تسجيل إجراء: ${action} للمعلم ${teacherId}`);
  }

  /**
   * تحديث نمط سلوك المستخدم
   */
  private updateUserPattern(teacherId: string, action: string, metadata?: any) {
    const currentPattern = this.userPatterns.get(teacherId) || this.createDefaultPattern(teacherId);
    
    // تحديث الإجراءات الشائعة
    const existingActionIndex = currentPattern.commonActions.indexOf(action);
    if (existingActionIndex === -1) {
      currentPattern.commonActions.push(action);
    } else {
      // نقل الإجراء إلى المقدمة (الأحدث)
      currentPattern.commonActions.splice(existingActionIndex, 1);
      currentPattern.commonActions.unshift(action);
    }
    
    // تحديث الوقت المفضل
    const currentHour = new Date().getHours();
    currentPattern.preferredTime = this.getTimeCategory(currentHour);
    
    // تحديث مدة الجلسة
    if (metadata?.sessionDuration) {
      currentPattern.lastSessionDuration = metadata.sessionDuration;
    }
    
    // تحديث الطلاب المُتكرر الوصول إليهم
    if (metadata?.studentId && !currentPattern.frequentlyAccessedStudents.includes(metadata.studentId)) {
      currentPattern.frequentlyAccessedStudents.push(metadata.studentId);
      // الاحتفاظ بآخر 20 طالب فقط
      if (currentPattern.frequentlyAccessedStudents.length > 20) {
        currentPattern.frequentlyAccessedStudents.splice(0, 1);
      }
    }
    
    this.userPatterns.set(teacherId, currentPattern);
    this.saveUserPatterns();
  }

  /**
   * إنشاء نمط افتراضي للمستخدم الجديد
   */
  private createDefaultPattern(teacherId: string): UserPattern {
    return {
      teacherId,
      commonActions: [],
      preferredTime: this.getTimeCategory(new Date().getHours()),
      frequentlyAccessedStudents: [],
      lastSessionDuration: 30, // 30 دقيقة افتراضي
      deviceInfo: {
        platform: this.detectPlatform(),
        connectionSpeed: 'medium',
        memoryCapacity: 'medium'
      }
    };
  }

  /**
   * تصنيف الوقت
   */
  private getTimeCategory(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * اكتشاف المنصة
   */
  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  /**
   * التنبؤ بالإجراءات القادمة
   */
  predictNextActions(teacherId: string): PredictionResult[] {
    const pattern = this.userPatterns.get(teacherId);
    if (!pattern) return [];

    const predictions: PredictionResult[] = [];
    const currentTime = new Date().getHours();
    const currentTimeCategory = this.getTimeCategory(currentTime);

    // تحليل تاريخ الإجراءات
    const history = this.actionHistory.get(teacherId) || [];
    const recentActions = history.slice(-10); // آخر 10 إجراءات

    // التنبؤ الأول: الإجراءات الأكثر شيوعاً
    pattern.commonActions.slice(0, 3).forEach((action, index) => {
      const confidence = Math.max(0.9 - (index * 0.2), 0.3);
      predictions.push({
        action,
        confidence,
        priority: index === 0 ? 'immediate' : index === 1 ? 'high' : 'medium',
        estimatedTime: index * 5 + 2, // 2, 7, 12 دقائق
        dataType: this.getDataTypeForAction(action),
        cacheKey: this.getCacheKeyForAction(action)
      });
    });

    // التنبؤ الثاني: بناءً على الوقت الحالي
    const timeBasedActions = this.getTimeBasedPredictions(currentTimeCategory);
    timeBasedActions.forEach(action => {
      if (!predictions.some(p => p.action === action.action)) {
        predictions.push(action);
      }
    });

    // التنبؤ الثالث: الطلاب المُتكرر الوصول إليهم
    if (pattern.frequentlyAccessedStudents.length > 0) {
      const topStudents = pattern.frequentlyAccessedStudents.slice(0, 5);
      topStudents.forEach((studentId, index) => {
        predictions.push({
          action: `view_student_${studentId}`,
          confidence: 0.7 - (index * 0.1),
          priority: index < 2 ? 'high' : 'medium',
          estimatedTime: 15 + (index * 5),
          dataType: 'student_details',
          cacheKey: `student_${studentId}_data`
        });
      });
    }

    // التنبؤ الرابع: بناءً على تسلسل الإجراءات
    const sequencePredictions = this.analyzeActionSequences(recentActions);
    predictions.push(...sequencePredictions);

    // ترتيب التنبؤات حسب الأولوية والثقة
    return predictions
      .sort((a, b) => {
        const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 10); // أفضل 10 تنبؤات
  }

  /**
   * تنبؤات بناءً على الوقت
   */
  private getTimeBasedPredictions(timeCategory: string): PredictionResult[] {
    const predictions: PredictionResult[] = [];

    switch (timeCategory) {
      case 'morning':
        predictions.push({
          action: 'check_attendance',
          confidence: 0.85,
          priority: 'immediate',
          estimatedTime: 5,
          dataType: 'attendance_data',
          cacheKey: 'today_attendance'
        });
        break;

      case 'afternoon':
        predictions.push({
          action: 'start_memorization_session',
          confidence: 0.8,
          priority: 'high',
          estimatedTime: 10,
          dataType: 'student_recitations',
          cacheKey: 'recent_recitations'
        });
        break;

      case 'evening':
        predictions.push({
          action: 'review_daily_progress',
          confidence: 0.75,
          priority: 'medium',
          estimatedTime: 20,
          dataType: 'daily_statistics',
          cacheKey: 'daily_stats'
        });
        break;
    }

    return predictions;
  }

  /**
   * تحليل تسلسل الإجراءات
   */
  private analyzeActionSequences(recentActions: { action: string; timestamp: number }[]): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    
    if (recentActions.length < 2) return predictions;

    const lastAction = recentActions[recentActions.length - 1];
    
    // أنماط تسلسل معروفة
    const sequences = {
      'view_students_list': ['check_attendance', 'start_memorization_session'],
      'check_attendance': ['view_student_details', 'send_notifications'],
      'start_memorization_session': ['evaluate_recitation', 'update_progress'],
      'view_student_details': ['edit_curriculum', 'view_progress_history']
    };

    const nextActions = sequences[lastAction.action as keyof typeof sequences];
    if (nextActions) {
      nextActions.forEach((action, index) => {
        predictions.push({
          action,
          confidence: 0.6 - (index * 0.1),
          priority: index === 0 ? 'high' : 'medium',
          estimatedTime: 3 + (index * 2),
          dataType: this.getDataTypeForAction(action),
          cacheKey: this.getCacheKeyForAction(action)
        });
      });
    }

    return predictions;
  }

  /**
   * تحديد نوع البيانات للإجراء
   */
  private getDataTypeForAction(action: string): string {
    const actionDataMap: Record<string, string> = {
      'check_attendance': 'attendance_data',
      'view_students_list': 'students_data',
      'start_memorization_session': 'recitation_data',
      'view_student_details': 'student_details',
      'review_daily_progress': 'statistics_data',
      'edit_curriculum': 'curriculum_data'
    };

    return actionDataMap[action] || 'general_data';
  }

  /**
   * تحديد مفتاح التخزين للإجراء
   */
  private getCacheKeyForAction(action: string): string {
    const actionCacheMap: Record<string, string> = {
      'check_attendance': 'attendance_today',
      'view_students_list': 'students_list',
      'start_memorization_session': 'active_recitations',
      'view_student_details': 'student_profiles',
      'review_daily_progress': 'daily_analytics'
    };

    return actionCacheMap[action] || `cache_${action}`;
  }

  /**
   * تقييم دقة التنبؤات (للتحسين المستمر)
   */
  evaluatePredictionAccuracy(teacherId: string, actualAction: string, predictions: PredictionResult[]) {
    const correctPrediction = predictions.find(p => p.action === actualAction);
    
    if (correctPrediction) {
      const accuracy = correctPrediction.confidence;
      console.log(`✅ تنبؤ صحيح بدقة ${(accuracy * 100).toFixed(1)}%: ${actualAction}`);
      
      // تحسين النمط بناءً على النجاح
      this.improvePredictionModel(teacherId, actualAction, true);
    } else {
      console.log(`❌ تنبؤ خاطئ: لم يتم التنبؤ بـ ${actualAction}`);
      
      // تحسين النمط بناءً على الخطأ
      this.improvePredictionModel(teacherId, actualAction, false);
    }
  }

  /**
   * تحسين نموذج التنبؤ
   */
  private improvePredictionModel(teacherId: string, action: string, wasCorrect: boolean) {
    const pattern = this.userPatterns.get(teacherId);
    if (!pattern) return;

    if (wasCorrect) {
      // زيادة وزن هذا الإجراء في النمط
      const actionIndex = pattern.commonActions.indexOf(action);
      if (actionIndex > 0) {
        // نقل الإجراء إلى مقدمة القائمة
        pattern.commonActions.splice(actionIndex, 1);
        pattern.commonActions.unshift(action);
      }
    } else {
      // إضافة الإجراء المفقود إلى النمط
      if (!pattern.commonActions.includes(action)) {
        pattern.commonActions.push(action);
      }
    }

    this.userPatterns.set(teacherId, pattern);
    this.saveUserPatterns();
  }

  /**
   * حفظ أنماط المستخدمين
   */
  private saveUserPatterns() {
    try {
      const patternsArray = Array.from(this.userPatterns.entries());
      localStorage.setItem('user_patterns', JSON.stringify(patternsArray));
    } catch (error) {
      console.error('خطأ في حفظ أنماط المستخدمين:', error);
    }
  }

  /**
   * تحميل أنماط المستخدمين
   */
  private loadUserPatterns() {
    try {
      const saved = localStorage.getItem('user_patterns');
      if (saved) {
        const patternsArray = JSON.parse(saved);
        this.userPatterns = new Map(patternsArray);
        console.log(`📊 تم تحميل أنماط ${this.userPatterns.size} معلم`);
      }
    } catch (error) {
      console.error('خطأ في تحميل أنماط المستخدمين:', error);
    }
  }

  /**
   * بدء تحليل الأنماط الدوري
   */
  private startPatternAnalysis() {
    setInterval(() => {
      this.performPatternAnalysis();
    }, 10 * 60 * 1000); // كل 10 دقائق
  }
  /**
   * تحليل دوري للأنماط
   */
  private performPatternAnalysis() {
    console.log('🔍 بدء التحليل الدوري للأنماط...');
    
    Array.from(this.userPatterns.entries()).forEach(([teacherId, pattern]) => {
      // تنظيف الإجراءات القديمة
      if (pattern.commonActions.length > 15) {
        pattern.commonActions = pattern.commonActions.slice(0, 15);
      }
      
      // تنظيف الطلاب القدامى
      if (pattern.frequentlyAccessedStudents.length > 20) {
        pattern.frequentlyAccessedStudents = pattern.frequentlyAccessedStudents.slice(0, 20);
      }
    });
    
    this.saveUserPatterns();
  }

  /**
   * إحصائيات التنبؤ
   */
  getPredictionStats(teacherId: string) {
    const pattern = this.userPatterns.get(teacherId);
    const history = this.actionHistory.get(teacherId) || [];
    
    return {
      totalActions: history.length,
      commonActionsCount: pattern?.commonActions.length || 0,
      frequentStudentsCount: pattern?.frequentlyAccessedStudents.length || 0,
      preferredTime: pattern?.preferredTime || 'unknown',
      lastSessionDuration: pattern?.lastSessionDuration || 0,
      deviceInfo: pattern?.deviceInfo || null
    };
  }
}

// إنشاء instance وحيد
export const intelligentPredictor = IntelligentPredictionService.getInstance();
