import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_jwt_key_pathpilot_student_expense_tracker_2026');

    if (isMongoConnected()) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists in database.',
          data: null,
        });
      }
      req.user = user;
    } else {
      const user = memoryStore.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found in session memory.',
          data: null,
        });
      }
      // Omit password
      const { password, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session token expired or invalid. Please log in again.',
      data: null,
    });
  }
};
