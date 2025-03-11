const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Skill')

const{
    getSkill,
    postSkill,
    deleteSkill
} = require('../controllers/skill')

router.get('/',  getSkill)
router.post('/', postSkill)
router.delete('/:skillId', deleteSkill)



module.exports = router