// خدمة التخزين الذكي المتطور - منصة غرب
// تحسين تجربة المعلم من خلال تخزين ذكي ومتقدم

export interface CacheConfig {
  key: string;
  ttl: number; // مدة البقاء بالدقائق
  priority: 'high' | 'medium' | 'low';
  autoRefresh: boolean; // تحديث تلقائي في الخلفية
  compressionEnabled: boolean;
}

export interface SmartCacheItem<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  priority: 'high' | 'medium' | 'low';
  accessCount: number;
  lastAccessed: number;
  compressed: boolean;
  version: string;
}

// مكونات التخزين الذكي
export class SmartCacheService {
  private static instance: SmartCacheService;
  private cacheConfigs: Map<string, CacheConfig> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  
  private constructor() {
    this.initializeCache();
    this.startCleanupScheduler();
  }

  static getInstance(): SmartCacheService {
    if (!SmartCacheService.instance) {
      SmartCacheService.instance = new SmartCacheService();
    }
    return SmartCacheService.instance;
  }

  /**
   * تهيئة إعدادات التخزين للبيانات المختلفة
   */
  private initializeCache() {
    // بيانات المساجد - نادرة التغيير
    this.registerCacheConfig('mosques', {
      key: 'mosques_data',
      ttl: 7 * 24 * 60, // أسبوع
      priority: 'high',
      autoRefresh: true,
      compressionEnabled: true
    });

    // قوائم الطلاب - متوسطة التغيير
    this.registerCacheConfig('students', {
      key: 'students_data',
      ttl: 24 * 60, // يوم واحد
      priority: 'high',
      autoRefresh: true,
      compressionEnabled: true
    });

    // بيانات التحضير - يومية
    this.registerCacheConfig('attendance', {
      key: 'attendance_data',
      ttl: 12 * 60, // 12 ساعة
      priority: 'high',
      autoRefresh: false, // يُحدث عند الحاجة
      compressionEnabled: false
    });

    // آخر التسميعات - متوسطة الأهمية
    this.registerCacheConfig('last_recitations', {
      key: 'last_recitations',
      ttl: 6 * 60, // 6 ساعات
      priority: 'medium',
      autoRefresh: true,
      compressionEnabled: true
    });

    // إعدادات المستخدم - عالية الأهمية
    this.registerCacheConfig('user_preferences', {
      key: 'user_prefs',
      ttl: 30 * 24 * 60, // شهر
      priority: 'high',
      autoRefresh: false,
      compressionEnabled: false
    });

    // إحصائيات سريعة
    this.registerCacheConfig('quick_stats', {
      key: 'quick_stats',
      ttl: 2 * 60, // ساعتان
      priority: 'medium',
      autoRefresh: true,
      compressionEnabled: true
    });
  }

  /**
   * تسجيل إعدادات تخزين نوع بيانات معين
   */
  registerCacheConfig(type: string, config: CacheConfig) {
    this.cacheConfigs.set(type, config);
  }

  /**
   * حفظ البيانات مع ضغط ذكي
   */
  async set<T>(type: string, data: T, customTtl?: number): Promise<boolean> {
    try {
      const config = this.cacheConfigs.get(type);
      if (!config) {
        console.warn(`❌ لا توجد إعدادات تخزين للنوع: ${type}`);
        return false;
      }

      const now = Date.now();
      const ttl = customTtl || config.ttl;
      
      const cacheItem: SmartCacheItem<T> = {
        data,
        timestamp: now,
        expiresAt: now + (ttl * 60 * 1000),
        priority: config.priority,
        accessCount: 0,
        lastAccessed: now,
        compressed: false,
        version: '1.0'
      };

      // ضغط البيانات إذا كانت كبيرة
      let dataToStore = JSON.stringify(cacheItem);
      if (config.compressionEnabled && dataToStore.length > 5000) {
        const compressed = await this.compressData(cacheItem.data);
        cacheItem.data = compressed as T;
        cacheItem.compressed = true;
        dataToStore = JSON.stringify(cacheItem);
      }

      // فحص الحجم قبل الحفظ
      if (!await this.ensureSpaceAvailable(dataToStore.length)) {
        console.warn(`⚠️ لا توجد مساحة كافية لحفظ ${type}`);
        return false;
      }

      localStorage.setItem(config.key, dataToStore);
      console.log(`💾 تم حفظ ${type} (${this.formatBytes(dataToStore.length)})`);
      return true;

    } catch (error) {
      console.error(`❌ خطأ في حفظ ${type}:`, error);
      return false;
    }
  }

