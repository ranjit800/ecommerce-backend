# 🌍 Multi-Country Support - API Guide

Your platform now supports **India** and **USA** with country-specific configurations!

---

## **Country Configuration:**

| Feature | India 🇮🇳 | USA 🇺🇸 |
|---------|----------|----------|
| **Currency** | INR (₹) | USD ($) |
| **Tax Field** | GST Number | Tax ID / EIN |
| **Tax Format** | 15 digits (e.g., 22AAAAA0000A1Z5) | XX-XXXXXXX |
| **Bank Fields** | IFSC Code | Routing Number |
| **Payment Gateway** | Razorpay | Stripe / Razorpay International |

---

## **Updated Vendor Application API:**

### **For India 🇮🇳:**

**POST** `/api/vendor/apply`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "shopName": "Tech Store India",
  "shopDescription": "Best electronics in India",
  "businessEmail": "contact@techstore.in",
  "businessPhone": "+919876543210",
  "businessAddress": {
    "street": "123 MG Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "gstNumber": "27AABCU9603R1ZX"
}
```

**Response:**
```json
{
  "success": true,
  "vendor": {
    "_id": "vendor-uuid",
    "shopName": "Tech Store India",
    "currency": "INR",
    "gstNumber": "27AABCU9603R1ZX",
    "approvalStatus": "PENDING"
  }
}
```

---

### **For USA 🇺🇸:**

**POST** `/api/vendor/apply`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body** (JSON):
```json
{
  "shopName": "Tech Store USA",
  "shopDescription": "Best electronics in USA",
  "businessEmail": "contact@techstore.com",
  "businessPhone": "+12125551234",
  "businessAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "New York",
    "zipCode": "10001",
    "country": "USA"
  },
  "taxId": "12-3456789"
}
```

**Response:**
```json
{
  "success": true,
  "vendor": {
    "_id": "vendor-uuid",
    "shopName": "Tech Store USA",
    "currency": "USD",
    "taxId": "12-3456789",
    "approvalStatus": "PENDING"
  }
}
```

---

## **Updated Vendor Profile Update:**

### **India - Add Bank Details:**

**PUT** `/api/vendor/profile`

**Body:**
```json
{
  "bankDetails": {
    "accountHolderName": "Tech Store India Pvt Ltd",
    "accountNumber": "1234567890",
    "bankName": "HDFC Bank",
    "branchName": "Mumbai Main Branch",
    "ifscCode": "HDFC0001234",
    "swiftCode": "HDFCINBB"
  }
}
```

### **USA - Add Bank Details:**

**PUT** `/api/vendor/profile`

**Body:**
```json
{
  "bankDetails": {
    "accountHolderName": "Tech Store USA Inc",
    "accountNumber": "9876543210",
    "bankName": "Chase Bank",
    "routingNumber": "021000021",
    "swiftCode": "CHASUS33"
  }
}
```

---

## **How It Works:**

### **1. Country Detection:**
```javascript
// Based on businessAddress.country
if (country === 'India') {
  currency = 'INR'
  taxField = 'gstNumber'
  bankField = 'ifscCode'
}
if (country === 'USA') {
  currency = 'USD'
  taxField = 'taxId'
  bankField = 'routingNumber'
}
```

### **2. Frontend Implementation (Coming Soon):**

When building the frontend form:

```jsx
// Pseudo-code for frontend
{country === 'India' && (
  <input name="gstNumber" placeholder="GST Number" />
  <input name="ifscCode" placeholder="IFSC Code" />
)}

{country === 'USA' && (
  <input name="taxId" placeholder="Tax ID / EIN" />
  <input name="routingNumber" placeholder="Routing Number" />
)}
```

### **3. Product Pricing (Next Step):**

When we build Product model:
- Vendor sets price in their currency (INR or USD)
- Store both `price` and `currency` fields
- Frontend displays correct currency symbol

---

## **Benefits:**

✅ **Vendors get country-specific forms**  
✅ **Automatic currency assignment**  
✅ **Correct tax field validation**  
✅ **Country-specific bank requirements**  
✅ **Future: Multi-currency checkout**

---

## **Next Steps:**

When building Products:
- Each product will have `price` and `currency`
- Indian vendors → prices in INR
- USA vendors → prices in USD
- Customers see prices in vendor's currency

**Your multi-country marketplace is ready!** 🌍🚀
