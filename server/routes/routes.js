const express = require('express');
const router = express.Router();
// const path = require('path');
const registerController = require('../controllers/auth/registerController');
const refreshTokenController = require('../controllers/auth/refreshTokenController');
const logoutController = require('../controllers/auth/logoutController');
const authController = require('../controllers/auth/authController');
const listFileController = require('../controllers/file/listFileController')
const deleteFileController = require('../controllers/file/deleteFileController')
const downloadController = require('../controllers/file/downloadController')
const singleUploadController = require('../controllers/file/singleUploadController')
const multiUploadController = require('../controllers/file/multiUploadController')
const verifyJWT = require('../middleware/verifyJWT');

//root
// router.get('^/$|/index(.html)?', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
// });

//register
router.post('/register', registerController.handleNewUser);

//refresh
router.get('/refresh', refreshTokenController.handleRefreshToken);

//logout
router.post('/logout', logoutController.handleLogout);

//auth
router.post('/auth', authController.handleLogin);

//verify user
router.use(verifyJWT)

//upload url
router.get('/upload', singleUploadController.upload)

//multi url
router.get('/multi', multiUploadController.multi)

//complete command
router.post('/multi', multiUploadController.complete)

//download url
router.get('/download', downloadController.download)

//list files
router.get('/listfile', listFileController.listFiles)

//delete
router.post('/delete', deleteFileController.deleteFile)

module.exports = router;