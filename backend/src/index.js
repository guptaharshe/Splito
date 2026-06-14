const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'splito-api',
  });
});

// Routes
const authRoutes = require('./routes/auth');
const groupsRoutes = require('./routes/groups');
const expensesRoutes = require('./routes/expenses');
const balancesRoutes = require('./routes/balances');
const settlementsRoutes = require('./routes/settlements');

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api', expensesRoutes); // Expenses are both group-scoped (/api/groups/:id/expenses) and global (/api/expenses/:id)
app.use('/api', balancesRoutes); // Balances are group-scoped (/api/groups/:id/balances)
app.use('/api', settlementsRoutes); // Settlements are group-scoped and global

// Start server
app.listen(PORT, () => {
  console.log(`Splito API running on http://localhost:${PORT}`);
});
