import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_jwt_key_pathpilot_student_expense_tracker_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new student user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, currency, monthlyAllowance, defaultMonthlyBudget, alertThresholdWarning, alertThresholdCritical, spendingCategories } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
        data: null,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
        data: null,
      });
    }

    if (isMongoConnected()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
          data: null,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        currency: currency || '$',
        monthlyAllowance: Number(monthlyAllowance) || 0,
        defaultMonthlyBudget: Number(defaultMonthlyBudget) || 0,
        alertThresholdWarning: Number(alertThresholdWarning) || 80,
        alertThresholdCritical: Number(alertThresholdCritical) || 100,
        spendingCategories: spendingCategories || [],
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: 'Student account registered successfully.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            currency: user.currency,
            monthlyAllowance: user.monthlyAllowance,
            defaultMonthlyBudget: user.defaultMonthlyBudget,
            alertThresholdWarning: user.alertThresholdWarning,
            alertThresholdCritical: user.alertThresholdCritical,
            spendingCategories: user.spendingCategories,
          },
          token,
        },
      });
    } else {
      // Memory Store Fallback
      const existing = memoryStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
          data: null,
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = memoryStore.createUser({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        currency: currency || '$',
        monthlyAllowance: Number(monthlyAllowance) || 0,
        defaultMonthlyBudget: Number(defaultMonthlyBudget) || 0,
        alertThresholdWarning: Number(alertThresholdWarning) || 80,
        alertThresholdCritical: Number(alertThresholdCritical) || 100,
        spendingCategories: spendingCategories || [],
      });

      const token = generateToken(newUser.id);
      const { password: _, ...safeUser } = newUser;

      return res.status(201).json({
        success: true,
        message: 'Student account registered successfully.',
        data: {
          user: safeUser,
          token,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Log in student user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
        data: null,
      });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          data: null,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          data: null,
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            currency: user.currency,
            monthlyAllowance: user.monthlyAllowance,
            defaultMonthlyBudget: user.defaultMonthlyBudget,
            alertThresholdWarning: user.alertThresholdWarning,
            alertThresholdCritical: user.alertThresholdCritical,
            spendingCategories: user.spendingCategories,
          },
          token,
        },
      });
    } else {
      // Memory Store Fallback
      const user = memoryStore.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          data: null,
        });
      }

      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          data: null,
        });
      }

      const token = generateToken(user.id);
      const { password: _, ...safeUser } = user;

      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: safeUser,
          token,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile & settings (FR2)
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, currency, monthlyAllowance, defaultMonthlyBudget, alertThresholdWarning, alertThresholdCritical, spendingCategories } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (currency !== undefined) updates.currency = currency;
    if (monthlyAllowance !== undefined) updates.monthlyAllowance = Number(monthlyAllowance);
    if (defaultMonthlyBudget !== undefined) updates.defaultMonthlyBudget = Number(defaultMonthlyBudget);
    if (alertThresholdWarning !== undefined) updates.alertThresholdWarning = Number(alertThresholdWarning);
    if (alertThresholdCritical !== undefined) updates.alertThresholdCritical = Number(alertThresholdCritical);
    if (spendingCategories !== undefined) updates.spendingCategories = spendingCategories;

    if (isMongoConnected()) {
      const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
      return res.status(200).json({
        success: true,
        message: 'Student profile updated successfully.',
        data: updatedUser,
      });
    } else {
      const updatedUser = memoryStore.updateUser(userId, updates);
      const { password: _, ...safeUser } = updatedUser;
      return res.status(200).json({
        success: true,
        message: 'Student profile updated successfully.',
        data: safeUser,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student user account and all data (FR2)
// @route   DELETE /api/auth/account
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isMongoConnected()) {
      // Import other models to cascade delete
      const Transaction = (await import('../models/Transaction.js')).default;
      const Budget = (await import('../models/Budget.js')).default;
      const Category = (await import('../models/Category.js')).default;
      const InsightFeedback = (await import('../models/InsightFeedback.js')).default;

      await Transaction.deleteMany({ user_id: userId });
      await Budget.deleteMany({ user_id: userId });
      await Category.deleteMany({ user_id: userId });
      await InsightFeedback.deleteMany({ user_id: userId });
      await User.findByIdAndDelete(userId);
    } else {
      memoryStore.deleteUser(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Student account and all associated financial records permanently deleted.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Password reset request (FR1)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    return res.status(200).json({
      success: true,
      message: `Password reset instructions have been generated for ${email || 'your account'}. In production, this dispatches a secure reset link.`,
      data: { resetToken: 'mock-reset-token-' + Date.now() },
    });
  } catch (error) {
    next(error);
  }
};
