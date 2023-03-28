const router = require('express').Router();
var ironSession = require("iron-session/express").ironSession;

var session = ironSession({
  password: "complex_password_at_least_32_characters_long",
  cookieName: "farmfriend",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax',
  },
});

const AuthController = require('../controllers/auth.controller')

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

// Authentication Routes
router.get('/user', session, AuthController.user)
router.post('/register', session, AuthController.register)
router.post('/login', session, AuthController.login)
router.post('/logout', session, AuthController.logout)

module.exports = router;
