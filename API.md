# 📚 API Documentation

توثيق شامل لجميع endpoints في نظام إدارة طلبات الصرف.

## 🔗 Base URL

```
Production: https://your-app.up.railway.app/api
Development: http://localhost:3000/api
```

## 🔐 المصادقة

معظم endpoints تتطلب JWT token في الـ header:

```
Authorization: Bearer {your-jwt-token}
```

للحصول على token، استخدم endpoint تسجيل الدخول.

## 📝 Response Format

### نجاح
```json
{
  "data": {...},
  "message": "رسالة نجاح"
}
```

### خطأ
```json
{
  "error": "رسالة الخطأ",
  "details": ["تفاصيل إضافية"]
}
```

---

## 🔑 Authentication Endpoints

### 1. تسجيل الدخول

**POST** `/auth/login`

تسجيل الدخول والحصول على JWT token.

**Request Body:**
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mada.sa",
    "full_name": "مدير النظام",
    "role": "admin",
    "department": "الإدارة العامة"
  }
}
```

**Status Codes:**
- 200: نجاح
- 401: اسم مستخدم أو كلمة مرور خاطئة
- 400: بيانات غير صحيحة

---

### 2. إنشاء حساب جديد

**POST** `/auth/register`

إنشاء حساب مستخدم جديد.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "full_name": "أحمد محمد",
  "department": "المالية",
  "phone": "0500000000"
}
```

**Response:**
```json
{
  "message": "تم إنشاء الحساب بنجاح",
  "user": {
    "id": 5,
    "username": "newuser",
    "email": "user@example.com",
    "full_name": "أحمد محمد",
    "department": "المالية"
  }
}
```

**Validation Rules:**
- `username`: 3-50 حرف، فريد
- `email`: بريد إلكتروني صحيح، فريد
- `password`: 6 أحرف على الأقل
- `full_name`: 2-100 حرف

---

### 3. الحصول على الملف الشخصي

**GET** `/auth/profile`

الحصول على معلومات المستخدم الحالي.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mada.sa",
    "full_name": "مدير النظام",
    "role": "admin",
    "department": "الإدارة العامة",
    "phone": "0500000000",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 4. تحديث الملف الشخصي

**PUT** `/auth/profile`

تحديث معلومات المستخدم.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "full_name": "اسم جديد",
  "email": "newemail@example.com",
  "department": "قسم جديد",
  "phone": "0511111111"
}
```

**Response:**
```json
{
  "message": "تم تحديث الملف الشخصي بنجاح"
}
```

---

### 5. تسجيل الخروج

**POST** `/auth/logout`

تسجيل الخروج (يسجل في audit log).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## 📄 Requests Endpoints

### 1. الحصول على جميع الطلبات

**GET** `/requests`

الحصول على قائمة الطلبات مع pagination.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (number): رقم الصفحة (default: 1)
- `limit` (number): عدد النتائج (default: 20, max: 100)
- `status` (string): الحالة (pending, approved, rejected, completed)
- `department` (string): القسم
- `userId` (number): معرّف المستخدم (للمدراء فقط)

**Example:**
```
GET /requests?page=1&limit=20&status=pending
```

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "request_number": "REQ-001",
      "user_id": 2,
      "department": "المالية",
      "beneficiary": "أحمد محمد",
      "request_date": "2024-01-15",
      "description": "طلب صرف مكافآت",
      "total_amount": 5000.00,
      "status": "pending",
      "creator_name": "محمد علي",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Permissions:**
- **user**: يرى طلباته فقط
- **manager**: يرى طلبات قسمه
- **admin**: يرى جميع الطلبات

---

### 2. الحصول على طلب واحد

**GET** `/requests/:id`

الحصول على تفاصيل طلب محدد مع عناصره.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "request": {
    "id": 1,
    "request_number": "REQ-001",
    "department": "المالية",
    "beneficiary": "أحمد محمد",
    "request_date": "2024-01-15",
    "total_amount": 5000.00,
    "status": "pending",
    "creator_name": "محمد علي"
  },
  "items": [
    {
      "id": 1,
      "item_number": 1,
      "description": "مكافأة شهر يناير",
      "quantity": 1,
      "unit_price": 3000.00,
      "total_price": 3000.00
    },
    {
      "id": 2,
      "item_number": 2,
      "description": "بدل انتقال",
      "quantity": 2,
      "unit_price": 1000.00,
      "total_price": 2000.00
    }
  ]
}
```

---

### 3. إنشاء طلب جديد

**POST** `/requests`

