import express from 'express';
import {
  generateInsights,
  submitFeedback,
} from '../controllers/insightController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateInsights);
router.post('/feedback', submitFeedback);

export default router;
