# FSD-47 — Bug Log

> Record all bugs you encounter during development and testing here.

---

## Bug Template
```
BUG-XXX
Date: 
Title: 
Severity: Critical / Major / Minor
Status: Open / Fixed / Won't Fix

Steps to Reproduce:
1. 
2. 

Expected Behavior:

Actual Behavior:

Root Cause:

Fix Applied:
```

---

## Bugs Found

### BUG-001
**Date:** [Fill in]  
**Title:** `clientVersion` missing from update request causes 400 error  
**Severity:** Major  
**Status:** Fixed  

**Steps to Reproduce:**
1. Send PUT /api/records/:id without `clientVersion` in body

**Expected:** Helpful error message  
**Actual:** Generic 400 error  
**Root Cause:** No validation check for missing clientVersion  
**Fix Applied:** Added explicit check: `if (clientVersion === undefined) return 400`

---

### BUG-002
**Date:** [Fill in]  
**Title:** JWT not attached to requests after page refresh  
**Severity:** Critical  
**Status:** Fixed  

**Steps to Reproduce:**
1. Login successfully
2. Hard refresh the page
3. Try to fetch records

**Expected:** Records load normally (token persists in localStorage)  
**Actual:** [Observe behavior]  
**Root Cause:** Axios interceptor reads localStorage correctly, but AuthContext useEffect re-checks on mount  
**Fix Applied:** AuthContext useEffect reads token from localStorage and calls /auth/me to re-hydrate user

---

### BUG-003
**Date:** [Fill in]  
**Title:** [Your bug here]  
**Severity:**  
**Status:**  

**Steps to Reproduce:**

**Expected:**  
**Actual:**  
**Root Cause:**  
**Fix Applied:**

---

_Add more as you find them during testing_
