# MediDiet Backend - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create Environment File
Create `.env.local` in the **project root** (not in backend folder):

```env
MONGODB_URI=mongodb+srv://shubhamnayak1972_db_user:dTDW6o1nA0MhYkTZ@dietplan-cluster.zfkzayl.mongodb.net/dietplan?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-minimum-32-characters-long-change-this
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
NODE_ENV=development
```

### Step 3: Start Development Server
```bash
npm run dev
```

Expected output:
```
✅ Environment Variables Loaded
✅ MongoDB Connected
✅ Server running successfully
   🌐 URL: http://localhost:5000
```

---

## 🧪 Test the API

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+919876543210"
  }'
```

**Copy the token from response** - you'll need it for next requests.

### 2. Generate Diet Plan
Replace `YOUR_TOKEN` with the token from step 1:

```bash
curl -X POST http://localhost:5000/api/diet/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
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

### 3. Get Latest Diet Plan
```bash
curl -X GET http://localhost:5000/api/diet/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. WhatsApp Query (No Auth Needed)
```bash
curl -X POST http://localhost:5000/api/whatsapp/query \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "message": "What should I eat for breakfast?"
  }'
```

---

## 📚 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration (DB, AI, ENV)
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth & other middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Helpers (JWT, errors, prompts)
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── README.md            # Full documentation
├── ENDPOINTS.md         # API endpoint details
└── .env.example         # Environment variables template
```

---

## 🔑 Key Features Implemented

✅ **Authentication**
- User registration & login
- JWT token generation & verification
- Password hashing with bcryptjs
- Protected routes

✅ **Diet Planning**
- Gemini AI integration
- Personalized diet plan generation
- Plan versioning & activation
- Medical condition awareness
- Indian food recommendations

✅ **WhatsApp Integration**
- Stateless query handler
- RAG-based Q&A system
- n8n webhook compatible
- Plain text responses

✅ **Database**
- MongoDB Atlas connection
- Mongoose ODM
- User & DietPlan models
- Timestamps & indexes

✅ **Security**
- Helmet.js security headers
- CORS configuration
- Input validation (Zod)
- Error sanitization
- No secrets in logs

✅ **Development**
- TypeScript strict mode
- Hot reload with Nodemon
- Comprehensive error handling
- Request logging
- Production-ready structure

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user

### Diet Planning (Protected)
- `POST /api/diet/generate` - Generate diet plan
- `GET /api/diet/latest` - Get active plan
- `GET /api/diet/:id` - Get plan by ID

### WhatsApp
- `POST /api/whatsapp/query` - Answer diet questions

### Health
- `GET /` - Health check
- `GET /health` - Detailed status

**Full API docs:** See [ENDPOINTS.md](./ENDPOINTS.md)

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
❌ MongoDB Connection Failed
   → Invalid credentials. Check MONGODB_URI in .env.local
```

**Solution:**
1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Ensure database exists

### JWT_SECRET Error
```
JWT_SECRET must be at least 32 characters long
```

**Solution:** Generate a long secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Gemini API Error
```
AI returned invalid JSON. Please try again.
```

**Solution:**
1. Verify `GEMINI_API_KEY` in .env.local
2. Check API quota in Google Cloud Console
3. Test at https://aistudio.google.com/

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```

**Solution:** Use different port:
```bash
PORT=5001 npm run dev
```

---

## 📦 Build for Production

### 1. Build TypeScript
```bash
npm run build
```

Creates `dist/` folder with compiled JavaScript.

### 2. Start Production Server
```bash
npm start
```

Or set environment to production:
```bash
NODE_ENV=production npm start
```

---

## 📋 Environment Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `MONGODB_URI` | ✅ | `mongodb+srv://...` | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | 32+ random characters | Use `crypto.randomBytes(32).toString('hex')` |
| `GEMINI_API_KEY` | ✅ | `AIzaSy...` | From Google Cloud Console |
| `PORT` | ❌ | 5000 | Default: 5000 |
| `NODE_ENV` | ❌ | development | development \| production \| test |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | For CORS in production |

---

## 🔐 Security Checklist

- [ ] Environment variables in `.env.local` (never in code)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled in production
- [ ] CORS configured for your domain
- [ ] Rate limiting added (recommended)
- [ ] Error logs don't expose secrets
- [ ] Passwords hashed with bcryptjs

---

## 🚀 Next Steps

1. **Integrate Frontend:** Connect your React/TypeScript frontend
2. **Add WhatsApp Bot:** Set up n8n webhook with `/api/whatsapp/query`
3. **Configure MongoDB:** Set up backups and monitoring
4. **Deploy:** Use Railway, Vercel, or Docker
5. **Monitor:** Set up error tracking (Sentry, Datadog)

---

## 📚 Documentation Links

- [Full README](./README.md) - Complete project documentation
- [API Endpoints](./ENDPOINTS.md) - Detailed endpoint reference
- [Environment Setup](./README.md#-environment-variables) - Configuration guide
- [Production Deployment](./README.md#-production-deployment) - Deployment instructions

---

## 💬 Common Questions

**Q: How do I change the database?**
A: Modify `MONGODB_URI` in `.env.local` - supports any MongoDB compatible database.

**Q: Can I use a different AI provider?**
A: Yes! Replace code in `src/config/ai.ts` with your provider's SDK.

**Q: How do I add more diet endpoints?**
A: Create new controller in `src/controllers/`, service in `src/services/`, and route in `src/routes/`.

**Q: Is this production-ready?**
A: Yes! Add rate limiting, logging, and monitoring for full production setup.

---

## 📞 Support

Check the full [README.md](./README.md) for:
- Complete API documentation
- Database schemas
- Error handling guide
- Deployment instructions
- Dependencies reference

---

**Happy coding! 🚀**
