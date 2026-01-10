# E-commerce API Testing Collection

## Authentication Endpoints

Base URL: `http://localhost:5000/api`

---

### 1. Register New User (Customer)

**POST** `/auth/register`

**Body** (JSON):
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "+1234567890",
  "role": "CUSTOMER"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "isEmailVerified": false
  }
}
```

---

### 2. Register Vendor

**POST** `/auth/register`

**Body** (JSON):
```json
{
  "email": "vendor@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "mobile": "+1234567890",
  "role": "VENDOR"
}
```

---

### 3. Login

**POST** `/auth/login`

**Body** (JSON):
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "isEmailVerified": false
  }
}
```

---

### 4. Get Current User (Me)

**GET** `/auth/me`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response** (200):
```json
{
  "success": true,
  "user": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "isEmailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Logout

**POST** `/auth/logout`

**Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Testing in Postman

1. **Environment Variables**:
   - Create variable: `BASE_URL` = `http://localhost:5000/api`
   - Create variable: `TOKEN` = (will be set automatically from login response)

2. **After Login**, save the token:
   - Go to "Tests" tab
   - Add script:
   ```javascript
   pm.environment.set("TOKEN", pm.response.json().token);
   ```

3. **For Protected Routes**, use:
   - **Authorization** tab → Type: **Bearer Token**
   - Token: `{{TOKEN}}`

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Registration failed"
}
```

---

## Next Steps

After testing authentication:
1. Create a SuperAdmin user manually (will provide script)
2. Test vendor registration
3. Ready to build Product APIs!
