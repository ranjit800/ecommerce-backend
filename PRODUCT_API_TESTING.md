# 🛍️ Product & Category API Testing Guide

Base URL: `http://localhost:5000/api`

---

## **CATEGORY ENDPOINTS** (SuperAdmin Only for Create/Update/Delete)

### 1. Create Category

**POST** `/categories`

**Headers:**
```
Authorization: Bearer SUPERADMIN_TOKEN
```

**Body** (Main Category):
```json
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "sortOrder": 1
}
```

**Body** (Subcategory):
```json
{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "parent": "PARENT_CATEGORY_ID",
  "sortOrder": 1
}
```

---

### 2. Get All Categories (Public)

**GET** `/categories`

**Query Parameters:**
- `parent=null` - Get only top-level categories
- `parent=CATEGORY_ID` - Get subcategories
- `isActive=true` - Get only active categories

**Example:**
```
GET /categories?parent=null&isActive=true
```

---

### 3. Get Category by ID (Public)

**GET** `/categories/:id`

**Response:**
```json
{
  "success": true,
  "category": {
    "_id": "category-uuid",
    "name": "Electronics",
    "slug": "electronics"
  },
  "subcategories": [
    {
      "_id": "sub-uuid",
      "name": "Smartphones"
    }
  ]
}
```

---

## **PRODUCT ENDPOINTS**

### 1. Create Product (Vendor Only)

**POST** `/products`

**Headers:**
```
Authorization: Bearer VENDOR_TOKEN
```

**Body** (India Vendor - INR):
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with powerful A17 Pro chip and titanium design",
  "shortDescription": "Premium smartphone with Pro camera system",
  "category": "CATEGORY_ID",
  "price": 134900,
  "comparePrice": 149900,
  "stock": 50,
  "sku": "APPLE-IP15PRO-256",
  "images": [
    {
      "url": "https://example.com/iphone1.jpg",
      "alt": "iPhone 15 Pro Front",
      "isPrimary": true
    },
    {
      "url": "https://example.com/iphone2.jpg",
      "alt": "iPhone 15 Pro Back"
    }
  ],
  "specifications": {
    "Brand": "Apple",
    "Model": "iPhone 15 Pro",
    "Storage": "256GB",
    "RAM": "8GB",
    "Display": "6.1-inch Super Retina XDR",
    "Processor": "A17 Pro",
    "Camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto"
  },
  "tags": ["smartphone", "apple", "iphone", "5g", "pro"],
  "weight": 0.187,
  "dimensions": {
    "length": 14.67,
    "width": 7.16,
    "height": 0.83,
    "unit": "cm"
  },
  "freeShipping": true,
  "metaTitle": "Buy iPhone 15 Pro 256GB - Latest Apple Smartphone",
  "metaDescription": "Get the latest iPhone 15 Pro with A17 Pro chip, Pro camera system, and titanium design. Free shipping available."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "product-uuid",
    "name": "iPhone 15 Pro",
    "slug": "iphone-15-pro-vendorid",
    "price": 134900,
    "currency": "INR",  // Auto-assigned from vendor
    "stock": 50,
    "status": "ACTIVE"
  }
}
```

---

### 2. Get All Products (Public)

**GET** `/products`

**Query Parameters:**
- `page=1` - Page number
- `limit=20` - Results per page
- `category=CATEGORY_ID` - Filter by category
- `vendor=VENDOR_ID` - Filter by vendor
- `minPrice=10000` - Minimum price
- `maxPrice=150000` - Maximum price
- `search=iphone` - Text search
- `sort=-createdAt` - Sort (default: newest first)
  - `-createdAt` - Newest first
  - `createdAt` - Oldest first
  - `price` - Price low to high
  - `-price` - Price high to low
  - `-rating` - Highest rated
  - `-salesCount` - Best selling
- `status=ACTIVE` - Filter by status

**Examples:**
```
GET /products?category=ELECTRONICS_ID&minPrice=50000&maxPrice=150000
GET /products?search=iphone&sort=-rating
GET /products?vendor=VENDOR_ID&status=ACTIVE
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product-uuid",
      "name": "iPhone 15 Pro",
      "price": 134900,
      "currency": "INR",
      "vendor": {
        "_id": "vendor-uuid",
        "shopName": "Sharma Electronics",
        "rating": 4.5
      },
      "category": {
        "_id": "category-uuid",
        "name": "Smartphones"
      },
      "images": [...],
      "rating": 4.8,
      "reviewsCount": 145
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 92
}
```

---

### 3. Get Product by ID (Public)

**GET** `/products/:id`

**Response includes:**
- Full product details
- Vendor information
- Category information
- Auto-incremented view count

---

### 4. Get Vendor's Own Products

**GET** `/products/vendor/my-products`

**Headers:**
```
Authorization: Bearer VENDOR_TOKEN
```

**Query Parameters:**
- `page=1`
- `limit=20`
- `status=ACTIVE` - Filter by status (DRAFT, ACTIVE, OUT_OF_STOCK, DISCONTINUED)
- `search=iphone`

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "product-uuid",
      "name": "iPhone 15 Pro",
      "price": 134900,
      "currency": "INR",
      "stock": 50,
      "status": "ACTIVE",
      "salesCount": 25,
      "viewsCount": 1250
    }
  ],
  "total": 15
}
```