  /**
   * استرجاع البيانات مع إلغاء ضغط ذكي
   */
  async get<T>(type: string): Promise<T | null> {
    try {
      const config = this.cacheConfigs.get(type);
      if (!config) return null;

      const stored = localStorage.getItem(config.key);
      if (!stored) return null;

      const cacheItem: SmartCacheItem<T> = JSON.parse(stored);
      
      // فحص انتهاء الصلاحية
      if (Date.now() > cacheItem.expiresAt) {
        localStorage.removeItem(config.key);
        console.log(`🗑️ انتهت صلاحية ${type}`);
        return null;
      }

      // تحديث إحصائيات الوصول
      cacheItem.accessCount++;
      cacheItem.lastAccessed = Date.now();
      localStorage.setItem(config.key, JSON.stringify(cacheItem));

      // إلغاء ضغط البيانات إذا لزم الأمر
      let data = cacheItem.data;
      if (cacheItem.compressed) {
        data = await this.decompressData(cacheItem.data) as T;
      }

      console.log(`📖 تم استرجاع ${type} (الوصول رقم ${cacheItem.accessCount})`);
      return data;

    } catch (error) {
      console.error(`❌ خطأ في استرجاع ${type}:`, error);
      return null;
    }
  }

  /**
   * فحص صحة البيانات المحفوظة
   */
  isValid(type: string): boolean {
    try {
      const config = this.cacheConfigs.get(type);
      if (!config) return false;

      const stored = localStorage.getItem(config.key);
      if (!stored) return false;

      const cacheItem: SmartCacheItem = JSON.parse(stored);
      return Date.now() <= cacheItem.expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * تحديث ذكي في الخلفية
   */
  async refreshInBackground<T>(
    type: string, 
    refreshFunction: () => Promise<T>
  ): Promise<void> {
    const config = this.cacheConfigs.get(type);
    if (!config?.autoRefresh) return;

    try {
      console.log(`🔄 تحديث ${type} في الخلفية...`);
      const freshData = await refreshFunction();
      await this.set(type, freshData);
      console.log(`✅ تم تحديث ${type} في الخلفية`);
    } catch (error) {
      console.error(`❌ فشل تحديث ${type} في الخلفية:`, error);
    }
  }

  /**
   * ضمان توفر مساحة كافية
   */
  private async ensureSpaceAvailable(requiredSize: number): Promise<boolean> {
    const currentSize = this.getCurrentCacheSize();
    
    if (currentSize + requiredSize <= this.maxCacheSize) {
      return true;
    }

    // تنظيف البيانات حسب الأولوية
    await this.cleanupByPriority();
    
    const newSize = this.getCurrentCacheSize();
    return newSize + requiredSize <= this.maxCacheSize;
  }
  /**
   * حساب حجم التخزين الحالي
   */
  private getCurrentCacheSize(): number {
    let total = 0;
    // استخدام Array.from لتحويل Map إلى مصفوفة قابلة للتكرار
    Array.from(this.cacheConfigs.entries()).forEach(([_, config]) => {
      const item = localStorage.getItem(config.key);
      if (item) {
        total += item.length * 2; // UTF-16 = 2 bytes per character
      }
    });
    return total;
  }
  /**
   * تنظيف البيانات حسب الأولوية
   */
  private async cleanupByPriority(): Promise<void> {
    const itemsToClean: { key: string; priority: string; lastAccessed: number }[] = [];

    // استخدام Array.from لتحويل Map إلى مصفوفة قابلة للتكرار
    Array.from(this.cacheConfigs.entries()).forEach(([type, config]) => {
      const stored = localStorage.getItem(config.key);
      if (stored) {
        try {
          const cacheItem: SmartCacheItem = JSON.parse(stored);
          itemsToClean.push({
            key: config.key,
            priority: cacheItem.priority,
            lastAccessed: cacheItem.lastAccessed
          });
        } catch (error) {
          // إزالة البيانات التالفة
          localStorage.removeItem(config.key);
        }
      }
    });

    // ترتيب حسب الأولوية وآخر وصول
    itemsToClean.sort((a, b) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      if (priorityOrder[a.priority as keyof typeof priorityOrder] !== 
          priorityOrder[b.priority as keyof typeof priorityOrder]) {
        return priorityOrder[a.priority as keyof typeof priorityOrder] - 
               priorityOrder[b.priority as keyof typeof priorityOrder];
      }
      return a.lastAccessed - b.lastAccessed;
    });

    // حذف العناصر ذات الأولوية المنخفضة
    const toRemove = Math.ceil(itemsToClean.length * 0.3); // حذف 30%
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(itemsToClean[i].key);
      console.log(`🗑️ تم حذف ${itemsToClean[i].key} لتوفير مساحة`);
    }
  }

