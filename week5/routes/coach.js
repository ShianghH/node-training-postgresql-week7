const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const Coach = require('../entities/Coach')


const logger = require('../utils/logger')('Coach')

function isUndefined (value) {
    return value === undefined
}

function isNotValidSrting (value) {
    return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {
    return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

router.get('/', async (req, res, next) => {
    try {
        const {per,page}= req.query
        if(isNotValidSrting(per)||isNotValidSrting(page)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
                })
                return
        }
        const perNum = parseInt(per)
        const pageNum = parseInt(page)
        if(isNotValidInteger(perNum) || isNotValidInteger(pageNum)|| perNum <= 0 || pageNum <= 0){
            return res.status(400).json({
                status: 'failed',
                message: 'per 和 page 須是正整數'
            })
        }
        const coaches = await dataSource.getRepository('Coach').find({
            select: { 
                id: true,
                user: {
                    id: true,
                    name: true
                }
            },
            relations: { 
                user: true
            },
            skip: (pageNum - 1) * perNum,
            take: perNum
        });
        const result = coaches.map(coach => ({
            id: coach.id,
            name: coach.user.name
        }));

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        logger.error(error)
        next(error)
    }

    
})


module.exports = router