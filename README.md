# 🎯 Mada_R - نظام إدارة طلبات الصرف المتقدم

نظام شامل لإدارة طلبات الصرف المالي لشركة مدى السياحية، يوفر واجهة سهلة الاستخدام مع نظام مصادقة آمن، تتبع كامل للعمليات، وإمكانيات تقارير متقدمة.

## ✨ المميزات الرئيسية

### 🔐 نظام المصادقة والأمان
- تسجيل دخول آمن باستخدام JWT Tokens
- نظام تسجيل حسابات جديدة (للمسؤولين فقط)
- صلاحيات متعددة المستويات (Admin, Manager, Accountant, User)
- تتبع كامل لجميع العمليات والتعديلات (Audit Log)
- حماية من SQL Injection و XSS
- Rate Limiting لمنع الهجمات

### 📊 إدارة الطلبات
- إنشاء طلبات صرف جديدة مع بنود متعددة
- تحويل تلقائي للمبالغ من أرقام إلى كتابة عربية
- توليد تلقائي لأرقام الطلبات المتسلسلة (MADA-YYYY-XXXX)
- حالات متعددة للطلبات (تم التعميد، في انتظار، موافق، تم التنفيذ)
- إضافة توقيعات رقمية
- بحث وفلترة متقدمة

### 📈 التقارير والإحصائيات
- ملخص إحصائي للشهر الحالي
- إحصائيات شهرية مفصلة
- توزيع الطلبات حسب الأقسام
- رسوم بيانية تفاعلية (Bar Charts, Pie Charts)
- تصدير البيانات (Excel, PDF, CSV)
- دعم كامل للغة العربية في جميع التقارير

### 📧 نظام الإشعارات والبريد الإلكتروني
- إشعارات عند الموافقة على الطلبات
- إشعارات عند التنفيذ
- تنبيهات للطلبات المتأخرة
- إرسال تلقائي للبريد الإلكتروني

### 🎨 واجهة المستخدم
- تصميم عصري وسهل الاستخدام
- دعم كامل للغة العربية (RTL)
- Responsive Design (Desktop, Tablet, Mobile)
- Dark Mode support
- رسوم بيانية تفاعلية
- Toast Notifications

## 🚀 التثبيت والإعداد

### المتطلبات الأساسية
- Node.js (v18 أو أحدث)
- MySQL (v8.0 أو أحدث)
- npm أو pnpm

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/waleedqari2/Mada_R.git
cd Mada_R
```

2. **تثبيت الحزم**
```bash
npm install --legacy-peer-deps
```

3. **إعداد قاعدة البيانات**
```bash
# إنشاء قاعدة البيانات
mysql -u root -p < server/database/schema.sql
```

4. **إعداد متغيرات البيئة**
```bash
# نسخ ملف المثال
cp .env.example .env

# تحديث القيم في ملف .env
nano .env
```

**محتويات ملف .env:**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=mada_requests

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=نظام طلبات الصرف <your_email@gmail.com>

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **تشغيل التطبيق في وضع التطوير**
```bash
npm run dev
```

التطبيق سيعمل على `http://localhost:3000`

## 🐳 التشغيل باستخدام Docker

### استخدام Docker Compose

1. **تحديث ملف .env**
```bash
cp .env.example .env
# قم بتحديث القيم حسب الحاجة
```

2. **بناء وتشغيل الحاويات**
```bash
docker-compose up -d
```

3. **الوصول للتطبيق**
- التطبيق: `http://localhost:3000`
- MySQL: `localhost:3306`

4. **إيقاف الحاويات**
```bash
docker-compose down
```

## 🌐 النشر على Railway

### الخطوات

