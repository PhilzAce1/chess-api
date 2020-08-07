const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

function serialize(req, res, next) {
  console.log('SERIALIZE RUNNING');
  db.updateOrCreate(req.user, (err, user) => {
    if (err) {
      return next(err);
    }
    // we store the updated information in req.user again
    req.user = user;
    next();
  });
}

function generateToken(req, res, next) {
  const sig = {
    id: req.user.id,
  };
  const secret = 'server secret';
  const expiration = {
    expiresIn: '30 days',
  };
  req.token = jwt.sign(sig, secret, expiration);
  next();
}

router.post(
  '/login',
  passport.authenticate('local', {
    session: false,
  }),
  (req, res) => {
    res.status(200).json({
      user: req.user,
      token: req.token,
    });
  }
);

router.post(
  '/signup',
  (req, res) => {
    const { password, username } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = password ? bcrypt.hashSync(password, salt) : null;
  },
  passport.authenticate('local', {
    session: false,
  })
);

router.post('/logout', (req, res) => {
  console.log('logging out');
  req.logout();
  // res.redirect('/');
});

module.exports = router;
