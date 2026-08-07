# 📡 Luxe Events — REST API Documentation

Base URL: `http://localhost:5000/api`

All authenticated requests must include:
```
Authorization: Bearer <jwt_token>
```

All responses follow:
```json
{ "success": true|false, "message": "...", "data": {} }
```

---

## 🔐 Authentication

### POST /auth/register
Register a new user account.

**Body:**
```json
{
  "firstName": "Priya",
  "lastName":  "Sharma",
  "email":     "priya@example.com",
  "password":  "Test@1234",
  "phone":     "+91 9876543210"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "token":   "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id":        "64a1b2c3d4e5f6789",
    "firstName": "Priya",
    "email":     "priya@example.com",
    "role":      "user"
  }
}
```

---

### POST /auth/login

**Body:**
```json
{ "email": "priya@example.com", "password": "Test@1234" }
```

**Response 200:** Same as register.

**Errors:** 401 Invalid credentials | 423 Account locked

---

### POST /auth/forgot-password

**Body:** `{ "email": "priya@example.com" }`

**Response 200:** `{ "success": true, "message": "Reset link sent" }`

---

### PUT /auth/reset-password/:token

**Body:** `{ "password": "NewPass@1234" }`

---

### GET /auth/verify-email/:token

Verifies email address from the link sent on registration.

---

### GET /auth/me 🔒

Returns current authenticated user.

---

### PUT /auth/update-profile 🔒

**Body:** `{ "firstName", "lastName", "phone", "address" }`

---

### PUT /auth/change-password 🔒

**Body:** `{ "currentPassword", "newPassword" }`

---

## 🎉 Events

### GET /events

**Query params:**
| Param    | Type   | Description                          |
|----------|--------|--------------------------------------|
| category | string | wedding, corporate, birthday, etc.   |
| featured | bool   | Filter featured only                 |
| search   | string | Title / tag search                   |
| page     | number | Default 1                            |
| limit    | number | Default 12                           |
| sort     | string | MongoDB sort string, e.g. -createdAt |

**Response 200:**
```json
{
  "success": true,
  "total": 25,
  "page":  1,
  "data":  [ { "title": "Royal Wedding", "basePrice": 250000, ... } ]
}
```

---

### GET /events/:slug

Returns single event with packages and linked venues.

---

### POST /events 🔒 Admin

Create a new event.

**Body:** Full event object (see Event schema).

---

### PUT /events/:id 🔒 Admin

Update an existing event.

---

### DELETE /events/:id 🔒 Admin

Soft-deletes (sets `isActive: false`).

---

## 🏛 Venues

### GET /venues

**Query params:** `type`, `city`, `minCapacity`, `maxCapacity`, `featured`, `page`, `limit`

---

### GET /venues/:slug

Single venue with full details.

---

### GET /venues/:id/availability?date=YYYY-MM-DD

Returns `{ available: true|false }`.

---

### POST /venues 🔒 Admin

Create venue.

---

### PUT /venues/:id 🔒 Admin

Update venue.

---

## 📋 Bookings

All booking routes require authentication.

### POST /bookings 🔒

Create a new booking.

**Body:**
```json
{
  "eventId":    "64a1b2c3d4e5f6789",
  "venueId":    "64a1b2c3d4e5f6790",
  "packageName": "Gold",
  "eventDate":  "2025-12-15T00:00:00.000Z",
  "eventTime":  "10:00 AM",
  "guestCount": 150,
  "catering":   { "required": true, "type": "veg", "mealsPerDay": 3 },
  "decoration": { "style": "luxury", "theme": "Royal Garden" },
  "specialRequirements": "Wheelchair accessible setup needed",
  "contactDetails": { "name": "Priya", "phone": "+91 9876543210", "email": "priya@example.com" }
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "bookingId":   "LXE2512ABCD",
    "status":      "pending",
    "pricing":     { "totalAmount": 589000, "taxAmount": 90000 }
  }
}
```

---

### GET /bookings 🔒

Returns all bookings for the current user.

---

### GET /bookings/:id 🔒

Single booking. Users can only see their own.

---

### PUT /bookings/:id/cancel 🔒