إنشاء طلب صرف جديد.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "request_number": "REQ-002",
  "department": "المالية",
  "beneficiary": "أحمد محمد",
  "request_date": "2024-01-16",
  "description": "طلب صرف مستحقات",
  "notes": "ملاحظات إضافية",
  "items": [
    {
      "description": "مستحقات شهر يناير",
      "quantity": 1,
      "unit_price": 5000.00,
      "notes": "ملاحظة على العنصر"
    },
    {
      "description": "بدل سكن",
      "quantity": 1,
      "unit_price": 2000.00
    }
  ]
}
```

**Response:**
```json
{
  "message": "تم إنشاء الطلب بنجاح",
  "requestId": 5
}
```

**Validation:**
- `request_number`: مطلوب، فريد
- `department`: مطلوب
- `beneficiary`: مطلوب
- `request_date`: تاريخ صحيح
- `items`: مصفوفة بعنصر واحد على الأقل
- كل عنصر يجب أن يحتوي على `description`, `quantity`, `unit_price`

---

### 4. تحديث طلب

**PUT** `/requests/:id`

تحديث طلب موجود (فقط الطلبات pending).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "department": "قسم جديد",
  "beneficiary": "اسم جديد",
  "notes": "ملاحظات محدثة",
  "items": [
    {
      "description": "عنصر محدث",
      "quantity": 2,
      "unit_price": 1500.00
    }
  ]
}
```

**Response:**
```json
{
  "message": "تم تحديث الطلب بنجاح"
}
```

**Permissions:**
- المستخدم يمكنه تحديث طلباته فقط
- فقط الطلبات بحالة `pending` يمكن تحديثها

---

### 5. حذف طلب

**DELETE** `/requests/:id`

حذف طلب (فقط الطلبات pending أو admin).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "تم حذف الطلب بنجاح"
}
```

---

### 6. تحديث حالة الطلب

**PATCH** `/requests/:id/status`

الموافقة أو رفض أو إكمال طلب (للمدراء فقط).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "status": "approved",
  "notes": "تمت الموافقة، يرجى الصرف"
}
```

**Allowed Status Values:**
- `approved`: موافق عليه
- `rejected`: مرفوض
- `completed`: مكتمل

**Response:**
```json
{
  "message": "تم تحديث حالة الطلب بنجاح"
}
```

**Permissions:**
- **manager**: يمكنه تحديث طلبات قسمه فقط
- **admin**: يمكنه تحديث أي طلب

**Note:** عند تغيير الحالة، يتم إرسال إشعار للمستخدم صاحب الطلب.

---

## 🔍 Search & Filter Endpoints

### 1. البحث في الطلبات

**GET** `/requests/search`

البحث في الطلبات بنص مفتوح.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `query` (string, required): نص البحث
- `page` (number): رقم الصفحة
- `limit` (number): عدد النتائج

**Example:**
```
GET /requests/search?query=أحمد&page=1&limit=20
```

**Response:**
```json
{
  "requests": [...],
  "searchQuery": "أحمد",
  "pagination": {...}
}
```

**Note:** يبحث في: request_number, beneficiary, description, notes, department

---

### 2. تصفية الطلبات

**GET** `/requests/filter`

تصفية متقدمة للطلبات.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (string): الحالة
- `department` (string): القسم
- `startDate` (date): من تاريخ (YYYY-MM-DD)
- `endDate` (date): إلى تاريخ
- `minAmount` (number): الحد الأدنى للمبلغ
- `maxAmount` (number): الحد الأقصى للمبلغ
- `userId` (number): المستخدم (للمدراء)
- `page` (number): الصفحة
- `limit` (number): عدد النتائج

**Example:**
```
GET /requests/filter?status=approved&startDate=2024-01-01&endDate=2024-01-31&minAmount=1000
```

**Response:**
```json
{
  "requests": [...],
  "filters": {
    "status": "approved",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "minAmount": 1000
  },
  "pagination": {...}
}
```

---

## 📊 Reports Endpoints

### 1. تقرير ملخص

**GET** `/reports/summary`

