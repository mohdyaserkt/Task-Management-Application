# Task Management Application

## Quick Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Git

### Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_management"
JWT_ACCESS_SECRET="your_secret_key_min_32_chars"
JWT_REFRESH_SECRET="your_refresh_key_min_32_chars"
PORT=3001
```

Database setup:
```bash
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_APP_API_URL=http://localhost:3001/api
```

Start frontend:
```bash
npm run dev
```

## Sample Credentials

**Test User:**
- Email: `test@example.com`
- Password: `TestPass123!`
- Username: `testuser`


## File Format for Import

**CSV/Excel Columns:**
- Task Title (required)
- Description (optional)
- Effort To Complete(In Days) (optional)
- Due Date (required, format: YYYY-MM-DD)

**Sample CSV:**
```csv
Task Title,Description,Effort To Complete(In Days),Due Date
"Complete documentation","Write docs",3,2023-12-31
"Fix bugs","Debug application",2,2023-11-15
```

## URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health