1. **إنشاء حساب على Railway**
   - انتقل إلى [railway.app](https://railway.app)
   - سجل دخول باستخدام GitHub

2. **إنشاء مشروع جديد**
   - اختر "Deploy from GitHub repo"
   - اختر مستودع Mada_R

3. **إضافة قاعدة بيانات MySQL**
   - اضغط على "+ New"
   - اختر "Database" → "MySQL"
   - انتظر حتى يتم إنشاء قاعدة البيانات

4. **إعداد المتغيرات البيئية**
   - انتقل إلى "Variables"
   - أضف جميع المتغيرات من .env.example
   - استخدم قيم قاعدة البيانات من MySQL plugin

5. **تشغيل Schema**
```bash
# الاتصال بقاعدة البيانات
mysql -h [MYSQL_HOST] -u [MYSQL_USER] -p[MYSQL_PASSWORD] [MYSQL_DATABASE] < server/database/schema.sql
```

6. **Deploy**
   - Railway سيقوم بالبناء والنشر تلقائياً
   - ستحصل على رابط للتطبيق

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
تسجيل الدخول
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### POST /api/auth/register (Admin only)
تسجيل مستخدم جديد
```json
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com",
  "role": "user"
}
```

#### GET /api/auth/profile
الحصول على الملف الشخصي
```
Headers: Authorization: Bearer [token]
```

### Requests Endpoints

#### POST /api/requests
إنشاء طلب جديد
```json
{
  "paymentType": "مصروفات تشغيلية",
  "requesterName": "أحمد محمد",
  "department": "قسم المبيعات",
  "amountInNumbers": 1500,
  "notes": "ملاحظات إضافية",
  "items": [
    {
      "description": "بند أول",
      "unit": "مصروفات",
      "quantity": 1,
      "unitPrice": 1500,
      "total": 1500
    }
  ]
}
```

#### GET /api/requests
الحصول على جميع الطلبات
```
Query Parameters:
  - page: رقم الصفحة (افتراضي: 1)
  - limit: عدد النتائج في الصفحة (افتراضي: 10)
```

#### GET /api/requests/:id
الحصول على طلب محدد

#### PUT /api/requests/:id
تحديث طلب

#### DELETE /api/requests/:id
حذف طلب

#### PUT /api/requests/:id/status
تغيير حالة الطلب
```json
{
  "status": "موافق"
}
```

#### GET /api/requests/search
البحث في الطلبات
```
Query Parameters:
  - query: نص البحث
```

#### GET /api/requests/filter
فلترة الطلبات
```
Query Parameters:
  - status: الحالة
  - department: القسم
  - startDate: تاريخ البداية
  - endDate: تاريخ النهاية
```

### Reports Endpoints

#### GET /api/reports/summary
ملخص إحصائي للشهر الحالي

#### GET /api/reports/monthly
إحصائيات شهرية
```
Query Parameters:
  - year: السنة
  - month: الشهر
```

#### GET /api/reports/by-department
إحصائيات حسب القسم

#### GET /api/reports/export/excel
تصدير Excel

#### GET /api/reports/export/pdf
تصدير PDF

#### GET /api/reports/export/csv
تصدير CSV

### Audit Logs Endpoints

#### GET /api/audit-logs
الحصول على سجل التعديلات
```
Query Parameters:
  - page: رقم الصفحة
  - limit: عدد النتائج
```

### Notifications Endpoints

#### GET /api/notifications
الحصول على إشعارات المستخدم

#### PUT /api/notifications/:id/read
تعيين إشعار كمقروء

#### PUT /api/notifications/read-all
تعيين جميع الإشعارات كمقروءة

## 🛠️ التكنولوجيا المستخدمة

### Backend
- Node.js & Express.js
- TypeScript
- MySQL (mysql2)
- JWT (jsonwebtoken)
- Bcrypt (bcryptjs)
- NodeMailer
- ExcelJS (تصدير Excel)
- PDFKit (تصدير PDF)

### Frontend
- React 19
- TypeScript
- Wouter (Routing)
- TailwindCSS
- Radix UI Components
- Recharts (الرسوم البيانية)
- Axios
- Sonner (Toast Notifications)

### DevOps
- Docker & Docker Compose
- Railway (Deployment)
- Vite (Build Tool)

## 🔒 الأمان

### الميزات الأمنية
- JWT Authentication مع Refresh Tokens
- Password Hashing باستخدام Bcrypt
- SQL Injection Prevention (Prepared Statements)
- CORS Configuration
- Rate Limiting
- Input Validation
- Environment Variables للبيانات الحساسة
- HTTPS في Production

### ⚠️ تنبيهات أمنية مهمة

#### 1. تغيير JWT Secret
```bash
# في ملف .env، قم بإنشاء مفتاح سري قوي
JWT_SECRET=your_very_strong_random_secret_key_here_min_32_chars

# يمكنك إنشاء مفتاح عشوائي باستخدام:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. تغيير كلمة مرور المسؤول الافتراضية
**⚠️ مهم جداً:** بعد إعداد النظام، قم بتغيير كلمة المرور الافتراضية فوراً:

1. سجل الدخول باستخدام:
   - Username: `admin`
   - Password: `admin123`

2. انتقل إلى الملف الشخصي وقم بتغيير كلمة المرور فوراً

3. أو يمكنك حذف حساب admin الافتراضي من قاعدة البيانات وإنشاء حساب جديد

#### 3. أمان قاعدة البيانات
```bash
# تأكد من استخدام كلمة مرور قوية لقاعدة البيانات
DB_PASSWORD=very_strong_database_password_here

# لا تستخدم root في Production
DB_USER=mada_user
```

#### 4. أمان البريد الإلكتروني
```bash
# استخدم App Password لـ Gmail، وليس كلمة المرور العادية
# راجع: https://support.google.com/accounts/answer/185833
EMAIL_PASSWORD=your_gmail_app_password
```

#### 5. في Production
- استخدم HTTPS فقط
- فعّل Rate Limiting
- استخدم Environment Variables آمنة
- قم بعمل Backup منتظم لقاعدة البيانات
- راقب Audit Logs بانتظام
- قم بتحديث الحزم بشكل دوري

## 📝 الحساب الافتراضي

بعد تشغيل schema.sql، يتم إنشاء حساب مسؤول افتراضي:
```
Username: admin
Password: admin123
```

**⚠️ مهم جداً:** يرجى تغيير كلمة المرور الافتراضية فوراً بعد أول تسجيل دخول!

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

MIT License - راجع ملف LICENSE للتفاصيل

## 👥 الفريق

- تطوير: فريق مدى السياحية
- التصميم: فريق مدى السياحية

## 📞 الدعم

للحصول على الدعم، يرجى:
- فتح Issue على GitHub
- التواصل عبر البريد الإلكتروني: support@mada.sa

## 🎉 شكر خاص

شكر خاص لجميع المكتبات والأدوات مفتوحة المصدر المستخدمة في هذا المشروع.

---

Made with ❤️ by Mada Tourism Team