---

### 5. Update Product (Vendor - Own Products Only)

**PUT** `/products/:id`

**Headers:**
```
Authorization: Bearer VENDOR_TOKEN
```

**Body** (Update Price & Stock):
```json
{
  "price": 129900,
  "stock": 75,
  "status": "ACTIVE"
}
```

**Body** (Update Images):
```json
{
  "images": [
    {
      "url": "https://example.com/new-image1.jpg",
      "alt": "Updated image",
      "isPrimary": true
    }
  ]
}
```

**Auto-Features:**
- ✅ If stock > 0 and status was OUT_OF_STOCK → Auto-changes to ACTIVE
- ✅ If stock = 0 → Auto-changes to OUT_OF_STOCK
- ✅ Only vendor who created product can update it

---

### 6. Delete Product (Vendor - Own Products Only)

**DELETE** `/products/:id`

**Headers:**
```
Authorization: Bearer VENDOR_TOKEN
```

---

## **Complete Testing Flow**

### **Step 1: Create Categories (as SuperAdmin)**

1. Login as SuperAdmin
2. Create "Electronics" category
3. Create "Smartphones" subcategory (parent = Electronics ID)

### **Step 2: Create Product (as Vendor)**

1. Login as Vendor (approved vendor)
2. Create product with category ID
3. Product automatically gets vendor's currency (INR or USD)

### **Step 3: Test Public Browsing**

1. Get all products (no auth needed)
2. Filter by category, price range
3. Search for products
4. View single product

### **Step 4: Vendor Product Management**

1. Get vendor's own products
2. Update product price/stock
3. Change product status
4. Delete product

---

## **Multi-Currency Example**

**Indian Vendor Product:**
```json
{
  "name": "Samsung Galaxy S24",
  "price": 79999,
  "currency": "INR"  // ₹79,999
}
```

**USA Vendor Product:**
```json
{
  "name": "Samsung Galaxy S24",
  "price": 899,
  "currency": "USD"  // $899
}
```

**Currency is auto-assigned from vendor's country!**

---

## **Product Status Workflow**

- **DRAFT** - Product created but not published
- **ACTIVE** - Available for purchase
- **OUT_OF_STOCK** - No stock available
- **DISCONTINUED** - No longer selling

---

## **Quick Postman Setup**

**Environment Variables:**
- `BASE_URL` = `http://localhost:5000/api`
- `ADMIN_TOKEN` = (SuperAdmin login token)
- `VENDOR_TOKEN` = (Vendor login token)
- `CATEGORY_ID` = (From create category response)
- `PRODUCT_ID` = (From create product response)

---

**Your product catalog system is complete!** 🛍️🚀
