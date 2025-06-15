# نظام تسجيل الدخول متعدد الأدوار

تم تحديث نظام تسجيل الدخول للتعامل مع المستخدمين الذين لديهم أكثر من دور في النظام.

## المشكلة الأصلية

كان النظام القديم يحاول تسجيل الدخول بجميع أنواع المستخدمين بالتتابع، وكان يقوم بتسجيل الدخول بأول نوع ناجح. هذا أدى إلى:

- سلوك غير طبيعي في تسجيل الدخول (محاولة كمعلم أولاً، ثم كطالب)
- عدم إتاحة الخيار للمستخدم لاختيار الدور المطلوب
- تجربة مستخدم مربكة

## الحل الجديد

### 1. فحص الأدوار المتاحة

```typescript
export const checkAvailableRoles = async (credentials: LoginRequest): Promise<string[]>
```

هذه الدالة تتحقق من جميع الأدوار المتاحة للمستخدم دون إكمال عملية تسجيل الدخول.

### 2. تسجيل دخول ذكي

```typescript
export const loginWithRoleCheck = async (credentials: LoginRequest): Promise<UserLoginResponse | { multipleRoles: string[] }>
```

هذه الدالة:
- إذا كان للمستخدم دور واحد فقط: تقوم بتسجيل الدخول مباشرة
- إذا كان للمستخدم أدوار متعددة: تُرجع قائمة الأدوار للاختيار

### 3. صفحة اختيار الدور

مكون `RoleSelection` يعرض واجهة جميلة لاختيار الدور المطلوب عندما يكون للمستخدم أكثر من دور.

## كيفية الاستخدام

### في صفحة تسجيل الدخول

```typescript
const handleSubmit = async (event: React.FormEvent) => {
  // ... التحقق من البيانات
  
  const response = await loginWithRoleCheck({
    nationalId: formData.nationalId,
    password: formData.password
  });
  
  if ('multipleRoles' in response) {
    // المستخدم لديه أدوار متعددة
    setMultipleRoles(response.multipleRoles);
    setUserInfo({ name: 'مستخدم', nationalId: formData.nationalId });
  } else {
    // دور واحد فقط - تسجيل دخول مباشر
    setUser(response.user);
    navigate(response.redirectPath);
  }
};
```

### التعامل مع اختيار الدور

```typescript
const handleRoleSelect = async (selectedRole: string) => {
  const loginFunction = getLoginFunction(selectedRole);
  const response = await loginFunction(credentials);
  
  setUser(response.user);
  setCurrentRole(selectedRole);
  navigate(response.redirectPath);
};
```

## الحالات المدعومة

### 1. مستخدم بدور واحد
- **السلوك**: تسجيل دخول مباشر
- **المثال**: طالب فقط، أو معلم فقط

### 2. مستخدم بأدوار متعددة
- **السلوك**: عرض صفحة اختيار الدور
- **المثال**: شخص يعمل كمعلم وولي أمر في نفس الوقت

### 3. بيانات خاطئة
- **السلوك**: عرض رسالة خطأ واضحة
- **المثال**: رقم هوية غير موجود أو كلمة مرور خاطئة

## الملفات المحدثة

### 1. `src/services/authService.ts`
- إضافة `checkAvailableRoles()`
- إضافة `loginWithRoleCheck()`
- تصدير `getLoginFunction()`

### 2. `src/pages/LoginPage.tsx`
- تحديث منطق تسجيل الدخول
- إضافة دعم عرض صفحة اختيار الدور
- إضافة معالجة الأدوار المتعددة

### 3. `src/components/RoleSelection.tsx`
- تحديث لدعم البيانات الخارجية
- إضافة حالة التحميل
- تحسين تجربة المستخدم

## اختبار النظام

تم إنشاء ملف اختبار في `src/utils/multiRoleTest.ts` يحتوي على:

```typescript
// اختبار فحص الأدوار
await testMultipleRoles();

// اختبار حالات مختلفة
await testDifferentScenarios();

// تشغيل جميع الاختبارات
await runAllTests();
```

لتشغيل الاختبارات في المتصفح:
```javascript
runMultiRoleTests()
```

## مثال عملي

### المستخدم: 3234567891
إذا كان هذا المستخدم مسجل كـ:
- طالب في النظام
- معلم في نفس الوقت

**السلوك الجديد**:
1. المستخدم يدخل رقم الهوية وكلمة المرور
2. النظام يكتشف أن له دورين
3. يتم عرض صفحة اختيار الدور
4. المستخدم يختار "طالب" أو "معلم"
5. يتم تسجيل الدخول بالدور المحدد

## المزايا

✅ **تجربة مستخدم واضحة**: المستخدم يعرف ما يحدث  
✅ **مرونة في الاختيار**: يمكن اختيار الدور المطلوب  
✅ **أداء محسن**: تقليل عدد طلبات API غير الضرورية  
✅ **معالجة أخطاء أفضل**: رسائل خطأ واضحة ومفيدة  
✅ **قابلية الصيانة**: كود منظم وسهل الفهم  

## التطوير المستقبلي

- إضافة إمكانية حفظ الدور المفضل للمستخدم
- إضافة إمكانية التبديل السريع بين الأدوار
- تحسين واجهة اختيار الدور بالرسوم المتحركة
- إضافة اختبارات تلقائية للحالات المختلفة
