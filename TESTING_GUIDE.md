# MediDiet Backend - Testing & Validation Guide

## 🧪 Complete Testing Guide

This guide covers manual testing of all backend endpoints.

---

## 📋 Prerequisites

### Software Required
- cURL (built-in on macOS/Linux, available on Windows)
- Postman (optional, for easier testing)
- Terminal/Command Prompt

### Setup
1. Backend running: `npm run dev`
2. Server should be at: `http://localhost:5000`

---

## 🔌 Base URL
```
http://localhost:5000
```

---

## 1️⃣ Authentication Tests

### Test 1.1: Register User
Creates a new user account.

**Command:**
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

**Expected Response:**
- Status: `201 Created`
- Body includes `token` field
- User data returned with id, name, email, phone

**Save the token** for next tests:
```
TOKEN=eyJhbGciOiJIUzI1NiIs... (copy from response)
```

**Test Variations:**
```bash
# Missing required field
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
# Expected: 400 (password required)

# Duplicate email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Jane",
    "email":"john@example.com",
    "password":"password123"
  }'
# Expected: 400 (email already registered)

# Invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John",
    "email":"invalid-email",
    "password":"password123"
  }'
# Expected: 400 (invalid email format)

# Short password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John",
    "email":"john2@example.com",
    "password":"123"
  }'
# Expected: 400 (password too short)
```

---

### Test 1.2: Login User
Authenticates user and returns JWT token.

**Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
- Status: `200 OK`
- Body includes `token` field
- User data returned

**Save the token:**
```bash
TOKEN=eyJhbGciOiJIUzI1NiIs...
```

**Test Variations:**
```bash
# Wrong password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"wrongpassword"
  }'
# Expected: 401 (incorrect credentials)

# Non-existent email
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nonexistent@example.com",
    "password":"password123"
  }'
# Expected: 401 (incorrect credentials)
```

---

## 2️⃣ Diet Planning Tests

### Test 2.1: Generate Diet Plan
Generates personalized diet plan using Gemini AI.

**Command:**
```bash
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "Male",
    "height": "175 cm",
    "weight": "75 kg",
    "medical_history": "Diabetes type 2",
    "medications": "Metformin 500mg",
    "allergies": "Peanuts",
    "preference": "Veg",
    "goal": "Weight management and blood sugar control"
  }'
```

**Expected Response:**
- Status: `201 Created`
- Contains diet plan with 5 meal times + notes
- Fields: early_morning, breakfast, lunch, snacks, dinner, notes
- All notes are arrays of strings

**Verify JSON Structure:**
```bash
# Parse and pretty-print response
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq '.data.dietPlan.planData'
```

**Test Variations:**
```bash
# Non-Veg preference
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age":35,
    "gender":"Female",
    "height":"165 cm",
    "weight":"65 kg",
    "medical_history":"None",
    "medications":"None",
    "allergies":"None",
    "preference":"Non-Veg",
    "goal":"Muscle gain"
  }'
# Expected: 201 (includes meat items)

# Without optional fields
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age":25,
    "gender":"Male",
    "height":"180 cm",
    "weight":"70 kg",
    "preference":"Veg",
    "goal":"General health"
  }'
# Expected: 201 (medical_history, medications, allergies are optional)

# Invalid age
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age":150,
    "gender":"Male",
    "height":"175 cm",
    "weight":"75 kg",
    "preference":"Veg",
    "goal":"Weight loss"
  }'
# Expected: 400 (age must be 1-120)

# Missing auth token
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 401 (not authenticated)

# Invalid token
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 401 (invalid token)
```

---

### Test 2.2: Get Latest Diet Plan
Retrieves user's current active diet plan.

**Command:**
```bash
curl -X GET http://localhost:5000/api/diet/latest \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
- Status: `200 OK`
- Contains the latest active plan
- Includes user info (name, email, phone)
- lastAccessedAt should be recent

**Test Variations:**
```bash
# Without token
curl -X GET http://localhost:5000/api/diet/latest
# Expected: 401 (not authenticated)

# After generating new plan (should deactivate old one)
# First plan was version 1
# Generate another plan
# Then get latest - should be version 2
# Expected: 200 (returns version 2)
```

---

### Test 2.3: Get Diet Plan by ID
Retrieves a specific diet plan by its ID.

**Command:**
```bash
# First, get the plan ID from the generate response or latest endpoint
PLAN_ID=507f1f77bcf86cd799439012

curl -X GET "http://localhost:5000/api/diet/$PLAN_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
- Status: `200 OK`
- Contains requested diet plan
- Confirms user owns the plan

**Test Variations:**
```bash
# Invalid plan ID format
curl -X GET "http://localhost:5000/api/diet/invalid_id" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 (invalid MongoDB ID)

# Non-existent plan ID
curl -X GET "http://localhost:5000/api/diet/507f1f77bcf86cd799999999" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 (plan not found)

# With different user token (access another user's plan)
# Create second user, get their token
# Try to access first user's plan
curl -X GET "http://localhost:5000/api/diet/$FIRST_USER_PLAN_ID" \
  -H "Authorization: Bearer $SECOND_USER_TOKEN"
# Expected: 403 (forbidden - no permission)
```

---

## 3️⃣ WhatsApp Integration Tests

### Test 3.1: WhatsApp Query Handler
Answers diet-related questions using stored diet plan.

