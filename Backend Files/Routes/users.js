const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../lib/auth');

const prisma = new PrismaClient();
const router = express.Router();

// GET LOGGED-IN USER
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

// GET ALL USERS (PROTECTED)
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true, createdAt: true },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
