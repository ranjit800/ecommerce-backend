# 📦 Order Management API Testing Guide

Base URL: `http://localhost:5000/api/orders`

**Note:** All order endpoints require authentication!

---

## **ORDER WORKFLOW**

```
Customer: Browse → Add to Cart → Place Order
Vendor: Receive Order → Confirm → Ship → Mark Delivered
Customer: Track Order → Receive Product
```

---

## **ORDER ENDPOINTS**

### 1. Create Order (from Cart)

**POST** `/orders`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Body:**
```json
{
  "shippingAddress": {
    "fullName": "Raj Sharma",
    "phone": "+919876543210",
    "street": "123 MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "paymentMethod": "CASH_ON_DELIVERY",
  "customerNotes": "Please deliver between 10 AM - 5 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 order(s) created successfully",
  "orders": [
    {
      "_id": "order-uuid-1",
      "orderNumber": "ORD-20241201-45678",
      "customer": "customer-uuid",
      "vendor": "vendor-1-uuid",
      "items": [
        {
          "product": "product-uuid",
          "name": "iPhone 15 Pro",
          "quantity": 1,
          "price": 134900,
          "currency": "INR"
        }
      ],
      "subtotal": 134900,
      "shippingFee": 0,
      "tax": 0,
      "total": 134900,
      "commissionRate": 15,
      "commissionAmount": 20235,
      "vendorEarnings": 114665,
      "orderStatus": "PENDING",
      "paymentStatus": "PENDING"
    }
  ]
}
```

**Auto-Features:**
- ✅ Creates separate order for each vendor (multi-vendor splitting)
- ✅ Generates unique order number (ORD-YYYYMMDD-XXXXX)
- ✅ Reduces product stock automatically
- ✅ Updates vendor stats (totalSales, totalOrders, totalEarnings)
- ✅ Calculates platform commission
- ✅ Clears cart after order
- ✅ Validates stock before order creation

---

### 2. Get Customer's Orders

**GET** `/orders/my-orders?status=PENDING&page=1&limit=10`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Query Parameters:**
- `status` (optional): PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order-uuid",
      "orderNumber": "ORD-20241201-45678",
      "vendor": {
        "_id": "vendor-uuid",
        "shopName": "Sharma Electronics"
      },
      "items": [...],
      "total": 134900,
      "orderStatus": "PENDING",
      "createdAt": "2024-12-01T00:00:00.000Z"
    }
  ],
  "total": 5,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### 3. Get Vendor's Orders

**GET** `/orders/vendor/orders?status=CONFIRMED&page=1`

**Headers:**
```
Authorization: Bearer VENDOR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order-uuid",
      "orderNumber": "ORD-20241201-45678",
      "customer": {
        "firstName": "Raj",
        "lastName": "Sharma",
        "email": "raj@example.com",
        "mobile": "+919876543210"
      },
      "items": [...],
      "total": 134900,
      "vendorEarnings": 114665,
      "commissionAmount": 20235,
      "orderStatus": "CONFIRMED",
      "shippingAddress": {...}
    }
  ]
}
```

---

### 4. Get Order Details

**GET** `/orders/:orderId`

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "order-uuid",
    "orderNumber": "ORD-20241201-45678",
    "customer": {...},
    "vendor": {...},
    "items": [...],
    "total": 134900,
    "commissionRate": 15,
    "commissionAmount": 20235,
    "vendorEarnings": 114665,
    "shippingAddress": {...},
    "orderStatus": "SHIPPED",
    "trackingNumber": "TRACK123456",
    "shippedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Authorization:**
- ✅ Customer can view their own orders
- ✅ Vendor can view orders from their shop
- ✅ SuperAdmin can view all orders

---

### 5. Update Order Status (Vendor)

**PUT** `/orders/:orderId/status`

**Headers:**
```
Authorization: Bearer VENDOR_TOKEN
```

**Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456789",
  "vendorNotes": "Shipped via FedEx"
}
```

**Valid Statuses:**
- `CONFIRMED` - Vendor confirmed the order
- `PROCESSING` - Order is being prepared
- `SHIPPED` - Order shipped (auto-sets shippedAt timestamp)
- `DELIVERED` - Order delivered (auto-sets deliveredAt + marks payment as PAID for COD)

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "orderStatus": "SHIPPED",
    "trackingNumber": "TRACK123456789",
    "shippedAt": "2024-12-01T10:00:00.000Z"
  }
}
```

**Auto-Features:**
- ✅ Sets `shippedAt` when status = SHIPPED
- ✅ Sets `deliveredAt` when status = DELIVERED
- ✅ Auto-marks payment as PAID when DELIVERED (for COD)

