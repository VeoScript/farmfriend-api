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

const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

// Authentication Routes
router.get('/user', session, AuthController.user)
router.post('/register', session, AuthController.register)
router.post('/login', session, AuthController.login)
router.post('/logout', session, AuthController.logout)

// User Routes
router.put('/update-account/:id', session, UserController.updateAccount)
router.put('/change-profile/:id', session, UserController.changeProfile)
router.put('/change-password/:id', session, UserController.changePassword)
router.put('/delete-account/:id', session, UserController.deleteAccount)

module.exports = router;
