# Student Expense Tracker (PathPilot)
> **AI-Assisted Personal Finance & Monthly Budgeting Platform for Students**  
> *Built strictly in accordance with the attached Software Requirements Specification (SRS) & High-Level Design (HLD).*

---

## 1. Project Overview & SRS Summary
The **Student Expense Tracker** is an intelligent, full-stack personal finance web application designed to help university students record expenditures and allowances, manage monthly budgets, and understand their financial patterns through visual trends and rule-based AI spending insights.

### Core Problems Solved:
- Eliminates manual, fragmented expense notes.
- Automates monthly budget evaluation with proactive **80% warning** and **100% critical overrun** alerts.
- Provides plain-language AI observations comparing week-on-week velocity without any paid API keys or recurring charges.
- Implements adaptive feedback learning: dismissing an insight trains future suggestions.

---

## 2. 5 Core Features (Mapped Directly to SRS Section 3)

| # | Feature Name | SRS Requirement ID | Description |
|---|--------------|--------------------|-------------|
| **1** | **User Authentication & Profile Onboarding** | **FR1 & FR2** | Secure JWT authentication (Register, Login, Password Reset), onboarding wizard, currency customization ($, ₹, €, £), monthly allowance tracking, and GDPR-compliant account/data deletion. |
| **2** | **Expense & Income Recording with CSV Export** | **FR3** | Transaction ledger supporting both Expenses and Income, default and custom categories, multi-criteria filtering (date range, category, payment method: UPI/Cash/Card), and instant CSV data export. |
| **3** | **Monthly Budget Tracking & Alerting** | **FR4** | Overall monthly budget limits and per-category envelopes. Dynamic calculation of percentage used, remaining balance, and days remaining in the month with automated 80% & 100% alert states. |
| **4** | **Interactive Dashboard & Spending Trends** | **FR5** | Real-time totals for Today, This Week, and This Month. Interactive Recharts donut expense breakdown, 7-day spending velocity area chart, and 8 most recent transactions feed. |
| **5** | **AI-Driven Insights & Adaptive Feedback Learning** | **FR6 & FR7** | Rule-based Mock AI engine simulating LLM analysis (with realistic 800ms latency) determining dominant spending categories, week-on-week shifts, and budget burn mitigation tips. Dismissal feedback mechanism (not useful, incorrect, already known) ensures tips adapt. |

---

## 3. SRS Traceability Matrix

| SRS Requirement ID | Requirement Name | Implemented As | API Endpoint | Frontend Page / Component |
|--------------------|------------------|----------------|--------------|---------------------------|
| **FR1** | User Authentication | JWT Token Auth & Password Hash | `POST /api/auth/register`<br>`POST /api/auth/login`<br>`POST /api/auth/forgot-password` | `/login`<br>`/register` |
| **FR2** | User Profile Management | Currency, Allowance, Budget, GDPR Deletion | `GET /api/auth/me`<br>`PUT /api/auth/profile`<br>`DELETE /api/auth/account` | `/profile`<br>`OnboardingModal.jsx` |
| **FR3** | Expense and Income Recording | Ledger CRUD, Filters, Custom Categories, CSV | `GET /api/transactions`<br>`POST /api/transactions`<br>`PUT /api/transactions/:id`<br>`DELETE /api/transactions/:id`<br>`GET /api/transactions/export/csv`<br>`GET /api/categories`<br>`POST /api/categories` | `/transactions`<br>`TransactionModal.jsx` |
| **FR4** | Budget Tracking and Evaluation | Envelopes, % Used, 80% & 100% Thresholds, Days Left | `GET /api/budgets`<br>`POST /api/budgets`<br>`DELETE /api/budgets/:id` | `/budgets`<br>`BudgetModal.jsx`<br>`BudgetProgressBar.jsx` |
| **FR5** | Dashboard and Report Output | Today/Week/Month stats, Recharts Trends & Pie | `GET /api/dashboard` | `/dashboard`<br>`SpendingTrendChart.jsx`<br>`CategoryPieChart.jsx` |
| **FR6** | AI-Based Spending Insights | Dominant spend driver, Week-on-week, Burn rate tips | `POST /api/insights/generate` | `/reports`<br>`aiService.js` |
| **FR7** | Feedback Learning | Dismissal reasoning (not useful, incorrect, already known) | `POST /api/insights/feedback` | `/reports`<br>`FeedbackModal.jsx` |

