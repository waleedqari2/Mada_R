# 🎯 نظام إدارة طلبات الصرف - مدى

نظام شامل لإدارة طلبات الصرف المالي مع دعم كامل للغة العربية، مبني بتقنيات حديثة ومصمم للعمل على Railway.

## ✨ المميزات

### 🔐 نظام المصادقة الكامل
- تسجيل الدخول والخروج
- إنشاء حسابات جديدة
- JWT Authentication
- Role-Based Access Control (مدير، مدير قسم، موظف)
- تشفير كلمات المرور باستخدام bcrypt

### 📊 لوحة تحكم تفاعلية
- إحصائيات شاملة ورسوم بيانية
- عرض الطلبات حسب الحالة
- تحليل الأقسام والنشاط
- الإشعارات الفورية

### 📝 إدارة الطلبات
- إنشاء وتعديل وحذف الطلبات
- إضافة عناصر متعددة لكل طلب
- الموافقة/الرفض من قبل المدراء
- بحث وتصفية متقدمة
- ترقيم تلقائي

### 📈 التقارير والتصدير
- تقارير شاملة (ملخص، شهري، حسب القسم)
- تصدير Excel مع دعم RTL
- تصدير CSV
- إمكانية تصدير PDF (جاهز للإضافة)

### 🔍 التدقيق والأمان
- سجل كامل لجميع العمليات (Audit Log)
- تتبع التعديلات والتغييرات
- معلومات IP و User Agent
- Rate Limiting للحماية

### 🌍 دعم كامل للعربية
- واجهة RTL كاملة
- تحويل الأرقام إلى نص عربي
- خطوط عربية احترافية
- رسائل خطأ بالعربية

### 🎨 تصميم عصري
- Dark Mode / Light Mode
- Responsive Design (موبايل، تابلت، ديسكتوب)
- مكونات UI حديثة من shadcn/ui
- تأثيرات انتقالية سلسة

## 🛠️ التقنيات المستخدمة

### Backend
- **Node.js** + **Express** - خادم API
- **MySQL** - قاعدة البيانات
- **TypeScript** - لغة البرمجة
- **JWT** - المصادقة
- **bcryptjs** - تشفير كلمات المرور
- **ExcelJS** - تصدير Excel
- **express-validator** - التحقق من البيانات
- **helmet** + **cors** - الأمان

### Frontend
- **React 19** - مكتبة الواجهة
- **TypeScript** - لغة البرمجة
- **Vite** - أداة البناء
- **Tailwind CSS** - التنسيق
- **shadcn/ui** - مكونات UI
- **Recharts** - الرسوم البيانية
- **Wouter** - التوجيه
- **Axios** - طلبات API

### DevOps
- **Docker** - الحاويات
- **Docker Compose** - إدارة الخدمات
- **Railway** - الاستضافة
- **pnpm** - إدارة الحزم

## 📋 المتطلبات

- Node.js 20+
- MySQL 8.0+
- pnpm 10+
- Docker (اختياري)

## 🚀 التثبيت المحلي

### 1. استنساخ المشروع

```bash
git clone https://github.com/waleedqari2/Mada_R.git
cd Mada_R
```

### 2. تثبيت الحزم

```bash
pnpm install
```

### 3. إعداد قاعدة البيانات

#### أ. باستخدام MySQL محلي

1. أنشئ قاعدة بيانات جديدة:
```sql
CREATE DATABASE mada_requests CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. أنشئ ملف `.env` من `.env.example`:
```bash
cp .env.example .env
```

3. عدّل متغيرات قاعدة البيانات في `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mada_requests
JWT_SECRET=your-secret-key-here
```

4. قم بتشغيل سكريبت إعداد قاعدة البيانات:
```bash
pnpm run db:setup
```

#### ب. باستخدام Docker Compose

```bash
docker-compose up -d
```

هذا سينشئ قاعدة البيانات والتطبيق تلقائياً.

### 4. تشغيل التطبيق

#### للتطوير
```bash
pnpm run dev
```

التطبيق سيعمل على: http://localhost:5173

#### للإنتاج
```bash
pnpm run build
pnpm start
```

## 🔑 حسابات تجريبية

بعد إعداد قاعدة البيانات، يمكنك استخدام هذه الحسابات:

| الدور | اسم المستخدم | كلمة المرور | البريد الإلكتروني |
|------|-------------|------------|-------------------|
| مدير | admin | admin123 | admin@mada.sa |
| مدير قسم | manager1 | admin123 | manager@mada.sa |
| موظف | user1 | admin123 | user@mada.sa |

## 📚 API Documentation

### Authentication

#### POST /api/auth/register
إنشاء حساب جديد

**Body:**
```json
{
  "username": "user",
  "email": "user@example.com",
  "password": "password",
  "full_name": "الاسم الكامل",
  "department": "القسم",
  "phone": "0500000000"
}
```

#### POST /api/auth/login
تسجيل الدخول

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "تم تسجيل الدخول بنجاح",
  "token": "jwt-token",
  "user": { ... }
}
```

