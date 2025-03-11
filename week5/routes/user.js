const express = require('express')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Users')
const auth = require('../middlewares/auth')({  //設定 auth 驗證 Middleware，用來驗證 JWT Token
  //auth Middleware 需要 JWT 密鑰 (secret)、使用者資料 (userRepository) 及 logger
  secret: config.get('secret').jwtSecret, 
  userRepository: dataSource.getRepository('User'),
  logger
})
const {
  postSignup,
  postLogin,
  getProfile,
  putProfile,
  getCreditPackage,
  getCourseBooking,
  putPassword
} = require('../controllers/user')


router.post('/signup',postSignup)
router.post('/login', postLogin)
router.get('/profile', auth, getProfile)
router.put('/profile', auth, putProfile)
router.get('/credit-package',auth,getCreditPackage)
router.put('/password',auth, putPassword)
router.get('/courses', auth, getCourseBooking)

module.exports = router