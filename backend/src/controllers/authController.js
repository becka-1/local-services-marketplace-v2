import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';
import { sendVerificationEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_dev';
const JWT_EXPIRES_IN = '7d';

// In-memory store for pending registrations
// Structure: { [email]: { email, passwordHash, name, phone, code, expiresAt } }
const pendingRegistrations = new Map();

export const registerRequest = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address format." });
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store in memory
    pendingRegistrations.set(email, {
      email,
      passwordHash,
      name,
      phone,
      code,
      expiresAt
    });

    // Send email
    const emailSent = await sendVerificationEmail(email, code, 'email');
    
    if (!emailSent) {
      pendingRegistrations.delete(email);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Registration Request Error:', error);
    res.status(500).json({ message: 'Server error during registration request.' });
  }
};

export const registerConfirm = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const pendingUser = pendingRegistrations.get(email);

    if (!pendingUser) {
      return res.status(400).json({ message: "No pending registration found for this email, or it has expired." });
    }

    if (Date.now() > pendingUser.expiresAt) {
      pendingRegistrations.delete(email);
      return res.status(400).json({ message: "Verification code has expired. Please sign up again." });
    }

    if (pendingUser.code !== code) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    // Check if user already exists just in case they registered while pending
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      pendingRegistrations.delete(email);
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // Start a transaction since we insert into users and profiles
    await db.query('BEGIN');

    const userResult = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at',
      [pendingUser.email, pendingUser.passwordHash]
    );

    const newUser = userResult.rows[0];

    // Create the profile and set email_verified = true
    await db.query(
      'INSERT INTO profiles (user_id, name, phone, email, email_verified) VALUES ($1, $2, $3, $4, true)',
      [newUser.id, pendingUser.name, pendingUser.phone, pendingUser.email]
    );

    await db.query('COMMIT');

    // Clean up
    pendingRegistrations.delete(email);

    // Create JWT
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set HTTP-Only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: pendingUser.name,
        role: newUser.role,
      }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Registration Confirm Error:', error);
    res.status(500).json({ message: 'Server error during registration confirmation.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find the user
    const userResult = await db.query(
      `SELECT u.*, p.name, p.profile_picture IS NOT NULL AS has_profile_picture
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.email = $1`, 
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Set HTTP-Only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        has_profile_picture: user.has_profile_picture
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    // The verifyToken middleware already placed user info on req.user
    const userId = req.user.id;

    const userResult = await db.query(
      `SELECT u.id, u.email, u.role, p.name, p.profile_picture IS NOT NULL AS has_profile_picture
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = $1`, 
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
};
