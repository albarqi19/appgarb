// نظام التزامن الذكي - منصة غرب
// يضمن تزامن البيانات بين التخزين المحلي والخادم بذكاء

import { smartCache } from './smartCacheService';
import { intelligentLoader } from './intelligentLoadingManager';

export interface SyncOperation {
  id: string;
  type: 'upload' | 'download' | 'bidirectional';
  dataType: string;
  localKey: string;
  remoteEndpoint: string;
  priority: 'immediate' | 'high' | 'normal' | 'low';
  conflictResolution: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  lastSyncTimestamp?: number;
  localTimestamp?: number;
  remoteTimestamp?: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed' | 'conflict';
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export interface ConflictResolution {
  operationId: string;
  resolution: 'use-local' | 'use-remote' | 'use-merged';
  mergedData?: any;
}

export interface SyncStrategy {
  name: string;
  enabled: boolean;
  intervalMs: number;
  batchSize: number;
  syncOnlyOnWifi: boolean;
  syncOnlyWhenCharging: boolean;
  maxSyncTime: number; // الحد الأقصى لوقت التزامن بالثانية
}

export class SmartSyncService {
  private static instance: SmartSyncService;
  private syncQueue: SyncOperation[] = [];
  private activeSyncs: Map<string, SyncOperation> = new Map();
  private syncHistory: Map<string, Date> = new Map();
  private conflictQueue: SyncOperation[] = [];
  private strategies: Map<string, SyncStrategy> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;
  private isSyncing = false;

  private constructor() {
    this.initializeSyncStrategies();
    this.setupNetworkListeners();
    this.setupVisibilityListeners();
    this.startPeriodicSync();
  }

  static getInstance(): SmartSyncService {
    if (!SmartSyncService.instance) {
      SmartSyncService.instance = new SmartSyncService();
    }
    return SmartSyncService.instance;
  }

  /**
   * تهيئة استراتيجيات التزامن
   */
  private initializeSyncStrategies() {
    // استراتيجية التزامن الفوري للبيانات الحرجة
    this.strategies.set('immediate', {
      name: 'Immediate Sync',
      enabled: true,
      intervalMs: 0, // فوري
      batchSize: 1,
      syncOnlyOnWifi: false,
      syncOnlyWhenCharging: false,
      maxSyncTime: 10
    });

    // استراتيجية التزامن السريع للبيانات المهمة
    this.strategies.set('fast', {
      name: 'Fast Sync',
      enabled: true,
      intervalMs: 30000, // 30 ثانية
      batchSize: 5,
      syncOnlyOnWifi: false,
      syncOnlyWhenCharging: false,
      maxSyncTime: 30
    });

    // استراتيجية التزامن العادي
    this.strategies.set('normal', {
      name: 'Normal Sync',
      enabled: true,
      intervalMs: 300000, // 5 دقائق
      batchSize: 10,
      syncOnlyOnWifi: false,
      syncOnlyWhenCharging: false,
      maxSyncTime: 60
    });

    // استراتيجية التزامن الخلفي
    this.strategies.set('background', {
      name: 'Background Sync',
      enabled: true,
      intervalMs: 1800000, // 30 دقيقة
      batchSize: 20,
      syncOnlyOnWifi: true,
      syncOnlyWhenCharging: false,
      maxSyncTime: 300
    });
  }