**Command:**
```bash
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "What should I eat for breakfast?"
  }'
```

**Expected Response:**
- Status: `200 OK`
- Response is plain text (not JSON)
- Content-Type: text/plain
- 1-2 sentence answer

**Test Variations:**
```bash
# Different question
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "Can I eat peanuts?"
  }'
# Expected: 200 (answers based on allergies in plan)

# User not found
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919999999999",
    "message": "What should I eat?"
  }'
# Expected: 200 (returns friendly message about registering)

# No diet plan
# Create user without generating diet plan
# Try to query with their phone
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+91NEW_USER_PHONE",
    "message": "What should I eat?"
  }'
# Expected: 200 (returns message about generating plan first)

# Invalid phone format
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "123",
    "message": "What should I eat?"
  }'
# Expected: 400 (invalid phone format)

# Empty message
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": ""
  }'
# Expected: 400 (message cannot be empty)

# Very long message
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "very long message...over 1000 characters..."
  }'
# Expected: 400 (message too long)
```

---

## 4️⃣ Health Check Tests

### Test 4.1: Root Health Check
```bash
curl -X GET http://localhost:5000/
```

**Expected Response:**
- Status: `200 OK`
- Contains: status, message, timestamp, version

### Test 4.2: Detailed Health Check
```bash
curl -X GET http://localhost:5000/health
```

**Expected Response:**
- Status: `200 OK`
- Contains: status, uptime, timestamp

---

## 📊 Test Summary Checklist

### Authentication ✅
- [ ] User registration successful
- [ ] Duplicate email rejected
- [ ] Invalid email rejected
- [ ] Short password rejected
- [ ] User login successful
- [ ] Wrong password rejected
- [ ] Invalid email rejected

### Diet Planning ✅
- [ ] Diet plan generation successful
- [ ] Veg preference respected
- [ ] Non-Veg preference respected
- [ ] Medical conditions considered
- [ ] Invalid age rejected
- [ ] Missing required fields rejected
- [ ] Get latest plan successful
- [ ] Get plan by ID successful
- [ ] Access control enforced (403)
- [ ] Authentication required (401)

### WhatsApp ✅
- [ ] Query answered successfully
- [ ] User not found handled gracefully
- [ ] No plan scenario handled
- [ ] Invalid phone format rejected
- [ ] Empty message rejected
- [ ] Response is plain text
- [ ] Question context respected

### Security ✅
- [ ] Passwords are hashed
- [ ] Tokens required for protected routes
- [ ] Invalid tokens rejected
- [ ] CORS enabled
- [ ] Security headers present

---

## 🔍 Debugging Tips

### View Request Headers
```bash
curl -v -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
# -v flag shows request/response headers
```

### Pretty Print JSON Response
```bash
curl -X GET http://localhost:5000/api/diet/latest \
  -H "Authorization: Bearer $TOKEN" | jq '.'
# Requires: npm install -g jq
```

### View Full Error Response
```bash
curl -v -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer INVALID" \
  -H "Content-Type: application/json" \
  -d '{"age":30,"gender":"Male","height":"175 cm","weight":"75 kg","preference":"Veg","goal":"Loss"}'
```

### Check Server Logs
Look at terminal where `npm run dev` is running for:
- Request logs
- Database connection status
- Error messages
- AI API calls

---

## 🛠️ Using Postman

### Setup
1. Create new collection: "MediDiet API"
2. Create environment with variables:
   ```
   base_url = http://localhost:5000
   token = (set after login)
   plan_id = (set after diet generation)
   phone = +919876543210
   ```

### Import Variables
In Postman, use:
```
{{base_url}}/api/auth/login
Authorization: Bearer {{token}}
```

### Save Responses to Variables
After login, go to "Tests" tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

---

## 📈 Load Testing (Optional)

### Using Apache Bench
```bash
# Test health endpoint
ab -n 100 -c 10 http://localhost:5000/

# Test with POST
ab -n 50 -c 5 -p data.json -T application/json \
  http://localhost:5000/api/whatsapp/query
```

### Using hey
```bash
# Install
go install github.com/rakyll/hey@latest

# Test
hey -n 1000 -c 50 http://localhost:5000/
```

---

## ✅ Final Validation Checklist

- [ ] All endpoints return correct status codes
- [ ] Response bodies match documentation
- [ ] Authentication works correctly
- [ ] Database operations succeed
- [ ] Error messages are helpful
- [ ] No sensitive data in logs
- [ ] Timestamps are correct
- [ ] Validation works as expected
- [ ] CORS headers present
- [ ] Security headers present (Helmet)

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized on protected route
**Solution:** 
- Check if token is valid: `echo $TOKEN`
- Re-login to get new token
- Verify "Authorization: Bearer" format

### Issue: 400 Bad Request
**Solution:**
- Check JSON syntax
- Verify all required fields present
- Check field types (number vs string)
- Review error message details

### Issue: 502 Bad Gateway from Gemini
**Solution:**
- Verify GEMINI_API_KEY in .env.local
- Check Google Cloud Console quota
- Test at https://aistudio.google.com/
- Wait and retry

### Issue: MongoDB Connection Error
**Solution:**
- Verify MONGODB_URI in .env.local
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity
- Verify database exists

---

**Ready to test! Start with the quick tests and work through comprehensively.** 🚀
