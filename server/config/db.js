import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('<username>')) {
    console.log('⚡ [Database] No MongoDB Atlas URI provided. Operating in Memory/JSON Storage Mode.');
    console.log('⚡ [Database] All CRUD, Auth, Budgets, and Insights will work seamlessly with fallback data!');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ [MongoDB Connected]: ${conn.connection.host} / Database: ${conn.connection.name}`);
    await seedMongoIfEmpty();
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB Connection Warning]: ${error.message}`);
    console.log('⚡ [Database] Switching automatically to Fallback Memory/JSON Storage Mode. App will run without failure.');
    return false;
  }
};

const seedMongoIfEmpty = async () => {
  try {
    const User = (await import('../models/User.js')).default;
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 [MongoDB] Empty database detected. Seeding initial demo student and default categories...');
      const bcrypt = (await import('bcryptjs')).default;
      const Category = (await import('../models/Category.js')).default;
      const Transaction = (await import('../models/Transaction.js')).default;
      const Budget = (await import('../models/Budget.js')).default;

      // Seed categories
      const DEFAULT_CATS = [
        { name: 'Food & Dining', color: '#f59e0b', icon: 'Utensils', isDefault: true, user_id: null },
        { name: 'Books & Study Material', color: '#3b82f6', icon: 'BookOpen', isDefault: true, user_id: null },
        { name: 'Housing & Rent', color: '#8b5cf6', icon: 'Home', isDefault: true, user_id: null },
        { name: 'Transportation', color: '#10b981', icon: 'Bus', isDefault: true, user_id: null },
        { name: 'Entertainment & Leisure', color: '#ec4899', icon: 'Film', isDefault: true, user_id: null },
        { name: 'Utilities & Internet', color: '#06b6d4', icon: 'Wifi', isDefault: true, user_id: null },
        { name: 'Healthcare & Medicine', color: '#ef4444', icon: 'HeartPulse', isDefault: true, user_id: null },
        { name: 'Personal Care & Groceries', color: '#14b8a6', icon: 'ShoppingBag', isDefault: true, user_id: null },
        { name: 'College Fees & Tech', color: '#6366f1', icon: 'Laptop', isDefault: true, user_id: null },
        { name: 'Part-Time Income & Allowance', color: '#22c55e', icon: 'Wallet', isDefault: true, user_id: null },
      ];
      await Category.deleteMany({ isDefault: true });
      const createdCats = await Category.insertMany(DEFAULT_CATS);

      // Seed demo user
      const hashedPassword = await bcrypt.hash('student123', 10);
      const demoUser = await User.create({
        name: 'Alex Johnson',
        email: 'alex@student.edu',
        password: hashedPassword,
        currency: '$',
        monthlyAllowance: 800,
        defaultMonthlyBudget: 600,
        alertThresholdWarning: 80,
        alertThresholdCritical: 100,
        spendingCategories: ['Food & Dining', 'Books & Study Material', 'Transportation', 'Entertainment & Leisure'],
      });

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const foodCat = createdCats.find((c) => c.name === 'Food & Dining');
      const booksCat = createdCats.find((c) => c.name === 'Books & Study Material');

      await Budget.create([
        {
          user_id: demoUser._id,
          category_id: null,
          category_name: 'Overall Monthly Budget',
          month: currentMonth,
          limit_amount: 600,
        },
        {
          user_id: demoUser._id,
          category_id: foodCat ? foodCat._id : null,
          category_name: 'Food & Dining',
          month: currentMonth,
          limit_amount: 220,
        },
        {
          user_id: demoUser._id,
          category_id: booksCat ? booksCat._id : null,
          category_name: 'Books & Study Material',
          month: currentMonth,
          limit_amount: 100,
        },
      ]);

      const daysAgo = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString();
      };

      await Transaction.create([
        { user_id: demoUser._id, category_name: 'Part-Time Income & Allowance', type: 'income', amount: 800, date: daysAgo(20), payment_method: 'UPI', note: 'Monthly Campus Work & Allowance' },
        { user_id: demoUser._id, category_name: 'Food & Dining', type: 'expense', amount: 35.5, date: daysAgo(1), payment_method: 'Card', note: 'Campus Cafeteria Lunch & Snacks' },
        { user_id: demoUser._id, category_name: 'Books & Study Material', type: 'expense', amount: 75.0, date: daysAgo(3), payment_method: 'Card', note: 'Algorithm & Data Structures Textbook' },
        { user_id: demoUser._id, category_name: 'Food & Dining', type: 'expense', amount: 18.25, date: daysAgo(4), payment_method: 'UPI', note: 'Groceries & Instant Noodles' },
        { user_id: demoUser._id, category_name: 'Transportation', type: 'expense', amount: 45.0, date: daysAgo(5), payment_method: 'Cash', note: 'Monthly Metro Student Pass' },
        { user_id: demoUser._id, category_name: 'Entertainment & Leisure', type: 'expense', amount: 14.99, date: daysAgo(7), payment_method: 'Card', note: 'Streaming & Music Subscription' },
        { user_id: demoUser._id, category_name: 'Food & Dining', type: 'expense', amount: 62.0, date: daysAgo(9), payment_method: 'UPI', note: 'Weekend Dinner with Study Group' },
        { user_id: demoUser._id, category_name: 'Utilities & Internet', type: 'expense', amount: 30.0, date: daysAgo(12), payment_method: 'UPI', note: 'Dorm Wi-Fi Share' },
        { user_id: demoUser._id, category_name: 'Personal Care & Groceries', type: 'expense', amount: 28.5, date: daysAgo(14), payment_method: 'Cash', note: 'Toiletries and Laundry' },
        { user_id: demoUser._id, category_name: 'Food & Dining', type: 'expense', amount: 42.0, date: daysAgo(16), payment_method: 'Card', note: 'Grocery haul from supermarket' },
      ]);

      console.log('✅ [MongoDB] Initial demo student data seeded successfully in Atlas!');
    }
  } catch (err) {
    console.warn('⚠️ [MongoDB Seeding Warning]:', err.message);
  }
};

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};