  /**
   * إعداد مستمعي الشبكة
   */
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 عاد الاتصال - بدء التزامن');
      this.triggerSync('network-online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('❌ انقطع الاتصال - إيقاف التزامن');
      this.pauseActiveSync();
    });
  }

  /**
   * إعداد مستمعي رؤية الصفحة
   */
  private setupVisibilityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ أصبحت الصفحة مرئية - فحص التزامن');
        this.triggerSync('page-visible');
      }
    });
  }

  /**
   * بدء التزامن الدوري
   */
  private startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.triggerSync('periodic');
    }, 60000); // فحص كل دقيقة
  }

  /**
   * إضافة عملية تزامن
   */
  addSyncOperation(
    dataType: string,
    localKey: string,
    remoteEndpoint: string,
    type: SyncOperation['type'] = 'bidirectional',
    priority: SyncOperation['priority'] = 'normal'
  ): string {
    const operationId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const operation: SyncOperation = {
      id: operationId,
      type,
      dataType,
      localKey,
      remoteEndpoint,
      priority,
      conflictResolution: this.getDefaultConflictResolution(dataType),
      status: 'pending',
      retryCount: 0,
      maxRetries: 3
    };

    this.syncQueue.push(operation);
    this.sortSyncQueue();

    console.log(`📋 تمت إضافة عملية تزامن: ${dataType} (${priority})`);

    // تنفيذ فوري للعمليات الحرجة
    if (priority === 'immediate' && this.isOnline) {
      this.processImmediateSync(operation);
    }

    return operationId;
  }

  /**
   * الحصول على استراتيجية حل التعارض الافتراضية
   */
  private getDefaultConflictResolution(dataType: string): SyncOperation['conflictResolution'] {
    const resolutionMap: Record<string, SyncOperation['conflictResolution']> = {
      'attendance': 'server-wins', // بيانات الحضور - الخادم أولوية
      'students': 'merge', // بيانات الطلاب - دمج
      'user_preferences': 'client-wins', // إعدادات المستخدم - العميل أولوية
      'recitations': 'server-wins', // التسميعات - الخادم أولوية
      'statistics': 'server-wins' // الإحصائيات - الخادم أولوية
    };

    return resolutionMap[dataType] || 'server-wins';
  }

  /**
   * ترتيب طابور التزامن
   */
  private sortSyncQueue() {
    const priorityOrder = { immediate: 4, high: 3, normal: 2, low: 1 };
    
    this.syncQueue.sort((a, b) => {
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      return bPriority - aPriority;
    });
  }

  /**
   * تشغيل التزامن
   */
  private async triggerSync(reason: string) {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    console.log(`🔄 تشغيل التزامن بسبب: ${reason}`);
    
    // فحص الشروط للتزامن
    if (!this.shouldSync()) {
      console.log('⏸️ تم تأجيل التزامن - الشروط غير مناسبة');
      return;
    }

    this.isSyncing = true;
    
    try {
      await this.processSyncQueue();
    } catch (error) {
      console.error('❌ خطأ في التزامن:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * فحص إمكانية التزامن
   */
  private shouldSync(): boolean {
    // فحص الشبكة
    if (!this.isOnline) return false;

    // فحص نوع الشبكة (WiFi فقط للتزامن الخلفي)
    const connection = (navigator as any).connection;
    if (connection) {
      const isWifi = connection.type === 'wifi';
      const backgroundOpsNeedWifi = this.syncQueue.some(op => 
        op.priority === 'low' && this.strategies.get('background')?.syncOnlyOnWifi
      );
      
      if (backgroundOpsNeedWifi && !isWifi) {
        // إزالة العمليات التي تحتاج WiFi
        this.syncQueue = this.syncQueue.filter(op => op.priority !== 'low');
        return this.syncQueue.length > 0;
      }
    }

    // فحص حالة البطارية (إذا كانت متوفرة)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const needsCharging = this.syncQueue.some(op => 
          this.strategies.get('background')?.syncOnlyWhenCharging
        );
        
        if (needsCharging && !battery.charging && battery.level < 0.2) {
          console.log('🔋 البطارية منخفضة - تأجيل التزامن الخلفي');
          return false;
        }
      });
    }

    return this.syncQueue.length > 0;
  }

  /**
   * معالجة طابور التزامن
   */
  private async processSyncQueue() {
    const maxConcurrent = 2; // حد أقصى للعمليات المتزامنة
    const processed: Promise<void>[] = [];

    while (this.syncQueue.length > 0 && processed.length < maxConcurrent) {
      const operation = this.syncQueue.shift()!;
      processed.push(this.processSyncOperation(operation));
    }

    if (processed.length > 0) {
      await Promise.allSettled(processed);
    }
  }

  /**
   * معالجة عملية تزامن واحدة
   */
  private async processSyncOperation(operation: SyncOperation) {
    operation.status = 'syncing';
    this.activeSyncs.set(operation.id, operation);

    console.log(`🔄 بدء تزامن: ${operation.dataType}`);

    try {
      switch (operation.type) {
        case 'upload':
          await this.performUpload(operation);
          break;
        case 'download':
          await this.performDownload(operation);
          break;
        case 'bidirectional':
          await this.performBidirectionalSync(operation);
          break;
      }

      operation.status = 'completed';
      operation.lastSyncTimestamp = Date.now();
      this.syncHistory.set(operation.dataType, new Date());

      console.log(`✅ اكتمل تزامن: ${operation.dataType}`);

    } catch (error) {
      await this.handleSyncError(operation, error as Error);
    } finally {
      this.activeSyncs.delete(operation.id);
    }
  }

  /**
   * تنفيذ رفع البيانات
   */
  private async performUpload(operation: SyncOperation) {
    const localData = await smartCache.get(operation.localKey);
    if (!localData) {
      throw new Error(`لا توجد بيانات محلية للرفع: ${operation.localKey}`);
    }

    const response = await fetch(operation.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        data: localData,
        timestamp: Date.now(),
        clientId: this.getClientId()
      })
    });

    if (!response.ok) {
      throw new Error(`فشل الرفع: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    operation.remoteTimestamp = result.timestamp;
  }

  /**
   * تنفيذ تحميل البيانات
   */
  private async performDownload(operation: SyncOperation) {
    const lastSync = this.syncHistory.get(operation.dataType);
    const params = new URLSearchParams();
    
    if (lastSync) {
      params.append('since', lastSync.toISOString());
    }

    const url = `${operation.remoteEndpoint}?${params}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`فشل التحميل: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.data) {
      await smartCache.set(operation.localKey, result.data);
      operation.remoteTimestamp = result.timestamp;
    }
  }

  /**
   * تنفيذ التزامن ثنائي الاتجاه
   */
  private async performBidirectionalSync(operation: SyncOperation) {
    const localData = await smartCache.get(operation.localKey);
    const localTimestamp = operation.localTimestamp || 0;

    // طلب البيانات من الخادم مع الطابع الزمني المحلي
    const response = await fetch(operation.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        localData,
        localTimestamp,
        clientId: this.getClientId()
      })
    });

    if (!response.ok) {
      throw new Error(`فشل التزامن: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // معالجة النتيجة
    if (result.conflict) {
      await this.handleConflict(operation, result);
    } else if (result.data) {
      // تحديث البيانات المحلية
      await smartCache.set(operation.localKey, result.data);
      operation.remoteTimestamp = result.timestamp;
    }
  }

  /**
   * معالجة التعارض
   */
  private async handleConflict(operation: SyncOperation, conflictData: any) {
    operation.status = 'conflict';
    operation.localTimestamp = conflictData.localTimestamp;
    operation.remoteTimestamp = conflictData.remoteTimestamp;

    console.log(`⚠️ تعارض في التزامن: ${operation.dataType}`);

    switch (operation.conflictResolution) {
      case 'server-wins':
        await smartCache.set(operation.localKey, conflictData.serverData);
        operation.status = 'completed';
        break;

      case 'client-wins':
        // إعادة رفع البيانات المحلية
        await this.performUpload(operation);
        break;

      case 'merge':
        const mergedData = await this.mergeData(
          conflictData.localData,
          conflictData.serverData,
          operation.dataType
        );
        await smartCache.set(operation.localKey, mergedData);
        operation.status = 'completed';
        break;

      case 'manual':
        // إضافة إلى طابور التعارضات للحل اليدوي
        this.conflictQueue.push(operation);
        this.notifyConflict(operation, conflictData);
        break;
    }
  }

  /**
   * دمج البيانات المتعارضة
   */
  private async mergeData(localData: any, serverData: any, dataType: string): Promise<any> {
    // استراتيجيات دمج مختلفة حسب نوع البيانات
    switch (dataType) {
      case 'students':
        return this.mergeStudentsData(localData, serverData);
      
      case 'user_preferences':
        return this.mergePreferences(localData, serverData);
      
      default:
        // استراتيجية دمج افتراضية - إعطاء أولوية للبيانات الأحدث
        return serverData.timestamp > localData.timestamp ? serverData : localData;
    }
  }

  /**
   * دمج بيانات الطلاب
   */
  private mergeStudentsData(localData: any[], serverData: any[]): any[] {
    const merged = new Map();

    // إضافة البيانات المحلية
    localData.forEach(student => {
      merged.set(student.id, student);
    });

    // دمج البيانات من الخادم
    serverData.forEach(student => {
      const existing = merged.get(student.id);
      if (!existing || student.lastModified > existing.lastModified) {
        merged.set(student.id, student);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * دمج الإعدادات
   */
  private mergePreferences(localPrefs: any, serverPrefs: any): any {
    return {
      ...serverPrefs,
      ...localPrefs, // الإعدادات المحلية لها أولوية
      lastSync: Date.now()
    };
  }

  /**
   * إشعار بالتعارض
   */
  private notifyConflict(operation: SyncOperation, conflictData: any) {
    // إرسال حدث مخصص للتطبيق
    const event = new CustomEvent('syncConflict', {
      detail: {
        operation,
        conflictData
      }
    });
    
    window.dispatchEvent(event);
    
    console.log(`🚨 تم إشعار التطبيق بتعارض في: ${operation.dataType}`);
  }

  /**
   * حل التعارض يدوياً
   */
  resolveConflict(operationId: string, resolution: ConflictResolution) {
    const operation = this.conflictQueue.find(op => op.id === operationId);
    if (!operation) {
      console.error(`لم يتم العثور على عملية التزامن: ${operationId}`);
      return;
    }

    console.log(`🔧 حل التعارض: ${operation.dataType} -> ${resolution.resolution}`);

    // تطبيق الحل
    switch (resolution.resolution) {
      case 'use-local':
        operation.conflictResolution = 'client-wins';
        break;
      case 'use-remote':
        operation.conflictResolution = 'server-wins';
        break;
      case 'use-merged':
        if (resolution.mergedData) {
          smartCache.set(operation.localKey, resolution.mergedData);
          operation.status = 'completed';
        }
        break;
    }

    // إزالة من طابور التعارضات
    const index = this.conflictQueue.findIndex(op => op.id === operationId);
    if (index > -1) {
      this.conflictQueue.splice(index, 1);
    }

    // إعادة إضافة للتزامن إذا لزم الأمر
    if (operation.status !== 'completed') {
      this.syncQueue.push(operation);
    }
  }

  /**
   * معالجة خطأ التزامن
   */
  private async handleSyncError(operation: SyncOperation, error: Error) {
    operation.retryCount++;
    operation.error = error.message;

    console.error(`❌ خطأ في تزامن ${operation.dataType}:`, error.message);

    if (operation.retryCount <= operation.maxRetries) {
      // إعادة المحاولة مع تأخير
      const delay = Math.pow(2, operation.retryCount) * 1000; // تأخير تصاعدي
      
      setTimeout(() => {
        operation.status = 'pending';
        this.syncQueue.push(operation);
        this.sortSyncQueue();
      }, delay);

      console.log(`🔄 إعادة محاولة ${operation.dataType} بعد ${delay}ms`);
    } else {
      operation.status = 'failed';
      console.error(`💥 فشل نهائي في تزامن ${operation.dataType}`);
    }
  }

  /**
   * التزامن الفوري
   */
  private async processImmediateSync(operation: SyncOperation) {
    try {
      await this.processSyncOperation(operation);
    } catch (error) {
      console.error('خطأ في التزامن الفوري:', error);
    }
  }
  /**
   * إيقاف التزامن النشط
   */
  private pauseActiveSync() {
    // استخدام Array.from() لتحويل MapIterator إلى مصفوفة
    const operations = Array.from(this.activeSyncs.values());
    for (const operation of operations) {
      if (operation.status === 'syncing') {
        operation.status = 'pending';
        this.syncQueue.unshift(operation); // إعادة إلى مقدمة الطابور
      }
    }
    this.activeSyncs.clear();
  }

  /**
   * الحصول على معرف العميل
   */
  private getClientId(): string {
    let clientId = localStorage.getItem('clientId');
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('clientId', clientId);
    }
    return clientId;
  }

  /**
   * إحصائيات التزامن
   */
  getSyncStats() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingOperations: this.syncQueue.length,
      activeOperations: this.activeSyncs.size,
      conflictCount: this.conflictQueue.length,
      lastSyncTimes: Object.fromEntries(this.syncHistory),
      operationsByType: this.syncQueue.reduce((acc, op) => {
        acc[op.type] = (acc[op.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      operationsByPriority: this.syncQueue.reduce((acc, op) => {
        acc[op.priority] = (acc[op.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * فرض التزامن لنوع بيانات معين
   */
  forceSyncDataType(dataType: string) {
    console.log(`🔄 فرض تزامن: ${dataType}`);
    
    // إزالة العمليات الموجودة لنفس النوع
    this.syncQueue = this.syncQueue.filter(op => op.dataType !== dataType);
    
    // إضافة عملية جديدة بأولوية عالية
    this.addSyncOperation(
      dataType,
      dataType,
      `/api/sync/${dataType}`,
      'bidirectional',
      'high'
    );
    
    // تشغيل التزامن فوراً
    if (this.isOnline) {
      this.triggerSync('force-sync');
    }
  }

  /**
   * تنظيف الخدمة
   */
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncQueue = [];
    this.activeSyncs.clear();
    this.conflictQueue = [];
    this.isSyncing = false;
  }
}

// إنشاء instance وحيد
export const smartSync = SmartSyncService.getInstance();
