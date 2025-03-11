const express = require('express')
const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Course')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

const {
  getCourse,
  postCourse,
  deleteCourse
} = require('../controllers/course')



router.get('/', getCourse)
router.post('/:courseId', auth, postCourse)
router.delete('/:courseId', auth, deleteCourse)

module.exports = router