  /**
   * ضغط البيانات (محاكاة - في الواقع ستستخدم مكتبة ضغط)
   */
  private async compressData(data: any): Promise<string> {
    // محاكاة ضغط بسيط
    return btoa(JSON.stringify(data));
  }

  /**
   * إلغاء ضغط البيانات
   */
  private async decompressData(compressedData: any): Promise<any> {
    try {
      return JSON.parse(atob(compressedData as string));
    } catch {
      return compressedData;
    }
  }

  /**
   * تنسيق حجم البيانات
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * جدولة التنظيف الدوري
   */
  private startCleanupScheduler() {
    this.cleanupInterval = setInterval(() => {
      this.performScheduledCleanup();
    }, 30 * 60 * 1000); // كل 30 دقيقة
  }

  /**
   * تنظيف دوري مجدول
   */  private performScheduledCleanup() {
    console.log('🧹 بدء التنظيف الدوري...');
    
    // استخدام Array.from لتحويل Map إلى مصفوفة قابلة للتكرار
    Array.from(this.cacheConfigs.entries()).forEach(([type, config]) => {
      const stored = localStorage.getItem(config.key);
      if (stored) {
        try {
          const cacheItem: SmartCacheItem = JSON.parse(stored);
          if (Date.now() > cacheItem.expiresAt) {
            localStorage.removeItem(config.key);
            console.log(`🗑️ تم حذف ${type} المنتهي الصلاحية`);
          }
        } catch {
          localStorage.removeItem(config.key);
        }
      }
    });
  }

  /**
   * إحصائيات التخزين
   */
  getCacheStats() {
    const stats = {
      totalSize: this.getCurrentCacheSize(),
      maxSize: this.maxCacheSize,
      usagePercentage: (this.getCurrentCacheSize() / this.maxCacheSize) * 100,
      items: [] as any[]
    };    // استخدام Array.from لتحويل Map إلى مصفوفة قابلة للتكرار
    Array.from(this.cacheConfigs.entries()).forEach(([type, config]) => {
      const stored = localStorage.getItem(config.key);
      if (stored) {
        try {
          const cacheItem: SmartCacheItem = JSON.parse(stored);
          stats.items.push({
            type,
            size: stored.length * 2,
            accessCount: cacheItem.accessCount,
            isValid: Date.now() <= cacheItem.expiresAt,
            priority: cacheItem.priority
          });
        } catch (error) {
          console.error(`خطأ في قراءة إحصائيات ${type}:`, error);
        }
      }
    });

    return stats;
  }
  /**
   * تنظيف جميع البيانات
   */
  clearAll() {
    // استخدام Array.from لتحويل Map إلى مصفوفة قابلة للتكرار
    Array.from(this.cacheConfigs.values()).forEach((config) => {
      localStorage.removeItem(config.key);
    });
    console.log('🧹 تم مسح جميع البيانات المحفوظة');
  }

  /**
   * إيقاف الخدمة
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// إنشاء instance وحيد
export const smartCache = SmartCacheService.getInstance();