---

## 4. Tech Stack (Strictly 100% Free Tier Only)

### Frontend:
- **Framework**: React.js 19 + Vite 8
- **Styling**: Tailwind CSS (Sleek dark mode, glassmorphism, responsive)
- **Routing**: React Router DOM
- **Charts**: Recharts (Donut PieChart, AreaChart for spending velocity)
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT Bearer Interceptors

### Backend:
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Free Tier M0) with **Dual-Mode In-Memory / JSON File Fallback** in `server/config/dataStore.js`
- **Security**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`) + CORS + Dotenv

### AI Implementation:
- **No Paid API Key, No Billing, No Credit Card Required**:
  Implements `client/src/services/aiService.js` and `server/controllers/insightController.js` using a deterministic, rule-based Mock AI engine returning structured JSON with an **800ms simulated processing delay**. If the backend or AI provider is unreachable, graceful degradation ensures the entire application remains fully operational.

---

## 5. Folder Structure

```
mern stack/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Charts/
│   │   │   │   ├── BudgetProgressBar.jsx
│   │   │   │   ├── CategoryPieChart.jsx
│   │   │   │   └── SpendingTrendChart.jsx
│   │   │   ├── BudgetModal.jsx
│   │   │   ├── FeedbackModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OnboardingModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── TransactionModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── BudgetsPage.jsx        (FR4)
│   │   │   ├── DashboardPage.jsx      (FR5)
│   │   │   ├── LandingPage.jsx        (SRS Intro)
│   │   │   ├── LoginPage.jsx          (FR1)
│   │   │   ├── ProfilePage.jsx        (FR2)
│   │   │   ├── RegisterPage.jsx       (FR1)
│   │   │   ├── ReportsPage.jsx        (FR6 & FR7)
│   │   │   └── TransactionsPage.jsx   (FR3)
│   │   ├── services/
│   │   │   ├── aiService.js           (FR6 & FR7 Mock AI)
│   │   │   └── api.js                 (Axios Instance)
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/
│   │   ├── dataStore.js               (In-memory / JSON fallback with demo data)
│   │   └── db.js                      (MongoDB Atlas connector + auto-fallback)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   ├── insightController.js
│   │   └── transactionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Budget.js
│   │   ├── Category.js
│   │   ├── InsightFeedback.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── insightRoutes.js
│   │   └── transactionRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .env.example
├── package.json
├── run-dev.js
├── README.md
└── SRS_Document.pdf
```

---

## 6. How the Dual-Mode Database Fallback Works
To guarantee that student evaluations and presentations **never fail** due to missing database credentials:
1. `server/config/db.js` checks if `MONGO_URI` is provided in `.env`.
2. If provided, it connects to MongoDB Atlas via Mongoose.
3. If absent or invalid, it immediately switches to `server/config/dataStore.js`, which handles all CRUD, Auth, and Budget operations seamlessly using an in-memory & file-persisted JSON store pre-seeded with realistic sample student transactions.

---

## 7. How to Run Locally

### Quick Start:
```bash
# 1. Install dependencies for all folders
npm run install-all

# 2. Start both server and client concurrently
npm run dev
```

### Or run individually:
**Terminal 1 (Backend):**
```bash
cd server
npm install
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 8. Demo Student Credentials
To test all features immediately without registering:
- **Email:** `alex@student.edu`
- **Password:** `student123`
*(Or click the 1-click **"Auto-Fill Demo Student Account"** button on the Login page).*

---

## 9. Deployment Guide

### Deploying Frontend to Vercel:
1. Push this repository to GitHub.
2. Link the repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `client`.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://your-backend.onrender.com/api`).
5. Click **Deploy**.

### Deploying Backend to Render (Free Tier):
1. Create a new Web Service on [Render](https://render.com).
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Any 32-character random string
   - `MONGO_URI`: (Optional) Your MongoDB Atlas connection string. If omitted, the server operates in robust JSON fallback mode.
   - `CLIENT_URL`: Your Vercel frontend URL.
6. Click **Deploy**.
