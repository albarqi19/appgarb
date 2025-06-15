// React Hooks للتكامل مع نظام التحسين الذكي
import { useState, useEffect, useCallback, useRef } from 'react';
import { smartCache } from '../services/smartCacheService';
import { intelligentPredictor } from '../services/intelligentPredictionService';
import { intelligentLoader } from '../services/intelligentLoadingManager';

/**
 * Hook للتحميل الذكي للبيانات
 * يستبدل useEffect العادي بنظام ذكي يحفظ ويتنبأ
 */
export const useSmartData = <T>(
  dataKey: string,
  fetchFunction: () => Promise<T>,
  options: {
    priority?: 'critical' | 'high' | 'medium' | 'low';
    cacheTime?: number; // بالدقائق
    autoRefresh?: boolean;
    teacherId?: string;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  
  const { priority = 'medium', teacherId, autoRefresh = true } = options;

  // تحقق من التخزين المؤقت أولاً
  useEffect(() => {
    const loadFromCache = async () => {
      console.log(`🔍 البحث عن ${dataKey} في التخزين المؤقت...`);
      
      const cachedData = await smartCache.get<T>(dataKey);
      if (cachedData) {
        console.log(`💾 تم العثور على ${dataKey} في التخزين المؤقت`);
        setData(cachedData);
        setLoading(false);
        setFromCache(true);
        
        // تسجيل استخدام البيانات للتنبؤ
        if (teacherId) {
          intelligentPredictor.recordUserAction(teacherId, `load_${dataKey}`, {
            fromCache: true,
            timestamp: Date.now()
          });
        }
        
        // تحديث في الخلفية إذا مطلوب
        if (autoRefresh) {
          smartCache.refreshInBackground(dataKey, fetchFunction);
        }
      } else {
        // لا توجد بيانات محفوظة، استخدم مدير التحميل الذكي
        loadWithIntelligentManager();
      }
    };

    loadFromCache();
  }, [dataKey]);

  // تحميل البيانات باستخدام المدير الذكي
  const loadWithIntelligentManager = useCallback(() => {
    console.log(`📥 تحميل ${dataKey} باستخدام المدير الذكي...`);
    
    const jobId = intelligentLoader.addLoadingJob(
      dataKey,
      `cache_${dataKey}`,
      priority,
      10000, // حجم افتراضي
      {
        onProgress: (progress) => {
          // يمكن عرض شريط تقدم هنا
          console.log(`📊 تقدم تحميل ${dataKey}: ${progress.toFixed(1)}%`);
        },
        onComplete: async (loadedData) => {
          console.log(`✅ اكتمل تحميل ${dataKey}`);
          setData(loadedData);
          setLoading(false);
          setError(null);
          setFromCache(false);
          
          // حفظ في التخزين الذكي
          await smartCache.set(dataKey, loadedData);
          
          // تسجيل للتنبؤ
          if (teacherId) {
            intelligentPredictor.recordUserAction(teacherId, `load_${dataKey}`, {
              fromCache: false,
              loadTime: Date.now()
            });
          }
        },
        onError: (errorMsg) => {
          console.error(`❌ فشل تحميل ${dataKey}:`, errorMsg);
          setError(errorMsg);
          setLoading(false);
        }
      }
    );

    return jobId;
  }, [dataKey, priority, fetchFunction, teacherId]);

  // إعادة تحميل يدوية
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    loadWithIntelligentManager();
  }, [loadWithIntelligentManager]);

  return {
    data,
    loading,
    error,
    fromCache,
    reload
  };
};

/**
 * Hook لتسجيل إجراءات المستخدم للتنبؤ
 */
export const useActionTracker = (teacherId: string) => {
  const trackAction = useCallback((action: string, metadata?: any) => {
    intelligentPredictor.recordUserAction(teacherId, action, metadata);
  }, [teacherId]);

  return { trackAction };
};

/**
 * Hook للتحميل المسبق الذكي
 */
export const useIntelligentPreload = (teacherId: string) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isPreloading, setIsPreloading] = useState(false);

  // الحصول على التنبؤات
  useEffect(() => {
    const updatePredictions = () => {
      const newPredictions = intelligentPredictor.predictNextActions(teacherId);
      setPredictions(newPredictions);
      console.log(`🔮 تم التنبؤ بـ ${newPredictions.length} إجراء للمعلم ${teacherId}`);
    };

    updatePredictions();
    
    // تحديث التنبؤات كل دقيقتين
    const interval = setInterval(updatePredictions, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [teacherId]);

  // بدء التحميل المسبق
  const startPreloading = useCallback(async () => {
    if (isPreloading) return;
    
    console.log('🚀 بدء التحميل المسبق الذكي...');
    setIsPreloading(true);
    
    try {
      await intelligentLoader.intelligentPreload(teacherId);
      console.log('✅ انتهاء التحميل المسبق الذكي');
    } catch (error) {
      console.error('❌ خطأ في التحميل المسبق:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [teacherId, isPreloading]);

  return {
    predictions,
    isPreloading,
    startPreloading
  };
};

/**
 * Hook لمراقبة أداء النظام
 */
export const usePerformanceMonitor = () => {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  useEffect(() => {
    const updateStats = () => {
      setCacheStats(smartCache.getCacheStats());
      setLoadingStats(intelligentLoader.getLoadingStats());
    };

    updateStats();
    
    // تحديث الإحصائيات كل 30 ثانية
    const interval = setInterval(updateStats, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // مراقبة حالة الشبكة
  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      }
    };

    updateNetworkInfo();
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return {
    cacheStats,
    loadingStats,
    networkInfo
  };
};

/**
 * Hook للبيانات الذكية للطلاب (مخصص لقائمة الطلاب)
 */
export const useSmartStudents = (teacherId: string, mosqueId: string) => {
  return useSmartData(
    'students',
    async () => {
      // استيراد الدالة محلياً لتجنب circular dependencies
      const { getTeacherStudentsViaCircles } = await import('../services/authService');
      return getTeacherStudentsViaCircles(teacherId, undefined, mosqueId);
    },
    {
      priority: 'high',
      cacheTime: 24 * 60, // يوم واحد
      autoRefresh: true,
      teacherId
    }
  );
};

/**
 * Hook للبيانات الذكية للحضور (مخصص للتحضير)
 */
export const useSmartAttendance = (teacherId: string, mosqueId: string) => {
  return useSmartData(
    'attendance',
    async () => {
      const { getTodayAttendance } = await import('../services/attendanceService');
      return getTodayAttendance(teacherId, mosqueId);
    },
    {
      priority: 'critical',
      cacheTime: 12 * 60, // 12 ساعة
      autoRefresh: false, // يُحدث عند الحاجة
      teacherId
    }
  );
};

/**
 * Hook للإحصائيات السريعة
 */
export const useSmartStats = (teacherId: string) => {
  return useSmartData(
    'quick_stats',
    async () => {
      // محاكاة جلب الإحصائيات
      return {
        totalStudents: 25,
        presentToday: 20,
        completedSessions: 5,
        averageScore: 85
      };
    },
    {
      priority: 'medium',
      cacheTime: 2 * 60, // ساعتان
      autoRefresh: true,
      teacherId
    }
  );
};
