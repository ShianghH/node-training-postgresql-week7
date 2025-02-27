const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const Coach = require('../entities/Coach')
const e = require('express')


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

router.get('/:coachId', async (req, res, next) => {
    try {
        const coachId = req.params.coachId;
        if(isUndefined(coachId)||isNotValidSrting(coachId)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        const result = await dataSource.getRepository('Coach').findOne({
            where :{ id : coachId},
            relations :{user:true},
            select:{
                user: {
                    name: true,
                    role: true
                },
                id: true,
                user_id: true,
                experience_years: true,
                description: true,
                profile_image_url: true,
                created_at: true,
                updated_at: true,

            }
        })

        if(!result){
            res.status(400).json({
                status: 'failed',
                message: '找不到該教練'
            })
            return
        }
        //**解構 result**，讓回應更簡潔
        const { id, user_id, experience_years, description, profile_image_url, created_at, updated_at, user } = result;
        res.status(200).json({
            status: 'success',
            data: {
                user,
                coach:{
                    id,
                    user_id,
                    experience_years,
                    description,
                    profile_image_url,
                    created_at,
                    updated_at,
                }
                
            }
        })
        

    } catch (error) {
        logger.error(error)
        next(error)
    }
})

module.exports = router