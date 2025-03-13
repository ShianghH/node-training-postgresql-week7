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

//新增教練課程資料
router.post('/coaches/courses', auth, isCoach, postCourse)
// 取得教練自己的月營收資料
router.get('/coaches/revenue',auth, isCoach, getCoachRevenue)
// 取得教練自己的課程列表
router.get('/coaches/courses',auth, isCoach,getCoachCourses)
// 取得教練自己的課程詳細資料
router.get('/coaches/courses/:courseId',auth,getCoachCourseDetail)
// 編輯教練課程資料
router.put('/coaches/courses/:courseId', auth, isCoach, putCourse)
//將使用者新增為教練
router.post('/coaches/:userId', postUserId)
//變更教練資料
router.put('/coaches', auth, isCoach, putCoachProfile)
//取得教練自己的詳細資料
router.get('/coaches',auth, isCoach, getCoachProfile)




module.exports = router