#### GET /api/auth/profile
الحصول على معلومات المستخدم الحالي

**Headers:** `Authorization: Bearer {token}`

### Requests

#### GET /api/requests
الحصول على جميع الطلبات

**Query Parameters:**
- `page`: رقم الصفحة (default: 1)
- `limit`: عدد النتائج (default: 20)
- `status`: الحالة (pending, approved, rejected, completed)
- `department`: القسم

#### POST /api/requests
إنشاء طلب جديد

**Body:**
```json
{
  "request_number": "REQ-001",
  "department": "المالية",
  "beneficiary": "اسم المستفيد",
  "request_date": "2024-01-01",
  "description": "وصف الطلب",
  "items": [
    {
      "description": "عنصر 1",
      "quantity": 2,
      "unit_price": 100.50
    }
  ]
}
```

#### GET /api/requests/search
البحث في الطلبات

**Query Parameters:**
- `query`: نص البحث
- `page`, `limit`: للترقيم

#### GET /api/requests/filter
تصفية الطلبات

**Query Parameters:**
- `status`, `department`, `startDate`, `endDate`, `minAmount`, `maxAmount`

### Reports

#### GET /api/reports/summary
تقرير ملخص

#### GET /api/reports/monthly
تقرير شهري

**Query Parameters:**
- `year`: السنة
- `month`: الشهر

#### GET /api/reports/export/excel
تصدير Excel

#### GET /api/reports/export/csv
تصدير CSV

### Audit Logs

#### GET /api/audit-logs
الحصول على سجل التدقيق (للمدراء فقط)

### Notifications

#### GET /api/notifications
الحصول على الإشعارات

#### PATCH /api/notifications/:id/read
تحديد إشعار كمقروء

## 🚢 النشر على Railway

راجع [DEPLOYMENT.md](./DEPLOYMENT.md) للحصول على دليل كامل لنشر التطبيق على Railway.

### خطوات سريعة:

1. أنشئ حساب على [Railway.app](https://railway.app)
2. أنشئ مشروع جديد
3. أضف خدمة MySQL
4. أضف خدمة Web من GitHub repo
5. أضف المتغيرات البيئية:
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   JWT_SECRET=your-random-secret
   NODE_ENV=production
   ```
6. انتظر حتى يكتمل النشر

## 📁 هيكل المشروع

```
Mada_R/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/    # مكونات UI
│   │   ├── contexts/      # React Contexts
│   │   ├── pages/         # الصفحات
│   │   ├── services/      # API Services
│   │   ├── types/         # TypeScript Types
│   │   └── lib/           # المساعدات
│   └── index.html
├── server/                # Backend (Express)
│   ├── config/           # الإعدادات
│   ├── database/         # مخططات قاعدة البيانات
│   ├── middleware/       # Express Middleware
│   ├── routes/           # API Routes
│   ├── utils/            # مساعدات
│   ├── controllers/      # Controllers
│   └── index.ts          # نقطة البداية
├── .env.example          # مثال متغيرات البيئة
├── Dockerfile           # ملف Docker
├── docker-compose.yml   # Docker Compose
└── package.json         # الحزم والسكريبتات
```

## 🔒 الأمان

- جميع كلمات المرور مشفرة باستخدام bcrypt
- JWT tokens للمصادقة
- Prepared Statements لمنع SQL Injection
- Input validation على جميع endpoints
- Rate limiting للحماية من الهجمات
- CORS configuration
- Helmet.js للأمان الإضافي
- سجل تدقيق كامل لجميع العمليات

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

MIT License - راجع ملف [LICENSE](LICENSE) للتفاصيل

## 📞 التواصل

للأسئلة والدعم، يرجى فتح issue على GitHub.

---

صنع بـ ❤️ في السعودية