---

### 6. Cancel Order

**PUT** `/orders/:orderId/cancel`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN or VENDOR_TOKEN
```

**Body:**
```json
{
  "reason": "Customer changed mind"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order": {
    "orderStatus": "CANCELLED",
    "cancelledAt": "2024-12-01T12:00:00.000Z",
    "cancellationReason": "Customer changed mind"
  }
}
```

**Rules:**
- ✅ Can only cancel if status is PENDING or CONFIRMED
- ✅ Restores product stock automatically
- ✅ Updates vendor stats (reverses totalSales, totalOrders, totalEarnings)
- ✅ Both customer and vendor can cancel

---

### 7. Get All Orders (SuperAdmin)

**GET** `/orders/all?status=PENDING&page=1&limit=20`

**Headers:**
```
Authorization: Bearer SUPERADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "customer": { "firstName": "Raj", "email": "raj@example.com" },
      "vendor": { "shopName": "Sharma Electronics" },
      "total": 134900,
      "commissionAmount": 20235,
      "orderStatus": "PENDING"
    }
  ],
  "total": 50,
  "totalPages": 3
}
```

---

## **COMPLETE TESTING FLOW**

### **Step 1: Add Products to Cart**
```
POST /cart/add
Body: { "productId": "product-1", "quantity": 2 }

POST /cart/add
Body: { "productId": "product-2", "quantity": 1 }
```

### **Step 2: View Grouped Cart**
```
GET /cart/grouped
→ See items grouped by vendor
```

### **Step 3: Place Order**
```
POST /orders
Body: { "shippingAddress": {...}, "paymentMethod": "CASH_ON_DELIVERY" }
→ Cart automatically cleared
→ 2 separate orders created (if 2 vendors)
```

### **Step 4: Customer Views Orders**
```
GET /orders/my-orders
→ See all your orders
```

### **Step 5: Vendor Views Orders**
```
GET /orders/vendor/orders
→ See orders received
```

### **Step 6: Vendor Confirms & Ships**
```
PUT /orders/ORDER_ID/status
Body: { "status": "CONFIRMED" }

PUT /orders/ORDER_ID/status
Body: { "status": "SHIPPED", "trackingNumber": "TRACK123" }
```

### **Step 7: Vendor Marks as Delivered**
```
PUT /orders/ORDER_ID/status
Body: { "status": "DELIVERED" }
→ Auto-marks payment as PAID
```

---

## **ORDER STATUS WORKFLOW**

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
         ↓
      CANCELLED (only from PENDING/CONFIRMED)
```

---

## **PAYMENT STATUS**

- `PENDING` - Waiting for payment
- `PAID` - Payment received
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

**Auto-Features:**
- ✅ COD orders marked PAID when DELIVERED
- ✅ Online payments marked PAID immediately (future feature)

---

## **MULTI-VENDOR ORDER SPLITTING**

**Cart with 3 products from 2 vendors:**
```
Cart:
- Product A (Vendor 1) - ₹1000
- Product B (Vendor 1) - ₹500
- Product C (Vendor 2) - $50
```

**Result: 2 separate orders**
```
Order 1 (Vendor 1):
- Total: ₹1500 (INR)
- Commission (15%): ₹225
- Vendor Earnings: ₹1275

Order 2 (Vendor 2):
- Total: $50 (USD)
- Commission (15%): $7.5
- Vendor Earnings: $42.5
```

---

## **ERROR HANDLING**

### **Empty Cart:**
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

### **Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for 'iPhone 15 Pro'. Only 5 available"
}
```

### **Product Not Available:**
```json
{
  "success": false,
  "message": "Product 'Samsung S24' is no longer available"
}
```

### **Cannot Cancel:**
```json
{
  "success": false,
  "message": "Cannot cancel order in this status"
}
```

---

## **KEY FEATURES:**

✅ **Multi-Vendor Order Splitting** - Separate orders per vendor  
✅ **Auto Stock Management** - Reduces stock on order, restores on cancel  
✅ **Commission Tracking** - Auto-calculates platform & vendor earnings  
✅ **Vendor Stats Update** - Auto-updates totalSales, totalOrders, totalEarnings  
✅ **Order Number Generation** - Unique ORD-YYYYMMDD-XXXXX  
✅ **Status Workflow** - Complete order lifecycle tracking  
✅ **Auto-Timestamps** - shippedAt, deliveredAt, cancelledAt  
✅ **Payment Tracking** - Supports multiple payment methods  
✅ **Multi-Currency** - Separate orders for INR/USD  

---

**Your order system is production-ready!** 📦🚀

**Backend is now FULLY FUNCTIONAL!** 🎉