**Body:** `{ "reason": "Change of plans" }`

---

### GET /bookings/check-availability?eventDate=&venueId=

Returns `{ available: true|false, bookingsOnDate: 0 }`.

---

### GET /bookings/calculate?eventId=&guestCount=&packageName=&venueId=&catering=

Returns full pricing breakdown before booking.

---

## 💳 Payments

### POST /payments/create-order 🔒

**Body:** `{ "bookingId": "...", "paymentType": "advance"|"full" }`

**Response:**
```json
{
  "data": {
    "orderId":  "order_xxxxxxxxxxxx",
    "amount":   176700,
    "currency": "INR",
    "keyId":    "rzp_test_xxx",
    "prefill":  { "name": "Priya", "email": "priya@example.com" }
  }
}
```

Pass `orderId` and `keyId` to Razorpay checkout SDK.

---

### POST /payments/verify 🔒

Called after Razorpay payment completes. Verifies HMAC signature.

**Body:**
```json
{
  "razorpay_order_id":   "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature":  "abc123...",
  "paymentDbId":         "64a1b2...",
  "bookingId":           "64a1b2..."
}
```

---

### GET /payments/history 🔒

All payments for the current user.

---

### GET /payments/:id/invoice 🔒

Returns full invoice data for download/display.

---

## 🤖 AI Planner

### POST /ai/recommendations

**Body:**
```json
{
  "eventType":  "wedding",
  "guestCount": 150,
  "budget":     1000000,
  "date":       "2025-12-15",
  "preferences": []
}
```

Returns: packages, venues, decoration, budget breakdown, timeline, tips.

---

### GET /ai/budget-estimate?eventType=&guestCount=&luxuryLevel=budget|mid|premium|luxury&includeFood=true

Returns per-category budget estimate.

---

## 🖼 Gallery

### GET /gallery?category=&type=image|video&featured=&page=&limit=

---

### POST /gallery 🔒 Admin

**Body:** `{ "url", "title", "category", "type", "isFeatured" }`

---

## ⭐ Testimonials

### GET /testimonials

Returns approved, public testimonials.

---

### POST /testimonials 🔒

Submit a new review (requires auth, pending approval).

---

## 📬 Contact

### POST /contact

**Body:**
```json
{
  "name":       "Ananya Kapoor",
  "email":      "ananya@example.com",
  "phone":      "+91 9876543210",
  "subject":    "Royal Wedding Inquiry",
  "message":    "I want to plan a 500-person wedding...",
  "eventType":  "wedding",
  "eventDate":  "2025-12-20",
  "guestCount": 500,
  "budget":     5000000
}
```

---

## 🛡 Admin (all require admin role)

### GET /admin/dashboard

Returns: stats (users, bookings, revenue), charts (monthly revenue, booking status pie, top events).

---

### GET /admin/bookings?page=&limit=&status=&search=

All bookings with pagination.

---

### PUT /admin/bookings/:id/status

**Body:** `{ "status": "confirmed", "adminNotes": "..." }`

---

### GET /admin/users?page=&limit=&search=&role=

---

### PUT /admin/users/:id/toggle-active

Toggle user active/inactive.

---

### GET /admin/contacts

All contact inquiries.

---

### PUT /admin/testimonials/:id/approve

**Body:** `{ "isFeatured": true }`

---

### GET /admin/revenue?year=2025

Full revenue breakdown by month and category.

---

## ❌ Error Codes

| Code | Meaning                        |
|------|--------------------------------|
| 400  | Bad request / validation error |
| 401  | Unauthorized — no/invalid token|
| 403  | Forbidden — insufficient role  |
| 404  | Resource not found             |
| 423  | Account locked                 |
| 429  | Rate limit exceeded            |
| 500  | Internal server error          |

---

## 🔒 Rate Limits

- Global: 100 requests per 15 minutes
- Login: 10 attempts per 15 minutes
- Register: 10 attempts per 15 minutes

---

## 📦 Pagination

All list endpoints support:
```
?page=1&limit=12
```

Response includes:
```json
{ "total": 100, "page": 1, "data": [...] }
```
