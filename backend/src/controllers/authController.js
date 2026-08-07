const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const logger = require('../utils/logger');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateJWT();
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    }
  });
};

// ─── POST /api/auth/register ────────────────────────────────────
exports.register = async (req, res) => {

  const { firstName, lastName, email, password, phone } = req.body;

  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Email already registered"
    });
  }

  // Create user
const user = await User.create({
  firstName,
  lastName,
  email,
  password,
  phone
});

const verificationToken = user.generateEmailVerificationToken();

await user.save({ validateBeforeSave: false });

const verifyURL =
`${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

await sendEmail({
  to: user.email,
  subject: "Verify Your Luxe Events Account",
  html: `
    <h2>Welcome ${user.firstName}!</h2>

    <p>Thank you for registering with <b>Luxe Events</b>.</p>

    <p>Please verify your email by clicking the button below.</p>

    <p>
      <a href="${verifyURL}"
         style="
           background:#B8960C;
           color:white;
           padding:12px 24px;
           border-radius:6px;
           text-decoration:none;
           display:inline-block;">
         Verify Email
      </a>
    </p>

    <p>This link expires in 24 hours.</p>
  `
});

sendTokenResponse(
  user,
  201,
  res,
  "Account created successfully. Please verify your email."
);

};
// ─── POST /api/auth/login ───────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.isLocked()) {
    return res.status(423).json({ success: false, message: 'Account locked. Try again in 15 minutes.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000;
      user.loginAttempts = 0;
    }
    await user.save({ validateBeforeSave: false });
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
};

// ─── POST /api/auth/forgot-password ────────────────────────────
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account found with that email' });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Luxe Events — Password Reset Request',
      template: 'passwordReset',
      data: { name: user.firstName, resetURL, expiresIn: '1 hour' }
    });
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    logger.error(`Password reset email failed: ${err.message}`);
    res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
};

// ─── PUT /api/auth/reset-password/:token ───────────────────────
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
};

// ─── GET /api/auth/verify-email/:token ─────────────────────────
exports.verifyEmail = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Email verified successfully! You can now login.' });
};

// ─── GET /api/auth/me ──────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};

// ─── PUT /api/auth/update-profile ─────────────────────────────
exports.updateProfile = async (req, res) => {
  const { firstName, lastName, phone, address, preferences } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstName, lastName, phone, address, preferences },
    { new: true, runValidators: true }
  );
  res.json({ success: true, message: 'Profile updated', data: user });
};

// ─── PUT /api/auth/change-password ────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res, 'Password changed successfully');
};
