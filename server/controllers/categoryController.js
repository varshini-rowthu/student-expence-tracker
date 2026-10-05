import Category from '../models/Category.js';
import { isMongoConnected } from '../config/db.js';
import { memoryStore } from '../config/dataStore.js';

// @desc    Get all available categories (default + user custom)
// @route   GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isMongoConnected()) {
      let categories = await Category.find({
        $or: [{ user_id: null }, { user_id: userId }],
      }).sort({ isDefault: -1, name: 1 });

      // If empty in MongoDB, seed default categories
      if (categories.length === 0) {
        const defaults = memoryStore.categories.filter((c) => c.isDefault);
        const seeded = await Category.insertMany(
          defaults.map((d) => ({
            name: d.name,
            color: d.color,
            icon: d.icon,
            isDefault: true,
            user_id: null,
          }))
        );
        categories = seeded;
      }

      return res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully.',
        data: categories,
      });
    } else {
      const categories = memoryStore.getCategories(userId);
      return res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully.',
        data: categories,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a custom category (FR3)
// @route   POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, color, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid category name.',
        data: null,
      });
    }

    if (isMongoConnected()) {
      const newCategory = await Category.create({
        name: name.trim(),
        color: color || '#6366f1',
        icon: icon || 'Tag',
        isDefault: false,
        user_id: userId,
      });

      return res.status(201).json({
        success: true,
        message: 'Custom category created successfully.',
        data: newCategory,
      });
    } else {
      const newCategory = memoryStore.createCategory({
        name: name.trim(),
        color: color || '#6366f1',
        icon: icon || 'Tag',
        user_id: userId,
      });

      return res.status(201).json({
        success: true,
        message: 'Custom category created successfully.',
        data: newCategory,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom category
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (isMongoConnected()) {
      const cat = await Category.findOne({ _id: id, user_id: userId });
      if (!cat) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or default categories cannot be removed.',
          data: null,
        });
      }
      await Category.findByIdAndDelete(id);
    } else {
      const deleted = memoryStore.deleteCategory(id, userId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or default categories cannot be removed.',
          data: null,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Custom category removed successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
