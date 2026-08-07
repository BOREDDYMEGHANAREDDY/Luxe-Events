// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/User');

// ─── Setup / Teardown ─────────────────────────────────────────────
beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/luxeevents_test';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await User.deleteMany({});
});

// ─── Helper ───────────────────────────────────────────────────────
const registerUser = (overrides = {}) =>
  request(app).post('/api/auth/register').send({
    firstName: 'Test',
    lastName:  'User',
    email:     'test@luxeevents.com',
    password:  'Test@1234',
    phone:     '+91 9876543210',
    ...overrides,
  });

// ════════════════════════════════════════════════════════════════
// AUTH TESTS
// ════════════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  it('should register a new user and return 201 with token', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@luxeevents.com');
    expect(res.body.user.role).toBe('user');
  });

  it('should reject duplicate email with 400', async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('should reject missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => { await registerUser(); });

  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@luxeevents.com', password: 'Test@1234',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject wrong password with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@luxeevents.com', password: 'WrongPass',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-existent email with 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com', password: 'Test@1234',
    });
    expect(res.status).toBe(401);
  });

  it('should reject empty body with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user with valid token', async () => {
    const reg = await registerUser();
    const { token } = reg.body;
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('test@luxeevents.com');
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('should return 404 for non-existent email', async () => {
    const res = await request(app).post('/api/auth/forgot-password')
      .send({ email: 'nobody@test.com' });
    expect(res.status).toBe(404);
  });
});

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════
describe('GET /api/health', () => {
  it('should return 200 with API status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});

// ════════════════════════════════════════════════════════════════
// EVENTS TESTS
// ════════════════════════════════════════════════════════════════
describe('GET /api/events', () => {
  it('should return event list with 200', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should filter by category', async () => {
    const res = await request(app).get('/api/events?category=wedding');
    expect(res.status).toBe(200);
    res.body.data.forEach(e => expect(e.category).toBe('wedding'));
  });

  it('should support pagination', async () => {
    const res = await request(app).get('/api/events?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });
});

// ════════════════════════════════════════════════════════════════
// VENUES TESTS
// ════════════════════════════════════════════════════════════════
describe('GET /api/venues', () => {
  it('should return venue list', async () => {
    const res = await request(app).get('/api/venues');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should filter by city', async () => {
    const res = await request(app).get('/api/venues?city=Mumbai');
    expect(res.status).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════════
// BOOKINGS TESTS (requires auth)
// ════════════════════════════════════════════════════════════════
describe('Booking routes (authenticated)', () => {
  let token;

  beforeEach(async () => {
    const reg = await registerUser();
    token = reg.body.token;
  });

  it('should return empty bookings for new user', async () => {
    const res = await request(app).get('/api/bookings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('should require auth for bookings', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════════
// TESTIMONIALS TESTS
// ════════════════════════════════════════════════════════════════
describe('GET /api/testimonials', () => {
  it('should return approved testimonials', async () => {
    const res = await request(app).get('/api/testimonials');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// GALLERY TESTS
// ════════════════════════════════════════════════════════════════
describe('GET /api/gallery', () => {
  it('should return gallery items', async () => {
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should filter by type', async () => {
    const res = await request(app).get('/api/gallery?type=image');
    expect(res.status).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════════
// AI PLANNER TESTS
// ════════════════════════════════════════════════════════════════
describe('AI Planner endpoints', () => {
  it('POST /api/ai/recommendations should return plan', async () => {
    const res = await request(app).post('/api/ai/recommendations').send({
      eventType:  'wedding',
      guestCount: 150,
      budget:     1000000,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.budgetBreakdown).toBeDefined();
    expect(res.body.data.decoration).toBeDefined();
    expect(res.body.data.timeline).toBeDefined();
  });

  it('GET /api/ai/budget-estimate should return estimate', async () => {
    const res = await request(app).get('/api/ai/budget-estimate?eventType=wedding&guestCount=100&luxuryLevel=mid');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
// CONTACT TESTS
// ════════════════════════════════════════════════════════════════
describe('POST /api/contact', () => {
  it('should accept valid contact form', async () => {
    const res = await request(app).post('/api/contact').send({
      name:    'Test Client',
      email:   'client@test.com',
      subject: 'Wedding Inquiry',
      message: 'I am interested in planning a royal wedding.',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject incomplete contact form', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Test',
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ════════════════════════════════════════════════════════════════
// 404 HANDLER
// ════════════════════════════════════════════════════════════════
describe('Unknown routes', () => {
  it('should return 404 for unknown route', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
