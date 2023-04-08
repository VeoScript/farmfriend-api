const router = require('express').Router();
var ironSession = require("iron-session/express").ironSession;

var session = ironSession({
  password: "complex_password_at_least_32_characters_long",
  cookieName: "farmfriend",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: 'lax'
  },
});

const AuthController = require('../controllers/auth.controller');
const UserController = require('../controllers/user.controller');
const CropsController = require('../controllers/crops.controller')
const ProgramsController = require('../controllers/programs.controller');
const ReportsController = require('../controllers/reports.controller');
const RatesController = require('../controllers/rates.controller');
const NotificationsController = require('../controllers/notifications.controller');

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

// Authentication Routes
router.get('/user', session, AuthController.user);
router.post('/register', session, AuthController.register);
router.post('/login', session, AuthController.login);
router.post('/logout', session, AuthController.logout);

// User Routes
router.get('/users', session, UserController.users)
router.put('/update-account/:id', session, UserController.updateAccount);
router.put('/change-profile/:id', session, UserController.changeProfile);
router.put('/change-password/:id', session, UserController.changePassword);
router.put('/delete-account/:id', session, UserController.deleteAccount);

// Crops Routes
router.get('/crops', session, CropsController.index);
router.get('/crop/:id', session, CropsController.show);
router.get('/suggested-crops', session, CropsController.suggestedCrops);
router.post('/create-crop', session, CropsController.create);
router.put('/update-crop/:id', session, CropsController.update);

// Programs Routes
router.get('/programs', session, ProgramsController.index);
router.get('/program/:id', session, ProgramsController.show);
router.post('/create-program', session, ProgramsController.create);

// Reports Routes
router.get('/reports', session, ReportsController.index);
router.post('/create-report', session, ReportsController.create);

// Rates Routes
router.get('/rates', session, RatesController.index);
router.post('/submit-rate', session, RatesController.create);

// Notifications Routes
router.get('/notifications', session, NotificationsController.index);
router.get('/unread-notifications', session, NotificationsController.unreadCount);
router.put('/read-notification/:id', session, NotificationsController.read);

module.exports = router;
