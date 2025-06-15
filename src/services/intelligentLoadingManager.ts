// مدير التحميل الذكي المتطور - منصة غرب
// يدير تحميل البيانات بذكاء حسب الأولوية وحالة الشبكة

import { smartCache } from './smartCacheService';
import { intelligentPredictor, PredictionResult } from './intelligentPredictionService';
import { getTodayAttendance } from './attendanceService';
import { getTeacherStudentsViaCircles } from './authService';

export interface LoadingJob {
  id: string;
  dataType: string;
  cacheKey: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'background';
  estimatedSize: number;
  estimatedTime: number;
  maxRetries: number;
  currentRetries: number;
  status: 'pending' | 'loading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  onProgress?: (progress: number) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface LoadingStrategy {
  batchSize: number;
  concurrentLoads: number;
  retryDelay: number;
  useCompression: boolean;
  prefetchEnabled: boolean;
}

export class IntelligentLoadingManager {
  private static instance: IntelligentLoadingManager;
  private jobQueue: LoadingJob[] = [];
  private activeJobs: Map<string, LoadingJob> = new Map();
  private loadingHistory: Map<string, { duration: number; success: boolean }[]> = new Map();
  private networkInfo: NetworkInfo = {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  };
  
  private maxConcurrentJobs = 3;
  private isProcessing = false;
  private loadingStrategies: Map<string, LoadingStrategy> = new Map();
  private constructor() {
    this.initializeNetworkMonitoring();
    this.initializeLoadingStrategies();
    this.processJobQueue();
  }

  static getInstance(): IntelligentLoadingManager {
    if (!IntelligentLoadingManager.instance) {
      IntelligentLoadingManager.instance = new IntelligentLoadingManager();
    }
    return IntelligentLoadingManager.instance;
  }

  /**
   * تهيئة مراقبة الشبكة
   */
  private initializeNetworkMonitoring() {
    // مراقبة حالة الشبكة باستخدام Network Information API
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.networkInfo = {
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 50,
        saveData: connection.saveData || false
      };

      connection.addEventListener('change', () => {
        this.updateNetworkInfo();
        this.adaptToNetworkChanges();
      });
    }

    // مراقبة الاتصال بالإنترنت
    window.addEventListener('online', () => {
      console.log('🌐 اتصال الإنترنت عاد - استئناف التحميل');
      this.resumeAllJobs();
    });

