# MediDiet Backend

Hospital-grade diet plan management backend built with Node.js, Express, TypeScript, and Gemini AI.

## 🏗️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB Atlas with Mongoose
- **AI/ML:** Google Generative AI (Gemini)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, bcryptjs
- **Validation:** Zod
- **Development:** Nodemon, ts-node

## 📋 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── ai.ts           # Gemini AI setup
│   │   ├── db.ts           # MongoDB connection
│   │   └── env.ts          # Environment variables
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── diet.controller.ts
│   │   └── whatsapp.controller.ts
│   ├── middleware/          # Express middleware
│   │   └── auth.middleware.ts
│   ├── models/             # Mongoose schemas
│   │   ├── user.model.ts
│   │   └── dietPlan.model.ts
│   ├── routes/             # API routes
│   │   ├── auth.routes.ts
│   │   ├── diet.routes.ts
│   │   └── whatsapp.routes.ts
│   ├── services/           # Business logic
│   │   ├── diet.service.ts
│   │   └── whatsapp.service.ts
│   ├── types/              # TypeScript types
│   │   ├── express.d.ts
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── AppError.ts     # Custom error class
│   │   ├── jwt.ts          # JWT utilities
│   │   └── prompts.ts      # AI prompts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server initialization
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account with connection string
- Google Gemini API key
- `.env.local` file with required variables

### Installation

```bash
cd backend

# Install dependencies
npm install

# Create .env.local in project root with:
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dietplan?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters-long
GEMINI_API_KEY=your-gemini-api-key
PORT=5000
NODE_ENV=development
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Server runs on http://localhost:5000
```

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+91XXXXXXXXXX" (optional)
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91XXXXXXXXXX"
    }
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Diet Planning

#### Generate Diet Plan (Protected)
```http
POST /api/diet/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 30,
  "gender": "Male",
  "height": "175 cm",
  "weight": "75 kg",
  "medical_history": "Diabetes type 2",
  "medications": "Metformin 500mg",
  "allergies": "Peanuts",
  "preference": "Veg",
  "goal": "Weight management and blood sugar control"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Diet plan generated successfully",
  "data": {
    "dietPlan": {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "planData": {
        "early_morning": ["Warm lemon water (1 glass)"],
        "breakfast": ["Oats with fruits (150g)"],
        "lunch": ["Brown rice with dal (250g)"],
        "snacks": ["Green apple (1 medium)"],
        "dinner": ["Vegetable soup with roti (200g)"],
        "notes": ["Avoid sugary drinks", "Drink 8-10 glasses of water daily"]
      },
      "version": 1,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

#### Get Latest Diet Plan (Protected)
```http
GET /api/diet/latest
Authorization: Bearer <token>
```

#### Get Diet Plan by ID (Protected)
```http
GET /api/diet/{planId}
Authorization: Bearer <token>
```

### WhatsApp Integration

#### Query Diet Plan
```http
POST /api/whatsapp/query
Content-Type: application/json

{
  "phone": "+91XXXXXXXXXX",
  "message": "What should I eat for breakfast?"
}
```

**Response:** Plain text message (n8n compatible)
```
You should have oats with fruits and a glass of warm milk for breakfast. It's nutritious and helps manage blood sugar.
```

### Health Check
```http
GET /
```

```http
GET /health
```

## 🔐 Security Features

- **Password Hashing:** bcryptjs with salt rounds = 12
- **JWT Authentication:** 90-day token expiration
- **Helmet.js:** Security headers
- **CORS:** Configurable cross-origin requests
- **Input Validation:** Zod schemas on all endpoints
- **Rate Limiting:** Consider adding express-rate-limit in production
- **Environment Variables:** No secrets in code
- **Error Handling:** Sanitized error messages in production

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development|production|test

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.net/dietplan?retryWrites=true&w=majority

# Security
JWT_SECRET=minimum-32-character-long-secret-key

# AI
GEMINI_API_KEY=your-google-gemini-api-key

# Optional
FRONTEND_URL=http://localhost:3000
```

## 🔄 Database Schema

### User Model
```typescript
{
  name: String (required),
  email: String (required, unique),
  phone: String (optional, unique, sparse),
  password: String (required, hashed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### DietPlan Model
```typescript
{
  user: ObjectId (ref: User),
  planData: Mixed (JSON structure),
  userInput: Mixed (profile used to generate plan),
  version: Number,
  isActive: Boolean,
  lastAccessedAt: Date,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🤖 Gemini AI Integration

### Diet Plan Generation
- Uses Gemini 1.5 Flash model
- Generates structured JSON with:
  - Early morning meals
  - Breakfast
  - Lunch
  - Snacks
  - Dinner
  - Health notes
- Respects dietary preferences (Veg/Non-Veg)
- Considers medical conditions
- Includes affordable Indian foods

### WhatsApp Q&A
- RAG (Retrieval-Augmented Generation) pattern
- Answers based on user's stored diet plan
- Stateless design for n8n webhook compatibility
- Plain text output for messaging platforms

## 📊 Error Handling

All errors return standardized response format:

```json
{
  "status": "error|fail",
  "message": "Error description",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth failed)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `502` - Bad Gateway (external service error)

## 🧪 Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Generate Diet (replace token and user ID)
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Testing with Postman

1. Create environment variables:
   - `base_url` = `http://localhost:5000`
   - `token` = (set after login)
   - `userId` = (set after register)

2. Use the collection files in `docs/postman/`

## 🚨 Production Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (32+ chars)
- [ ] Verify `MONGODB_URI` points to production cluster
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Configure CORS for frontend domain
- [ ] Set up error logging (Sentry, Datadog, etc.)
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limiting
- [ ] Set up health check monitoring
- [ ] Backup database regularly
- [ ] Review security headers in helmet config

### Deployment Platforms

**Option 1: Vercel**
```bash
npm run build
vercel deploy
```

**Option 2: Railway**
```bash
railway link
railway up
```

**Option 3: Azure App Service**
```bash
az webapp up --name diet-plan-api
```

**Option 4: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 📖 API Documentation

For detailed API documentation, see [ENDPOINTS.md](./ENDPOINTS.md)

## 🐛 Debugging

### Enable Verbose Logging
```bash
DEBUG=* npm run dev
```

### MongoDB Connection Issues
```bash
# Test connection
mongosh "mongodb+srv://user:password@cluster.net/dietplan"
```

### Gemini API Issues
- Verify API key in Google Cloud Console
- Check quota usage
- Test API with: https://aistudio.google.com/

## 📚 Dependencies

### Production
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `express` - Web framework
- `helmet` - Security headers
- `jsonwebtoken` - JWT auth
- `mongoose` - MongoDB ODM
- `zod` - Data validation
- `@google/generative-ai` - Gemini API

### Development
- `typescript` - Type safety
- `nodemon` - Auto-reload
- `ts-node` - TS execution
- `@types/*` - Type definitions

## 📞 Support

For issues and questions:
1. Check the FAQ section
2. Review error logs: `logs/` directory
3. Open GitHub issue
4. Contact development team

## 📄 License

ISC

## ✅ Checklist for Production

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database connected and tested
- [ ] Gemini API working
- [ ] All routes tested
- [ ] Error handling verified
- [ ] HTTPS enabled
- [ ] Logging configured
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
