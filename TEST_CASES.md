# FSD-47 — Test Cases

> Test all cases using Postman + Browser. Mark each as PASS / FAIL.

---

## Auth Test Cases

| TC# | Title | Steps | Expected | Status |
|-----|-------|--------|----------|--------|
| TC-01 | Register new user | POST /api/auth/register with valid data | 201 + token | |
| TC-02 | Register duplicate email | POST /register with existing email | 409 conflict | |
| TC-03 | Register with short password | password < 6 chars | 400 or validation error | |
| TC-04 | Login with valid credentials | POST /api/auth/login | 200 + token + user | |
| TC-05 | Login with wrong password | POST /login with bad password | 401 Unauthorized | |
| TC-06 | Login with non-existent email | POST /login with unknown email | 401 Unauthorized | |
| TC-07 | Get /me with valid token | GET /api/auth/me with Bearer token | 200 + user data | |
| TC-08 | Get /me without token | GET /api/auth/me, no Authorization header | 401 | |
| TC-09 | Get /me with expired/invalid token | Send garbage token | 401 | |
| TC-10 | Register as admin | POST /register with role: "admin" | 201 + role=admin in response | |

---

## Record CRUD Test Cases

| TC# | Title | Steps | Expected | Status |
|-----|-------|--------|----------|--------|
| TC-11 | Admin creates record | POST /api/records as admin | 201 + record with version:1 | |
| TC-12 | User tries to create record | POST /api/records as regular user | 403 Forbidden | |
| TC-13 | Unauthenticated create | POST /api/records, no token | 401 | |
| TC-14 | Get all records (user) | GET /api/records with user token | 200 + array | |
| TC-15 | Get single record | GET /api/records/:id | 200 + record | |
| TC-16 | Get non-existent record | GET /api/records/badid123 | 404 | |
| TC-17 | Admin deletes record | DELETE /api/records/:id as admin | 200 | |
| TC-18 | User tries to delete | DELETE /api/records/:id as user | 403 | |

---

## ⚡ Conflict Detection Test Cases (CRITICAL)

### Setup: Create a record via Admin → note its `_id` and `version: 1`

| TC# | Title | Steps | Expected | Status |
|-----|-------|--------|----------|--------|
| TC-19 | Successful update (no conflict) | PUT /records/:id with `clientVersion: 1` | 200 + record with version:2 | |
| TC-20 | Second update with correct version | PUT /records/:id with `clientVersion: 2` | 200 + version:3 | |
| TC-21 | **CONFLICT: stale version** | PUT /records/:id with `clientVersion: 1` when server is at v2 | **409** + conflict details | |
| TC-22 | Missing clientVersion | PUT /records/:id without clientVersion field | 400 error | |
| TC-23 | Conflict saves to DB | After TC-21, GET /api/conflicts as admin | Conflict record exists in history | |
| TC-24 | Correct usernames in conflict | Check conflict object | `attemptedByUsername` and `conflictedWithUsername` are correct | |
| TC-25 | Server version in 409 matches DB | Compare 409 response `currentVersion` to GET record | They match | |
| TC-26 | Retry after refresh works | After conflict, GET record fresh, then PUT with new version | 200 success | |
| TC-27 | Silent overwrite NOT possible | Send old version repeatedly | Always get 409 if version mismatch | |
| TC-28 | Multiple conflicts on same record | 3 users try to update stale version simultaneously | All 3 get 409, all 3 logged in conflicts | |

---

## Admin Conflict History Test Cases

| TC# | Title | Steps | Expected | Status |
|-----|-------|--------|----------|--------|
| TC-29 | Admin views all conflicts | GET /api/conflicts as admin | 200 + array of conflicts | |
| TC-30 | User cannot view conflicts | GET /api/conflicts as regular user | 403 Forbidden | |
| TC-31 | Conflict history is persistent | Restart server, GET /api/conflicts | Conflicts still there (DB persisted) | |

---

## Frontend Test Cases

| TC# | Title | Steps | Expected | Status |
|-----|-------|--------|----------|--------|
| TC-32 | Login page renders | Visit /login | Form visible | |
| TC-33 | Register page renders | Visit /register | Form visible | |
| TC-34 | Redirect after login | Login as user | Redirected to /records | |
| TC-35 | Records list loads | Login + visit /records | Records shown | |
| TC-36 | Click record opens edit | Click on a record card | /records/:id/edit opens | |
| TC-37 | Conflict UI shown on 409 | Simulate conflict (edit same record from two tabs) | Red conflict banner appears | |
| TC-38 | Refresh & Retry works | Click "Refresh & Retry" after conflict | Latest version loads | |
| TC-39 | Admin sees Conflicts nav link | Login as admin | "Conflicts" link in navbar | |
| TC-40 | User does NOT see Conflicts nav | Login as regular user | No "Conflicts" link | |
| TC-41 | Conflict history page (admin) | Visit /conflicts as admin | Table of conflicts shown | |
| TC-42 | User redirected from /conflicts | Visit /conflicts as regular user | Redirected to /records | |
| TC-43 | Logout clears session | Click logout | Redirected to /login, token cleared | |

---

## Postman Collection — Key Requests

### Variables to set in Postman Environment:
```
base_url = http://localhost:5000/api
token = (paste JWT after login)
record_id = (paste _id of a created record)
```

### Request Bodies

**Register:**
```json
POST {{base_url}}/auth/register
{
  "username": "alice",
  "email": "alice@test.com",
  "password": "password123",
  "role": "user"
}
```

**Login:**
```json
POST {{base_url}}/auth/login
{
  "email": "alice@test.com",
  "password": "password123"
}
```

**Update Record (NO conflict):**
```json
PUT {{base_url}}/records/{{record_id}}
Headers: Authorization: Bearer {{token}}
{
  "title": "Updated Title",
  "content": "Updated content here.",
  "clientVersion": 1
}
```

**Update Record (SIMULATE CONFLICT — send old version):**
```json
PUT {{base_url}}/records/{{record_id}}
Headers: Authorization: Bearer {{token}}
{
  "title": "My stale edit",
  "content": "This should conflict.",
  "clientVersion": 1
}
// Run this AFTER a successful update has already pushed it to v2
```

---

## Summary Checklist

- [ ] All auth endpoints work correctly
- [ ] Role-based access enforced on all routes
- [ ] Conflict detected when versions mismatch
- [ ] Conflict NOT triggered on valid (correct version) updates
- [ ] Conflicts persisted in MongoDB (not in-memory)
- [ ] Frontend shows conflict banner clearly
- [ ] Admin can view conflict history
- [ ] Regular users cannot view conflict history
- [ ] Refresh & Retry flow works end-to-end
