const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

router.post(
  '/login',
  passport.authenticate('local', {
    session: false,
  }),
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await Marketer.findOne({
        username,
      });
      if (!user)
        return res.status(404).json({
          success: false,
          msg: 'user does not exits',
        });
      // confirm password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res
          .status(400)
          .json({ success: false, payload: 'wrong password' });

      const token = user.generateAuthToken();
      // send token
      res.header('x-auth-token', token).status(200).json({
        success: true,
        user: req.user,
        token: req.token,
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({
        success: false,
        message: e,
      });
    }
  }
);

router.post(
  '/signup',
  async (req, res) => {
    try {
      const { username, password } = req.body;
      // check if user exist
      const userExist = await marketer.findOne({ username });
      if (userExist)
        return res.status(400).json({
          success: false,
          msg: 'Username or email already taken',
        });
      // create new User
      const newUser = await new Marketer({
        username,
        password,
      });
      await newUser.save();
      const token = newUser.generateAuthToken();
      res.header('x-auth-token', token).status(200).json({
        success: true,
        payload: { token, newUser },
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({
        success: false,
        message: e,
      });
    }
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
