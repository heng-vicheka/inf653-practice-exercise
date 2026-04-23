require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const upload = multer();

// Middleware
app.use(cors({ 
  origin: FRONTEND_URL, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser()); // Required for csurf

// Session Configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// In-memory storage (Mock seeding)
const users = [
  {
    username: 'photolover',
    password: bcrypt.hashSync('password123', 10)
  }
];
const phoneBooks = [
  {
    id: 1,
    username: 'photolover',
    name: 'John Doe',
    address: '123 Main St, City, State 12345',
    phoneNumber: '(555) 123-4567',
    timestamp: new Date()
  }
];

// Session Middleware
const authenticateSession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: No session' });
  }
};

// CSRF Token Route
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const existingUser = users.find(u => u.username === username);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User created' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = { username };
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'No active session' });
  }
});

// Feed Route
app.get('/api/feed', (req, res) => {
  res.json(phoneBooks);
});

// Profile Route
app.get('/api/profile/:username', (req, res) => {
  const { username } = req.params;
  const userPhoneBooks = phoneBooks.filter(p => p.username === username);
  res.json({
    username,
    phoneBooks: userPhoneBooks,
    phoneBookCount: userPhoneBooks.length
  });
});

// Upload Route
app.post('/api/upload', authenticateSession, upload.none(), (req, res) => {
  const { name, address, phoneNumber } = req.body || {};
  if (!name || !address || !phoneNumber) {
    return res.status(400).json({ message: 'Name, address, and phone number are required' });
  }

  const newPhoneBook = {
    id: phoneBooks.length + 1,
    username: req.session.user.username,
    name,
    address,
    phoneNumber,
    timestamp: new Date(),
  };

  phoneBooks.unshift(newPhoneBook);
  res.status(201).json(newPhoneBook);
});

app.post('/api/delete/:id', authenticateSession, (req, res) => {
  const { id } = req.params;
  const phoneBookIndex = phoneBooks.findIndex(p => p.id === parseInt(id) && p.username === req.session.user.username);
  if (phoneBookIndex !== -1) {
    phoneBooks.splice(phoneBookIndex, 1);
    res.json({ message: 'Phone Book deleted' });
  }
  else {
    res.status(404).json({ message: 'Phone Book not found or unauthorized' });
  }
});

// Error handling for CSRF errors
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({ message: 'Invalid CSRF token' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
