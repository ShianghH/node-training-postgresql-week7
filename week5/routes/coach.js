const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const Coach = require('../entities/Coach')

const logger = require('../utils/logger')('Coach')

function isUndefined (value) {
    return value === undefined
}

function isNotValidSting (value) {
    return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
    return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

router.get('/', async (req, res, next) => {
    try {
        const {per,page}= req.query
        if(isNotValidSting(per)||isNotValidSting(page)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
                })
                return
        }
        const coaches = await dataSource.getRepository('User').find({
        select: ['id','name'],
        where : {role : 'COACH'},

        })
        res.status(200).json({
            status: 'success',
            data: coaches
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }

    
})


module.exports = router