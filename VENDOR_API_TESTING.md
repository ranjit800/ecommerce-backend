# Vendor & SuperAdmin API Testing Guide

Base URL: `http://localhost:5000/api`

---

## **VENDOR ENDPOINTS**

### 1. Apply as Vendor

**POST** `/vendor/apply`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "shopName": "Tech Store",
  "shopDescription": "Best electronics and gadgets in town",
  "businessEmail": "contact@techstore.com",
  "businessPhone": "+1234567890",
  "businessAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "taxId": "GST1234567890"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Vendor application submitted successfully. Awaiting approval.",
  "vendor": {
    "_id": "vendor-uuid",
    "shopName": "Tech Store",
    "approvalStatus": "PENDING",
    "shopUrl": "/shop/tech-store"
  }
}
```

---

### 2. Get Vendor Profile

**GET** `/vendor/profile`

**Headers:**
```
Authorization: Bearer VENDOR_JWT_TOKEN
```

**Response** (200):
```json
{
  "success": true,
  "vendor": {
    "_id": "vendor-uuid",
    "shopName": "Tech Store",
    "approvalStatus": "APPROVED",
    "totalSales": 0,
    "totalEarnings": 0,
    "commissionRate": 15
  },
  "shop": {
    "_id": "shop-uuid",
    "slug": "tech-store",
    "totalViews": 0,
    "totalFollowers": 0
  }
}
```

---

### 3. Update Vendor Profile

**PUT** `/vendor/profile`

**Headers:**
```
Authorization: Bearer VENDOR_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "shopDescription": "Updated description",
  "businessPhone": "+9876543210",
  "bankDetails": {
    "accountHolderName": "Tech Store Inc",
    "accountNumber": "1234567890",
    "bankName": "ABC Bank",
    "ifscCode": "ABCD0123456"
  }
}
```

---

### 4. Get Vendor Stats

**GET** `/vendor/stats`

**Headers:**
```
Authorization: Bearer VENDOR_JWT_TOKEN
```

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "totalSales": 5000,
    "totalEarnings": 4250,
    "totalOrders": 25,
    "rating": 4.5,
    "totalReviews": 10,
    "commissionRate": 15,
    "approvalStatus": "APPROVED"
  }
}
```

---

### 5. Update Shop Settings

**PUT** `/vendor/shop`

**Headers:**
```
Authorization: Bearer VENDOR_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "socialMedia": {
    "facebook": "https://facebook.com/techstore",
    "instagram": "@techstore",
    "website": "https://techstore.com"
  },
  "policies": {
    "returnPolicy": "30 days return policy",
    "shippingPolicy": "Free shipping above $50"
  },
  "operatingHours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" }
  }
}
```

---

## **SUPERADMIN ENDPOINTS**

### 1. Get All Vendors

**GET** `/superadmin/vendors?status=PENDING&page=1&limit=10`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Query Parameters:**
- `status` (optional): PENDING, APPROVED, REJECTED, SUSPENDED
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response** (200):
```json
{
  "success": true,
  "vendors": [
    {
      "_id": "vendor-uuid",
      "shopName": "Tech Store",
      "approvalStatus": "PENDING",
      "user": {
        "email": "vendor@example.com",
        "firstName": "John"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 1
}
```

---

### 2. Get Vendor by ID

**GET** `/superadmin/vendors/:vendorId`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Response** (200):
```json
{
  "success": true,
  "vendor": {
    "_id": "vendor-uuid",
    "shopName": "Tech Store",
    "shopDescription": "Best electronics",
    "approvalStatus": "PENDING",
    "commissionRate": 15,
    "user": {
      "email": "vendor@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### 3. Approve Vendor

**PUT** `/superadmin/vendors/:vendorId/approve`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Response** (200):
```json
{
  "success": true,
  "message": "Vendor approved successfully",
  "vendor": {
    "_id": "vendor-uuid",
    "approvalStatus": "APPROVED",
    "approvedBy": "superadmin-uuid",
    "approvedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 4. Reject Vendor

**PUT** `/superadmin/vendors/:vendorId/reject`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "reason": "Incomplete business documentation"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Vendor application rejected",
  "vendor": {
    "_id": "vendor-uuid",
    "approvalStatus": "REJECTED",
    "rejectionReason": "Incomplete business documentation"
  }
}
```

---

### 5. Suspend Vendor

**PUT** `/superadmin/vendors/:vendorId/suspend`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "reason": "Violating platform policies"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Vendor suspended successfully"
}
```

---

### 6. Update Vendor Commission

**PUT** `/superadmin/vendors/:vendorId/commission`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "commissionRate": 12
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Commission rate updated successfully",
  "vendor": {
    "_id": "vendor-uuid",
    "commissionRate": 12
  }
}
```

---

### 7. Get Platform Stats

**GET** `/superadmin/stats`

**Headers:**
```
Authorization: Bearer SUPERADMIN_JWT_TOKEN
```

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "vendors": {
      "total": 10,
      "pending": 3,
      "approved": 5,
      "rejected": 1,
      "suspended": 1
    },
    "users": {
      "total": 50,
      "customers": 40,
      "vendors": 10
    },
    "sales": {
      "totalPlatformSales": 50000,
      "totalPlatformCommission": 7500
    }
  }
}
```

---

## **Testing Flow in Postman**

### **Complete Vendor Approval Flow:**

1. **Register as Customer** → `POST /api/auth/register`
2. **Login** → `POST /api/auth/login` → Save token
3. **Apply as Vendor** → `POST /api/vendor/apply`
4. **Login as SuperAdmin** → Use `admin@multivendor.com` / `Admin@123`
5. **View Pending Vendors** → `GET /api/superadmin/vendors?status=PENDING`
6. **Approve Vendor** → `PUT /api/superadmin/vendors/:vendorId/approve`
7. **Login as Vendor again** → `POST /api/auth/login`
8. **Check Vendor Profile** → `GET /api/vendor/profile` → Should show APPROVED!

---

## **Quick Test Commands**

Save these as Postman collection variables:
- `BASE_URL` = `http://localhost:5000/api`
- `CUSTOMER_TOKEN` = (from customer login)
- `VENDOR_TOKEN` = (from vendor login)
- `ADMIN_TOKEN` = (from superadmin login)
- `VENDOR_ID` = (from vendor application response)

Use `{{ADMIN_TOKEN}}` in Authorization headers!