    window.addEventListener('offline', () => {
      console.log('❌ انقطع الاتصال - إيقاف التحميل');
      this.pauseAllJobs();
    });
  }

  /**
   * تحديث معلومات الشبكة
   */
  private updateNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.networkInfo = {
        effectiveType: connection.effectiveType || this.networkInfo.effectiveType,
        downlink: connection.downlink || this.networkInfo.downlink,
        rtt: connection.rtt || this.networkInfo.rtt,
        saveData: connection.saveData || this.networkInfo.saveData
      };

      console.log('📶 تحديث معلومات الشبكة:', this.networkInfo);
    }
  }

  /**
   * تهيئة استراتيجيات التحميل
   */
  private initializeLoadingStrategies() {
    // استراتيجية الشبكة السريعة
    this.loadingStrategies.set('fast', {
      batchSize: 10,
      concurrentLoads: 5,
      retryDelay: 1000,
      useCompression: false,
      prefetchEnabled: true
    });

    // استراتيجية الشبكة المتوسطة
    this.loadingStrategies.set('medium', {
      batchSize: 5,
      concurrentLoads: 3,
      retryDelay: 2000,
      useCompression: true,
      prefetchEnabled: true
    });

    // استراتيجية الشبكة البطيئة
    this.loadingStrategies.set('slow', {
      batchSize: 2,
      concurrentLoads: 1,
      retryDelay: 5000,
      useCompression: true,
      prefetchEnabled: false
    });

    // استراتيجية توفير البيانات
    this.loadingStrategies.set('save-data', {
      batchSize: 1,
      concurrentLoads: 1,
      retryDelay: 3000,
      useCompression: true,
      prefetchEnabled: false
    });
  }

  /**
   * التكيف مع تغييرات الشبكة
   */
  private adaptToNetworkChanges() {
    const strategy = this.getCurrentStrategy();
    
    // تحديث عدد المهام المتزامنة
    if (strategy.concurrentLoads !== this.maxConcurrentJobs) {
      this.maxConcurrentJobs = strategy.concurrentLoads;
      console.log(`🔧 تم تعديل عدد المهام المتزامنة إلى ${this.maxConcurrentJobs}`);
    }

    // إلغاء المهام منخفضة الأولوية في الشبكة البطيئة
    if (this.networkInfo.effectiveType === 'slow-2g' || this.networkInfo.effectiveType === '2g') {
      this.cancelLowPriorityJobs();
    }

    // تعديل أولويات التحميل
    this.reorderJobQueue();
  }

  /**
   * الحصول على الاستراتيجية الحالية
   */
  private getCurrentStrategy(): LoadingStrategy {
    if (this.networkInfo.saveData) {
      return this.loadingStrategies.get('save-data')!;
    }

    switch (this.networkInfo.effectiveType) {
      case '4g':
        return this.loadingStrategies.get('fast')!;
      case '3g':
        return this.loadingStrategies.get('medium')!;
      case '2g':
      case 'slow-2g':
        return this.loadingStrategies.get('slow')!;
      default:
        return this.loadingStrategies.get('medium')!;
    }
  }

  /**
   * إضافة مهمة تحميل إلى الطابور
   */
  addLoadingJob(
    dataType: string,
    cacheKey: string,
    priority: LoadingJob['priority'] = 'medium',
    estimatedSize: number = 10000,
    options?: {
      onProgress?: (progress: number) => void;
      onComplete?: (data: any) => void;
      onError?: (error: string) => void;
      maxRetries?: number;
    }
  ): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: LoadingJob = {
      id: jobId,
      dataType,
      cacheKey,
      priority,
      estimatedSize,
      estimatedTime: this.estimateLoadingTime(estimatedSize),
      maxRetries: options?.maxRetries || 3,
      currentRetries: 0,
      status: 'pending',
      progress: 0,
      onProgress: options?.onProgress,
      onComplete: options?.onComplete,
      onError: options?.onError
    };

    // التحقق من وجود البيانات في التخزين المؤقت
    if (smartCache.isValid(cacheKey)) {
      console.log(`💾 البيانات موجودة في التخزين: ${cacheKey}`);
      this.completeJobFromCache(job);
      return jobId;
    }

    this.jobQueue.push(job);
    this.sortJobQueue();
    
    console.log(`📥 تمت إضافة مهمة تحميل: ${dataType} (أولوية: ${priority})`);
    
    // بدء المعالجة إذا لم تكن بدأت
    if (!this.isProcessing) {
      this.processJobQueue();
    }

    return jobId;
  }

  /**
   * تقدير وقت التحميل
   */
  private estimateLoadingTime(size: number): number {
    const baseTime = 1000; // 1 ثانية أساسية
    const sizeMultiplier = size / 10000; // 10KB كوحدة قياس
    const networkMultiplier = this.getNetworkSpeedMultiplier();
    
    return Math.max(baseTime * sizeMultiplier * networkMultiplier, 500);
  }

  /**
   * مضاعف سرعة الشبكة
   */
  private getNetworkSpeedMultiplier(): number {
    switch (this.networkInfo.effectiveType) {
      case '4g': return 1;
      case '3g': return 2;
      case '2g': return 5;
      case 'slow-2g': return 10;
      default: return 2;
    }
  }

  /**
   * ترتيب طابور المهام حسب الأولوية
   */
  private sortJobQueue() {
    const priorityOrder = { critical: 5, high: 4, medium: 3, low: 2, background: 1 };
    
    this.jobQueue.sort((a, b) => {
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // في نفس الأولوية، الأصغر حجماً أولاً
      return a.estimatedSize - b.estimatedSize;
    });
  }

  /**
   * إعادة ترتيب طابور المهام
   */
  private reorderJobQueue() {
    const strategy = this.getCurrentStrategy();
    
    // في الشبكة البطيئة، أعطي أولوية للمهام الصغيرة
    if (!strategy.prefetchEnabled) {
      this.jobQueue = this.jobQueue.filter(job => 
        job.priority === 'critical' || job.priority === 'high' || job.estimatedSize < 50000
      );
    }
    
    this.sortJobQueue();
  }

  /**
   * بدء معالجة طابور المهام
   */
  private async processJobQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🚀 بدء معالجة طابور التحميل...');

    while (this.jobQueue.length > 0 || this.activeJobs.size > 0) {
      // معالجة المهام الجديدة
      while (this.activeJobs.size < this.maxConcurrentJobs && this.jobQueue.length > 0) {
        const job = this.jobQueue.shift()!;
        this.startJob(job);
      }

      // انتظار قصير قبل التحقق مرة أخرى
      await this.sleep(100);
    }

    this.isProcessing = false;
    console.log('✅ انتهاء معالجة طابور التحميل');
  }

  /**
   * بدء مهمة تحميل
   */
  private async startJob(job: LoadingJob) {
    job.status = 'loading';
    job.startTime = Date.now();
    this.activeJobs.set(job.id, job);

    console.log(`🔄 بدء تحميل: ${job.dataType}`);

    try {
      const data = await this.loadData(job);
      await this.completeJob(job, data);
    } catch (error) {
      await this.handleJobError(job, error as Error);
    }
  }

  /**
   * تحميل البيانات حسب النوع
   */
  private async loadData(job: LoadingJob): Promise<any> {
    // محاكاة تحديث التقدم
    const progressInterval = setInterval(() => {
      if (job.progress < 90) {
        job.progress += Math.random() * 20;
        job.onProgress?.(job.progress);
      }
    }, 200);

    try {
      let data: any;

      switch (job.dataType) {
        case 'attendance_data':
          data = await this.loadAttendanceData(job);
          break;
        case 'students_data':
          data = await this.loadStudentsData(job);
          break;
        case 'recitation_data':
          data = await this.loadRecitationData(job);
          break;
        case 'statistics_data':
          data = await this.loadStatisticsData(job);
          break;
        default:
          throw new Error(`نوع بيانات غير معروف: ${job.dataType}`);
      }

      clearInterval(progressInterval);
      job.progress = 100;
      job.onProgress?.(100);

      return data;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  }

  /**
   * تحميل بيانات الحضور
   */
  private async loadAttendanceData(job: LoadingJob): Promise<any> {
    // استخدام الخدمة الموجودة
    const data = await getTodayAttendance(
      job.cacheKey.includes('teacher_') ? job.cacheKey.split('_')[1] : undefined,
      job.cacheKey.includes('mosque_') ? job.cacheKey.split('_')[2] : undefined
    );
    
    // حفظ في التخزين الذكي
    await smartCache.set('attendance', data);
    
    return data;
  }

  /**
   * تحميل بيانات الطلاب
   */
  private async loadStudentsData(job: LoadingJob): Promise<any> {
    // استخدام الخدمة الموجودة
    const data = await getTeacherStudentsViaCircles(
      job.cacheKey.includes('teacher_') ? job.cacheKey.split('_')[1] : '',
      undefined,
      job.cacheKey.includes('mosque_') ? job.cacheKey.split('_')[2] : undefined
    );
    
    // حفظ في التخزين الذكي
    await smartCache.set('students', data);
    
    return data;
  }

  /**
   * تحميل بيانات التسميع
   */
  private async loadRecitationData(job: LoadingJob): Promise<any> {
    // محاكاة تحميل بيانات التسميع
    await this.sleep(job.estimatedTime * 0.8);
    
    const data = {
      recitations: [],
      lastUpdate: new Date()
    };
    
    await smartCache.set('last_recitations', data);
    return data;
  }

  /**
   * تحميل بيانات الإحصائيات
   */
  private async loadStatisticsData(job: LoadingJob): Promise<any> {
    // محاكاة تحميل الإحصائيات
    await this.sleep(job.estimatedTime * 0.6);
    
    const data = {
      dailyStats: {},
      weeklyStats: {},
      lastUpdate: new Date()
    };
    
    await smartCache.set('quick_stats', data);
    return data;
  }

  /**
   * إكمال المهمة بنجاح
   */
  private async completeJob(job: LoadingJob, data: any) {
    job.status = 'completed';
    job.endTime = Date.now();
    job.progress = 100;
    
    const duration = job.endTime - (job.startTime || job.endTime);
    
    // تسجيل في تاريخ التحميل
    this.recordLoadingHistory(job.dataType, duration, true);
    
    // استدعاء callback النجاح
    job.onComplete?.(data);
    
    // إزالة من المهام النشطة
    this.activeJobs.delete(job.id);
    
    console.log(`✅ اكتمل تحميل ${job.dataType} في ${duration}ms`);
  }

  /**
   * إكمال المهمة من التخزين المؤقت
   */
  private async completeJobFromCache(job: LoadingJob) {
    const data = await smartCache.get(job.cacheKey);
    
    // محاكاة تأخير صغير للتخزين المؤقت
    setTimeout(() => {
      job.status = 'completed';
      job.progress = 100;
      job.onProgress?.(100);
      job.onComplete?.(data);
      
      console.log(`⚡ تم تحميل ${job.dataType} من التخزين المؤقت`);
    }, 50);
  }

  /**
   * معالجة خطأ في المهمة
   */
  private async handleJobError(job: LoadingJob, error: Error) {
    job.currentRetries++;
    
    if (job.currentRetries <= job.maxRetries) {
      console.log(`🔄 إعادة محاولة ${job.dataType} (${job.currentRetries}/${job.maxRetries})`);
      
      const strategy = this.getCurrentStrategy();
      await this.sleep(strategy.retryDelay);
      
      // إعادة المهمة إلى الطابور
      job.status = 'pending';
      job.progress = 0;
      this.activeJobs.delete(job.id);
      this.jobQueue.unshift(job); // إضافة في المقدمة
    } else {
      console.error(`❌ فشل تحميل ${job.dataType} نهائياً:`, error.message);
      
      job.status = 'failed';
      job.error = error.message;
      job.endTime = Date.now();
      
      const duration = job.endTime - (job.startTime || job.endTime);
      this.recordLoadingHistory(job.dataType, duration, false);
      
      job.onError?.(error.message);
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * تسجيل تاريخ التحميل
   */
  private recordLoadingHistory(dataType: string, duration: number, success: boolean) {
    if (!this.loadingHistory.has(dataType)) {
      this.loadingHistory.set(dataType, []);
    }
    
    const history = this.loadingHistory.get(dataType)!;
    history.push({ duration, success });
    
    // الاحتفاظ بآخر 50 سجل فقط
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * التحميل المسبق الذكي
   */
  async intelligentPreload(teacherId: string) {
    console.log('🤖 بدء التحميل المسبق الذكي...');
    
    // الحصول على التنبؤات
    const predictions = intelligentPredictor.predictNextActions(teacherId);
    
    // فلترة التنبؤات حسب الشبكة
    const strategy = this.getCurrentStrategy();
    let filteredPredictions = predictions;
    
    if (!strategy.prefetchEnabled) {
      filteredPredictions = predictions.filter(p => 
        p.priority === 'immediate' || p.priority === 'high'
      );
    }
    
    // إضافة مهام التحميل المسبق
    for (const prediction of filteredPredictions.slice(0, 5)) {
      this.addLoadingJob(
        prediction.dataType,
        prediction.cacheKey,
        prediction.priority === 'immediate' ? 'high' : 'background',
        10000 // حجم افتراضي
      );
    }
  }

  /**
   * إلغاء المهام منخفضة الأولوية
   */
  private cancelLowPriorityJobs() {
    console.log('🚫 إلغاء المهام منخفضة الأولوية بسبب الشبكة البطيئة');
    
    // إلغاء من الطابور
    this.jobQueue = this.jobQueue.filter(job => 
      job.priority === 'critical' || job.priority === 'high'
    );
      // إلغاء المهام النشطة منخفضة الأولوية
    Array.from(this.activeJobs.entries()).forEach(([id, job]) => {
      if (job.priority === 'low' || job.priority === 'background') {
        job.status = 'cancelled';
        this.activeJobs.delete(id);
        job.onError?.('تم إلغاء المهمة بسبب الشبكة البطيئة');
      }
    });
  }

  /**
   * إيقاف جميع المهام
   */  private pauseAllJobs() {
    Array.from(this.activeJobs.values()).forEach((job) => {
      if (job.status === 'loading') {
        job.status = 'pending';
        // إعادة إلى الطابور
        this.jobQueue.unshift(job);
        this.activeJobs.delete(job.id);
      }
    });
  }

  /**
   * استئناف جميع المهام
   */
  private resumeAllJobs() {
    if (!this.isProcessing && this.jobQueue.length > 0) {
      this.processJobQueue();
    }
  }

  /**
   * إحصائيات التحميل
   */
  getLoadingStats() {
    const totalJobs = this.jobQueue.length + this.activeJobs.size;
    const activeJobsArray = Array.from(this.activeJobs.values());
    
    return {
      networkInfo: this.networkInfo,
      currentStrategy: this.getCurrentStrategy(),
      totalJobs,
      pendingJobs: this.jobQueue.length,
      activeJobs: this.activeJobs.size,
      maxConcurrentJobs: this.maxConcurrentJobs,
      averageProgress: activeJobsArray.length > 0 
        ? activeJobsArray.reduce((sum, job) => sum + job.progress, 0) / activeJobsArray.length 
        : 0,
      jobsByPriority: {
        critical: this.jobQueue.filter(j => j.priority === 'critical').length,
        high: this.jobQueue.filter(j => j.priority === 'high').length,
        medium: this.jobQueue.filter(j => j.priority === 'medium').length,
        low: this.jobQueue.filter(j => j.priority === 'low').length,
        background: this.jobQueue.filter(j => j.priority === 'background').length
      }
    };
  }

  /**
   * تنظيف الذاكرة
   */
  cleanup() {
    this.jobQueue = [];
    this.activeJobs.clear();
    this.isProcessing = false;
  }

  /**
   * مساعد للنوم
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// إنشاء instance وحيد
export const intelligentLoader = IntelligentLoadingManager.getInstance();
