const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Admin')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const isCoach = require('../middlewares/isCoach')
const {
  postCourse,
  putCourse,
  postUserId,
  getCoachCourses,
  getCoachCourseDetail,
  getCoachProfile,
  getCoachRevenue,
  putCoachProfile
} =require('../controllers/admin')

router.post('/coaches/:userId', postUserId)
router.post('/coaches/courses', auth, isCoach, postCourse)
router.get('/coaches/courses',auth, isCoach,getCoachCourses)
router.get('/coaches/courses/:courseId',auth,getCoachCourseDetail)
router.get('/coaches',auth, isCoach, getCoachProfile)
router.get('/coaches/revenue',auth, isCoach, getCoachRevenue)
router.put('/coaches/courses/:courseId', auth, isCoach, putCourse)
router.put('/coaches', auth, isCoach, putCoachProfile)

module.exports = router