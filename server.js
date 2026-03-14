// server.js
const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory data (hackathon)
let transactions = [];
let budgets = [];

// GET all transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// POST new transaction
app.post('/api/transactions', (req, res) => {
  const { date, amount, category, description } = req.body;

  if (!date || amount == null || !category) {
    return res.status(400).json({ error: 'date, amount, category are required' });
  }

  const tx = {
    id: uuid(),
    date,
    amount: Number(amount),
    category,
    description: description || ''
  };

  transactions.push(tx);
  res.status(201).json(tx);
});

// DELETE a transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const before = transactions.length;
  transactions = transactions.filter(t => t.id !== id);
  if (transactions.length === before) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.status(204).send();
});

// GET budgets
app.get('/api/budgets', (req, res) => {
  res.json(budgets);
});

// POST set/update budget
app.post('/api/budgets', (req, res) => {
  const { category, limit } = req.body;
  if (!category || limit == null) {
    return res.status(400).json({ error: 'category and limit are required' });
  }

  const existing = budgets.find(b => b.category === category);
  if (existing) {
    existing.limit = Number(limit);
    return res.json(existing);
  }

  const budget = { id: uuid(), category, limit: Number(limit) };
  budgets.push(budget);
  res.status(201).json(budget);
});

// GET summary (total + by category)
app.get('/api/summary', (req, res) => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  const byCategory = {};
  for (const t of transactions) {
    if (!byCategory[t.category]) byCategory[t.category] = 0;
    byCategory[t.category] += t.amount;
  }

  res.json({ total, byCategory });
});

app.listen(PORT, () => {
  console.log(`Hackathon budgeting API running on port ${PORT}`);
});

// To Run the server: 
// npm init -y
// npm install express cors uuid
// node server.js