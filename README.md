# FSD-47 — Conflict-Resolved Data Update System

A full-stack application that handles concurrent updates to shared records using **optimistic locking** (version-based conflict detection). When two users try to edit the same record simultaneously, the system detects the conflict, rejects the stale update, logs it to the database, and clearly informs the user.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Styling | Custom CSS (dark industrial theme) |

---

## User Roles & Permissions

| Feature | User | Admin |
|---------|------|-------|
| Register / Login | ✅ | ✅ |
| View all records | ✅ | ✅ |
| Edit records | ✅ | ✅ |
| Create records | ❌ | ✅ |
| Delete records | ❌ | ✅ |
| View conflict history | ❌ | ✅ |

---

## How Conflict Detection Works

1. When a user opens a record to edit, the current `version` is stored as `clientVersion`
2. On submit, the backend receives `{ title, content, clientVersion }`
3. The backend fetches the record from MongoDB and compares `record.version` vs `clientVersion`
4. **If they differ** → conflict is saved to `conflicts` collection → HTTP 409 returned
5. **If they match** → update applied, `version` incremented → HTTP 200 returned
6. Users are shown a detailed conflict message with who made the conflicting change and when

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user info |

### Records
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/records` | ✅ | Any | List all records |
| GET | `/api/records/:id` | ✅ | Any | Get a single record |
| POST | `/api/records` | ✅ | Admin | Create a record |
| PUT | `/api/records/:id` | ✅ | Any | Update record (conflict detection) |
| DELETE | `/api/records/:id` | ✅ | Admin | Delete a record |

### Conflicts
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/conflicts` | ✅ | Admin | Get all conflict history |
| GET | `/api/conflicts/record/:id` | ✅ | Admin | Conflicts for a specific record |

---

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "username": "string (unique)",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "role": "user | admin",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Records Collection
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "version": "number (starts at 1, increments on each successful update)",
  "lastUpdatedBy": "ObjectId (ref: User)",
  "lastUpdatedByUsername": "string",
  "createdBy": "ObjectId (ref: User)",
  "createdByUsername": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Conflicts Collection
```json
{
  "_id": "ObjectId",
  "recordId": "ObjectId (ref: Record)",
  "recordTitle": "string",
  "attemptedBy": "ObjectId (ref: User)",
  "attemptedByUsername": "string",
  "clientVersion": "number (version the user had)",
  "serverVersion": "number (version in DB at conflict time)",
  "attemptedData": { "title": "string", "content": "string" },
  "conflictedWithUsername": "string",
  "status": "rejected",
  "createdAt": "Date"
}
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and JWT secret
npm run dev         # runs on port 5000
```

### Frontend
```bash
cd frontend
npm install
# Edit .env: REACT_APP_API_URL=http://localhost:5000/api
npm start           # runs on port 3000
```

---

## Test Scenario — Conflict Detection

1. Register **User A** and **User B** (and an Admin)
2. Admin creates a record (e.g. "Project Plan")
3. **User A** opens the record — they see `version: 1`
4. **User B** also opens the same record — they also see `version: 1`
5. **User B** saves their changes first → record becomes `version: 2`
6. **User A** tries to save → backend sees `clientVersion=1` ≠ `serverVersion=2` → **CONFLICT** → 409 response
7. User A sees the conflict banner with full details
8. Admin views `/conflicts` → conflict is logged with full info

---

## Live Links

- Frontend: _[Add after deployment]_
- Backend: _[Add after deployment]_
