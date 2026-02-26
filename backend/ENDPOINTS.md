# MediDiet API Endpoints Documentation

## Base URL
```
http://localhost:5000
```

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Diet Planning](#diet-planning)
3. [WhatsApp Integration](#whatsapp-integration)
4. [Health Check](#health-check)

---

## Authentication

### 1. Register User
Create a new user account.

**Endpoint:**
```
POST /api/auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+919876543210"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | User's full name (min 2 chars) |
| email | string | ✅ | Valid email address (must be unique) |
| password | string | ✅ | Password (min 6 chars) |
| phone | string | ❌ | Phone in E.164 format (optional, unique if provided) |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210"
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "message": "Email already registered",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

**Validation Errors:**
- `name` must be at least 2 characters
- `email` must be a valid email address
- `password` must be at least 6 characters
- `phone` must match E.164 format (optional)

---

### 2. Login User
Authenticate user and receive JWT token.

**Endpoint:**
```
POST /api/auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | Registered email address |
| password | string | ✅ | Account password |

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210"
    }
  }
}
```

**Error Response (401):**
```json
{
  "status": "fail",
  "message": "Incorrect email or password",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## Diet Planning

### 3. Generate Diet Plan
Generate a personalized diet plan based on user profile. Deactivates previous plans.

**Endpoint:**
```
POST /api/diet/generate
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "age": 30,
  "gender": "Male",
  "height": "175 cm",
  "weight": "75 kg",
  "medical_history": "Diabetes type 2, Hypertension",
  "medications": "Metformin 500mg, Lisinopril 10mg",
  "allergies": "Peanuts, Shellfish",
  "preference": "Veg",
  "goal": "Weight management and blood sugar control"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| age | number | ✅ | Age 1-120 |
| gender | enum | ✅ | Male \| Female \| Other |
| height | string | ✅ | Height with unit (e.g., "175 cm") |
| weight | string | ✅ | Weight with unit (e.g., "75 kg") |
| medical_history | string | ❌ | Comma-separated conditions |
| medications | string | ❌ | Current medications and doses |
| allergies | string | ❌ | Known allergies |
| preference | enum | ✅ | Veg \| Non-Veg \| Eggetarian |
| goal | string | ✅ | Health goal description |

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Diet plan generated successfully",
  "data": {
    "dietPlan": {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "planData": {
        "early_morning": [
          "Warm lemon water with honey (1 glass)"
        ],
        "breakfast": [
          "Oats with almond milk and berries (150g)"
        ],
        "lunch": [
          "Brown rice with mixed dal and salad (250g)"
        ],
        "snacks": [
          "Green apple with almond butter (1 medium)"
        ],
        "dinner": [
          "Vegetable soup with whole wheat roti (200g)"
        ],
        "notes": [
          "Avoid sugary drinks and processed foods",
          "Drink 8-10 glasses of water daily",
          "Monitor blood glucose regularly",
          "Consult doctor before making major dietary changes"
        ]
      },
      "userInput": {
        "age": 30,
        "gender": "Male",
        "height": "175 cm",
        "weight": "75 kg",
        "medical_history": "Diabetes type 2, Hypertension",
        "medications": "Metformin 500mg, Lisinopril 10mg",
        "allergies": "Peanuts, Shellfish",
        "preference": "Veg",
        "goal": "Weight management and blood sugar control"
      },
      "version": 1,
      "isActive": true,
      "lastAccessedAt": "2024-01-01T10:00:00.000Z",
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- (401) Not authenticated:
```json
{
  "status": "fail",
  "message": "You are not authenticated! Please log in to continue.",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

- (400) Validation error:
```json
{
  "status": "fail",
  "message": "Validation error: age - Number must be less than or equal to 120; preference - Invalid enum value",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

- (502) AI generation failed:
```json
{
  "status": "error",
  "message": "AI returned invalid JSON. Please try again.",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

### 4. Get Latest Active Diet Plan
Retrieve the user's current active diet plan.

**Endpoint:**
```
GET /api/diet/latest
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:** None

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "dietPlan": {
      "_id": "507f1f77bcf86cd799439012",
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+919876543210"
      },
      "planData": {
        "early_morning": ["Warm lemon water with honey (1 glass)"],
        "breakfast": ["Oats with almond milk and berries (150g)"],
        "lunch": ["Brown rice with mixed dal and salad (250g)"],
        "snacks": ["Green apple with almond butter (1 medium)"],
        "dinner": ["Vegetable soup with whole wheat roti (200g)"],
        "notes": [...]
      },
      "version": 1,
      "isActive": true,
      "lastAccessedAt": "2024-01-01T12:30:00.000Z",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "No active diet plan found. Please generate one first.",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

### 5. Get Diet Plan by ID
Retrieve a specific diet plan by its ID (user must own the plan).

**Endpoint:**
```
GET /api/diet/:id
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | ✅ | Diet plan MongoDB ObjectId |

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "dietPlan": {
      "_id": "507f1f77bcf86cd799439012",
      "user": {...},
      "planData": {...},
      "version": 1,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- (404) Not found:
```json
{
  "status": "fail",
  "message": "Diet plan not found",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

- (403) Access denied:
```json
{
  "status": "fail",
  "message": "You do not have permission to access this diet plan",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## WhatsApp Integration

### 6. Handle WhatsApp Query
Answer user questions about their diet plan via WhatsApp. Stateless, n8n compatible.

**Endpoint:**
```
POST /api/whatsapp/query
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "message": "What should I eat for breakfast tomorrow?"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| phone | string | ✅ | User's phone in E.164 format (min 10 digits) |
| message | string | ✅ | User's question (1-1000 chars) |

**Success Response (200):**
Plain text response (n8n compatible):
```
Based on your diet plan, you should have oats with almond milk and berries for breakfast. It's nutritious and suitable for your dietary preferences.
```

**Error Responses:**

- (400) Invalid input:
```
Invalid input format. Issues: phone - Invalid phone format (E.164 recommended); message - Message cannot be empty
```

- (404) User not found:
```
Sorry, I could not find an account associated with this phone number. Please register on the MediDiet platform first.
```

- (404) No active diet plan:
```
You don't have an active diet plan yet. Please visit the MediDiet platform to generate a personalized diet plan.
```

- (500) Server error:
```
Sorry, I encountered an error processing your request. Please try again in a moment.
```

---

## Health Check

### 7. Root Health Check
Basic server health status.

**Endpoint:**
```
GET /
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "✅ MediDiet Backend is Running",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "version": "1.0.0"
}
```

### 8. Detailed Health Check
Detailed server metrics and status.

**Endpoint:**
```
GET /health
```

**Success Response (200):**
```json
{
  "status": "healthy",
  "uptime": 3600.123,
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## Authentication

### Token Format
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <TOKEN>
```

### Token Expiration
- **Validity:** 90 days
- **Renewal:** Login again to get new token
- **Storage:** Store securely (httpOnly cookie recommended)

---

## Error Handling

### Standard Error Response Format
```json
{
  "status": "error|fail",
  "message": "Error description",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

### HTTP Status Codes
| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Authenticated but no permission |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - External service error (Gemini API) |

---

## Rate Limiting
Currently not implemented. Recommended for production deployment.

---

## CORS
By default, CORS is enabled for all origins in development.
In production, configure with `FRONTEND_URL` environment variable.

---

## Request/Response Examples

### cURL Examples

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Generate Diet Plan:**
```bash
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "Male",
    "height": "175 cm",
    "weight": "75 kg",
    "medical_history": "None",
    "medications": "None",
    "allergies": "None",
    "preference": "Veg",
    "goal": "Weight management"
  }'
```

**WhatsApp Query:**
```bash
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "What should I eat for lunch?"
  }'
```

---

## Troubleshooting

### 401 Unauthorized
- Token missing or expired
- Invalid token format
- Solution: Login again to get new token

### 404 Not Found
- Wrong endpoint URL
- Resource doesn't exist
- Solution: Check endpoint URL and resource ID

### 500 Internal Server Error
- Server-side error
- Check server logs
- Solution: Restart server and check MongoDB connection

### 502 Bad Gateway
- Gemini API error
- Network issue
- Solution: Check API key, rate limits, and connectivity
