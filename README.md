# 🚀 Next.js Full-Stack SaaS Starter Template (Enterprise Edition)

قالب Next.js 16 كامل ومتطور مبني ليكون **الأساس القياسي (Standard Boilerplate)** لجميع مشاريعك القادمة. يدمج القالب منظومة الأمان والمصادقة المعتمدة مع تحكم ديناميكي كامل في ألوان وهوية الموقع، التخزين السحابي، الطلبات السريعة عبر الواتساب، وتعدد اللغات.

---

## 📦 الميزات الجاهزة المدمجة (Out of the Box)

1. **نظام المصادقة الشامل والآمن (Auth & Security):**
   - تسجيل حساب جديد (`/signup`) مع فحص Zod الصارم وقوة كلمة المرور وإرسال إيميل ترحيبي.
   - تسجيل الدخول (`/login`) بالبريد وكلمة المرور وتشفير `bcryptjs`.
   - تسجيل الدخول السريع بواسطة **Google OAuth 2.0** (`/api/auth/google`).
   - استعادة كلمة المرور (`/forgot-password`) بإرسال رمز **OTP (6 أرقام)** إلى البريد الإلكتروني.
   - حماية مشددة من هجمات التخمين والإغراق عبر **Rate Limiting** على مسارات الدخول والـ OTP.
   - جلسات مشفرة بـ **JWT Tokens** مخزنة داخل **HttpOnly & Secure Cookies** لمنع هجمات XSS.

2. **لوحة تحكم المدير العام المتقدمة (Admin Panel & Tabs):**
   - صفحة إدارية خاصة ومحمية (`/admin`) لا يدخلها إلا من يملك صلاحية `role: 'admin'`.
   - **تبويب إدارة المستخدمين**: إحصائيات سريعة، جدول مستخدمين مع بحث فوري، حظر/فك حظر الحسابات، وترقية الصلاحيات.
   - **تبويب تخصيص الهوية والألوان (Branding & Theme Settings)**: منتقي ألوان حي (Color Pickers) للون الرئيسي والثانوي وتطبيقهما فوراً، اسم الموقع (عربي/إنجليزي)، العملة، ورقم الواتساب.
   - **تبويب إدارة الطلبات والمبيعات (Orders)**: جدول الطلبات مع زر مباشر لفتح المحادثة على واتساب.

3. **الشراء والطلبات السريعة عبر الواتساب (WhatsApp Direct Checkout):**
   - موديل طلبات متكامل `Order` (`/api/orders`) يدعم توليد روابط رسائل واتساب مهيأة مسبقاً برقم الطلب والمنتجات والإجمالي.
   - الخيار الأمثل للتحويل العالي والبيع السريع للجمهور العربي والخليجي.

4. **نظام الرفع السحابي والمحلي الذكي (Cloud & Local Storage Adapter):**
   - مسار موحد وآمن لرفع الملفات (`/api/upload`) ومكتبة `@/lib/storage`.
   - يدعم التخزين المحلي في `public/uploads` أو الرفع السحابي التلقائي إلى **Cloudinary** بمجرد إضافة بيانات الـ API في `.env`.

5. **تعدد اللغات المدمج والاتجاه الفوري (i18n & RTL / LTR):**
   - نظام ترجمة خفيف عالي الأداء مع قاموس باللغتين العربية والإنجليزية.
   - زر تبديل اللغة `LanguageToggle` مع حفظ التفضيل وتغيير اتجاه الصفحة تلقائياً.

6. **الوضع الليلي والنهاري (Dark / Light Mode):**
   - مدمج بمكون `ThemeToggle` في الشريط العلوي لكافة الصفحات مع حفظ التفضيل في `localStorage`.

7. **تطبيق موبايل فوري (PWA Mobile Ready):**
   - مجهز بملف `manifest` وشاشة تثبيت تفاعلية للأجهزة الذكية (iOS & Android).

8. **قاعدة البيانات والاتصال الموفر (Mongoose Pooling):**
   - متصل بـ **MongoDB** مع ميزة كاش الاتصال في بيئة الـ Serverless لمنع استنزاف اتصالات الداتابيز.

---

## 🛠️ ضبط متغيرات البيئة (.env)

قم بنسخ ملف `.env.example` إلى `.env.local`:
```env
# رابط قاعدة بيانات MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/saas_db?retryWrites=true&w=majority

# مفتاح تشفير الـ JWT
JWT_SECRET=your_super_secret_jwt_key_here

# إعدادات البريد (Gmail App Password أو Mailtrap)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM_NAME="اسم منصتي"

# معرف الدخول بجوجل
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# التخزين السحابي (اختياري - Cloudinary)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 💻 التشغيل وبناء المشروع

```bash
# تشغيل السيرفر المحلي للتطوير
npm run dev

# بناء المشروع للإنتاج
npm run build

# تشغيل الإنتاج
npm start
```
