const express = require('express')
const router = express.Router()
const {
    getCoach,
    getCoachId,
    getCoachCourses
} = require('../controllers/coach')


router.get('/', getCoach)
router.get('/:coachId', getCoachId)
router.get('/:coachId/courses', getCoachCourses)

module.exports = router