الحصول على إحصائيات شاملة.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "statusStats": [
    {
      "status": "pending",
      "count": 15,
      "total_amount": 50000.00
    },
    {
      "status": "approved",
      "count": 45,
      "total_amount": 250000.00
    }
  ],
  "totalStats": {
    "total_requests": 100,
    "total_amount": 500000.00,
    "avg_amount": 5000.00,
    "max_amount": 50000.00,
    "min_amount": 100.00
  },
  "departmentStats": [
    {
      "department": "المالية",
      "count": 30,
      "total_amount": 150000.00
    }
  ],
  "recentActivity": [
    {
      "date": "2024-01-15",
      "count": 5,
      "total_amount": 25000.00
    }
  ]
}
```

---

### 2. تقرير شهري

**GET** `/reports/monthly`

تقرير حسب الشهر والسنة.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `year` (number): السنة (default: current year)
- `month` (number): الشهر (1-12, optional)

**Example:**
```
GET /reports/monthly?year=2024&month=1
```

**Response:**
```json
{
  "year": 2024,
  "month": 1,
  "monthlyStats": [
    {
      "year": 2024,
      "month": 1,
      "count": 25,
      "total_amount": 125000.00,
      "avg_amount": 5000.00
    }
  ],
  "statusBreakdown": [...]
}
```

---

### 3. تقرير حسب القسم

**GET** `/reports/by-department`

إحصائيات تفصيلية حسب الأقسام (للمدراء).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `department` (string): قسم محدد
- `startDate` (date): من تاريخ
- `endDate` (date): إلى تاريخ

**Response:**
```json
{
  "department": "المالية",
  "departmentStats": [
    {
      "department": "المالية",
      "total_requests": 30,
      "total_amount": 150000.00,
      "avg_amount": 5000.00,
      "approved_count": 25,
      "rejected_count": 2,
      "pending_count": 3
    }
  ],
  "topUsers": [
    {
      "department": "المالية",
      "full_name": "أحمد محمد",
      "username": "ahmad",
      "request_count": 10,
      "total_amount": 50000.00
    }
  ]
}
```

---

### 4. تصدير Excel

**GET** `/reports/export/excel`

تصدير الطلبات إلى ملف Excel.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `startDate`, `endDate`, `status`, `department`

**Response:** Binary file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Example:**
```javascript
// Frontend example
const response = await fetch('/api/reports/export/excel?status=approved', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'requests.xlsx';
a.click();
```

---

### 5. تصدير CSV

**GET** `/reports/export/csv`

تصدير الطلبات إلى ملف CSV.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `startDate`, `endDate`, `status`, `department`

**Response:** CSV file (text/csv)

---

## 📋 Audit Logs Endpoints

### 1. الحصول على سجل التدقيق

**GET** `/audit-logs`

الحصول على سجل جميع العمليات (للمدراء فقط).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (number): الصفحة
- `limit` (number): عدد النتائج (default: 50)
- `userId` (number): تصفية حسب المستخدم
- `entityType` (string): نوع الكيان (User, Request)
- `action` (string): نوع العملية (CREATE, UPDATE, DELETE, LOGIN, etc.)
- `startDate` (date): من تاريخ
- `endDate` (date): إلى تاريخ

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "username": "admin",
      "full_name": "مدير النظام",
      "action": "CREATE",
      "entity_type": "Request",
      "entity_id": 5,
      "old_value": null,
      "new_value": "{\"request_number\":\"REQ-005\"}",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

**Actions:**
- `LOGIN`, `LOGOUT`, `REGISTER`
- `CREATE`, `UPDATE`, `DELETE`
- `STATUS_CHANGE`

---

## 🔔 Notifications Endpoints

### 1. الحصول على الإشعارات

**GET** `/notifications`

الحصول على إشعارات المستخدم.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (number): الصفحة
- `limit` (number): عدد النتائج (default: 20)
- `unreadOnly` (boolean): الإشعارات غير المقروءة فقط

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "تم الموافقة على الطلب",
      "message": "تم الموافقة على الطلب رقم REQ-001",
      "type": "success",
      "is_read": false,
      "related_entity_type": "Request",
      "related_entity_id": 1,
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {...}
}
```

---

### 2. تحديد إشعار كمقروء

**PATCH** `/notifications/:id/read`

تحديد إشعار محدد كمقروء.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "تم تحديث الإشعار"
}
```

---

### 3. تحديد جميع الإشعارات كمقروءة

**PATCH** `/notifications/read-all`

تحديد جميع إشعارات المستخدم كمقروءة.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "تم تحديث جميع الإشعارات"
}
```

---

### 4. حذف إشعار

**DELETE** `/notifications/:id`

حذف إشعار.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "تم حذف الإشعار"
}
```

---

## 🏥 Health Check

### الحصول على حالة النظام

**GET** `/health`

التحقق من أن الخادم يعمل.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## 📦 Rate Limiting

### حدود الطلبات

- **Auth endpoints**: 5 requests / 15 minutes
- **Other endpoints**: 100 requests / 15 minutes

عند تجاوز الحد:
```json
{
  "error": "تم تجاوز عدد الطلبات المسموح به، يرجى المحاولة لاحقاً"
}
```

---

## ❌ Error Codes

| Code | المعنى |
|------|--------|
| 200 | نجاح |
| 201 | تم الإنشاء بنجاح |
| 400 | خطأ في البيانات المرسلة |
| 401 | غير مصرح (token غير صحيح أو منتهي) |
| 403 | محظور (لا توجد صلاحية) |
| 404 | غير موجود |
| 429 | تجاوز عدد الطلبات |
| 500 | خطأ في الخادم |

---

## 💡 أمثلة استخدام

### مثال كامل: إنشاء طلب جديد

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});
const { token } = await loginResponse.json();

// 2. Create Request
const createResponse = await fetch('/api/requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    request_number: 'REQ-NEW-001',
    department: 'المالية',
    beneficiary: 'أحمد محمد',
    request_date: '2024-01-16',
    description: 'طلب صرف',
    items: [
      {
        description: 'مكافأة',
        quantity: 1,
        unit_price: 5000
      }
    ]
  })
});

const result = await createResponse.json();
console.log(result);
```

---

**للأسئلة والدعم، يرجى فتح issue على GitHub.**
