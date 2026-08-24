# Smart Expense Tracker with Insights

Smart Expense Tracker is a full-stack personal finance web application that helps users record income and expenses,
monitor budgets, understand spending patterns, and view actionable financial insights.

### Live Demo
https://smartexpensetracker-three.vercel.app/

<img width="1910" height="915" alt="screenshot-1787579565210" src="https://github.com/user-attachments/assets/07d79312-bb71-47d7-b999-e1c5b6d7c506" />

<img width="1910" height="915" alt="image" src="https://github.com/user-attachments/assets/24b3a011-dd1f-42c3-a55a-ae0a700cb1ee" />



The application provides a centralized dashboard for personal finance tracking, combining transaction management,
budget monitoring, spending analytics, and an architecture ready for AI-powered financial insights.


### Features
1. Add income and expense transactions
2. Edit and delete transactions
3. Dashboard with income, expenses, balance, and recent transactions
4. Spending analytics and category-based visualization
5. Monthly budget tracking
6. Budget progress and overspending visibility
7. AI spending insights architecture
8. Transaction search and filtering
9. Date and category-based transaction organization
10. Responsive desktop and mobile UI
11. Modern dark interface
12. JSON data export
13. Demo data reset
14. PostgreSQL / Supabase persistence
15. Environment variables for database and AI credentials

### Tech Stack

#### Frontend
• React

• JavaScript

• CSS

• Vite

• Recharts


#### Backend
• Node.js

• Express.js

• REST API

#### Database
• PostgreSQL

• Supabase PostgreSQL

#### AI
• OpenAI/Google Gemini provider architecture

• Deployment

• Vercel

• GitHub

### How It Works
1. Open the Smart Expense Tracker dashboard.
2. Add an income or expense transaction.
3. The frontend validates and sends the transaction to the application API.
4. The Node.js + Express backend processes the request.
5. Transaction data is persisted in PostgreSQL / Supabase.
6. Dashboard totals and recent transactions are updated.
7. Analytics visualize spending by category and time period.
8. Budget tracking compares spending against configured limits.
9. The AI provider layer can generate personalized spending insights.

### Installation

#### 1. Clone the repository
git clone https://github.com/priyaskale/Smart-Expense-Tracker.git

cd Smart-Expense-Tracker
#### 2. Install dependencies
cd client

npm install

cd ../server

npm install
#### 3. Configure the backend
Create server/.env

DATABASE_URL=your_postgresql_connection_string

PORT=5000
#### 4. Start the backend
cd server

npm run dev
#### 5. Start the frontend in another terminal
cd client

npm run dev

#### Environment Variables
DATABASE_URL=your_postgresql_connection_string
PORT=5000

#### Deployment
Frontend
Vercel

Repository
GitHub

Database
PostgreSQL / Supabase

Production configuration should provide the required environment
variables through the hosting platform rather than committing secrets.

### Project Goal
Smart Expense Tracker was built to demonstrate how modern frontend development, REST APIs, relational
databases, data visualization, cloud deployment, and AI integration can be combined to solve a practical
personal-finance problem.

#### Author
Priya Kale

GitHub: https://github.com/priyaskale




