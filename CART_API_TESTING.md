# 🛒 Shopping Cart API Testing Guide

Base URL: `http://localhost:5000/api/cart`

**Note:** All cart endpoints require authentication!

---

## **CART ENDPOINTS**

### 1. Get Cart

**GET** `/cart`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "_id": "cart-uuid",
    "user": "user-uuid",
    "items": [
      {
        "product": {
          "_id": "product-uuid",
          "name": "iPhone 15 Pro",
          "price": 134900,
          "currency": "INR",
          "stock": 50
        },
        "vendor": {
          "_id": "vendor-uuid",
          "shopName": "Sharma Electronics"
        },
        "quantity": 2,
        "price": 134900,
        "currency": "INR"
      }
    ],
    "totalItems": 2,
    "subt otals": {
      "INR": 269800,
      "USD": 0
    }
  }
}
```

---

### 2. Add to Cart

**POST** `/cart/add`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Body:**
```json
{
  "productId": "06b8c23a-28db-43f9-ad24-cf00cdeabb5b",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": { ... }
}
```

**Auto-Features:**
- ✅ Creates cart if doesn't exist
- ✅ Updates quantity if product already in cart
- ✅ Validates stock availability
- ✅ Checks product status (ACTIVE only)
- ✅ Auto-calculates totals by currency

---

### 3. Update Cart Item

**PUT** `/cart/update/:productId`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated",
  "cart": { ... }
}
```

**Validations:**
- ✅ Checks stock before update
- ✅ Updates price if product price changed
- ✅ Minimum quantity: 1

---

### 4. Remove from Cart

**DELETE** `/cart/remove/:productId`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "cart": { ... }
}
```

---

### 5. Clear Cart

**DELETE** `/cart/clear`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared",
  "cart": {
    "items": [],
    "totalItems": 0,
    "subtotals": { "INR": 0, "USD": 0 }
  }
}
```

---

### 6. Get Cart Grouped by Vendor (For Checkout)

**GET** `/cart/grouped`

**Headers:**
```
Authorization: Bearer CUSTOMER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "_id": "cart-uuid",
    "totalItems": 5,
    "subtotals": {
      "INR": 269800,
      "USD": 0
    },
    "vendorGroups": [
      {
        "vendor": {
          "_id": "vendor-uuid",
          "shopName": "Sharma Electronics",
          "currency": "INR",
          "commissionRate": 15
        },
        "items": [
          {
            "product": { ... },
            "quantity": 2,
            "price": 134900
          }
        ],
        "subtotal": 269800,
        "currency": "INR",
        "itemCount": 2
      }
    ]
  }
}
```

**Use Case:** This endpoint is perfect for checkout! It:
- ✅ Groups products by vendor (for multi-vendor order splitting)
- ✅ Calculates subtotal per vendor
- ✅ Shows vendor commission rate
- ✅ Ready for payment processing

---

## **Complete Testing Flow**

### **Step 1: Register & Login**
```
POST /api/auth/register
POST /api/auth/login
→ Get CUSTOMER_TOKEN
```

### **Step 2: Add Products to Cart**
```
POST /cart/add
Body: { "productId": "product-1-uuid", "quantity": 2 }

POST /cart/add
Body: { "productId": "product-2-uuid", "quantity": 1 }
```

### **Step 3: View Cart**
```
GET /cart
→ See all items with totals
```

### **Step 4: Update Quantity**
```
PUT /cart/update/product-1-uuid
Body: { "quantity": 3 }
```

### **Step 5: View Grouped Cart (Checkout Preview)**
```
GET /cart/grouped
→ See items grouped by vendor
```

### **Step 6: Remove Item**
```
DELETE /cart/remove/product-2-uuid
```

### **Step 7: Clear Cart (Optional)**
```
DELETE /cart/clear
```

---

## **Multi-Currency Example**

### **Scenario:** Customer adds products from India & USA vendors

**Add Product from India Vendor:**
```json
POST /cart/add
{
  "productId": "india-product-uuid",
  "quantity": 1
}
```

**Add Product from USA Vendor:**
```json
POST /cart/add
{
  "productId": "usa-product-uuid",
  "quantity": 2
}
```

**Cart Response:**
```json
{
  "subtotals": {
    "INR": 134900,  // ₹1,34,900 from Indian vendor
    "USD": 1798     // $1,798 from USA vendor
  },
  "totalItems": 3
}
```

**Grouped Cart:**
```json
{
  "vendorGroups": [
    {
      "vendor": { "shopName": "Sharma Electronics" },
      "subtotal": 134900,
      "currency": "INR"
    },
    {
      "vendor": { "shopName": "Tech Store USA" },
      "subtotal": 1798,
      "currency": "USD"
    }
  ]
}
```

---

## **Error Handling**

### **Product Out of Stock:**
```json
{
  "success": false,
  "message": "Only 5 items available in stock"
}
```

### **Product Not Active:**
```json
{
  "success": false,
  "message": "Product is not available"
}
```

### **Item Not in Cart:**
```json
{
  "success": false,
  "message": "Item not found in cart"
}
```

---

## **Key Features:**

✅ **Auto-Create Cart** - Cart created automatically on first add  
✅ **Stock Validation** - Can't add more than available  
✅ **Duplicate Handling** - Updates quantity if product exists  
✅ **Multi-Currency** - Separate totals for INR and USD  
✅ **Multi-Vendor** - Groups items by vendor for checkout  
✅ **Price Updates** - Updates price when editing (in case price changed)  
✅ **Auto Calculations** - Totals calculated automatically  

---

**Your cart system is ready!** 🛒🚀

**Next:** Order Management (Day 5)
