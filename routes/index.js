var express = require('express');
var router = express.Router();
const passport = require('passport');
const path = require('path');
require('../middlewares/passport')(passport)

var auth = require('../controllers/v1/user.controller.js');
router.get('/api/create', auth.createUser);
router.get('/api/list', auth.list);
router.get('/api/delete', auth.deleteUser);
router.get('/api/restore', auth.restoreUser);
router.post('/api/login', auth.login);

module.exports = router;
