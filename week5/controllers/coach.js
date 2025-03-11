const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Coach')

function isUndefined (value) {return value === undefined
}

function isNotValidString (value) {return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

function isNotValidInteger (value) {return typeof value !== 'number' || value < 0 || value % 1 !== 0
}

const getCoach = async (req, res, next) => {
    try {
        const {per,page}= req.query
        if(isNotValidString(per)||isNotValidString(page)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
                })
                return
        }
        const perNum = parseInt(per);
        const pageNum = parseInt(page);

    if (isNotValidInteger(perNum) || isNotValidInteger(pageNum) || perNum <= 0 || pageNum <= 0) {
        return res.status(400).json({
        status: 'failed',
        message: 'per 和 page 須是正整數'
    });
}
        const coaches = await dataSource.getRepository('Coach').find({
            select: {
                id: true,
                User: {
                    id: true,
                    name: true
                }
            },
            relations: {
                User: true
            },
            skip: (pageNum - 1) * perNum,
            take: perNum
        });
        const result = coaches.map(coach => ({
            id: coach.id,
            name: coach.User.name
        }));

        res.status(200).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

const getCoachId = async (req, res, next) => {
    try {
        const coachId = req.params.coachId;
        if(isUndefined(coachId)||isNotValidString(coachId)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
            })
            return
        }
        const result = await dataSource.getRepository('Coach').findOne({
            where :{ id : coachId},
            relations :{
                User: true
            },
            select:{
                User: {
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
        
        const { id, user_id, experience_years, description, profile_image_url, created_at, updated_at, User } = result;
        res.status(200).json({
            status: 'success',
            data: {
                User,
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
}
const getCoachCourses = async (req, res, next) => {
    try {
        const { coachId } = req.params
        if (isUndefined(coachId) || isNotValidString(coachId)) {
          res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確'
          })
          return
        }
        const coach = await dataSource.getRepository('Coach').findOne({
          select: {
            id: true,
            user_id: true,
            User: {
              name: true
            }
          },
          where: {
            id: coachId
          },
          relations: {
            User: true
          }
        })
        if (!coach) {
          logger.warn('找不到該教練')
          res.status(400).json({
            status: 'failed',
            message: '找不到該教練'
          })
          return
        }
        logger.info(`coach: ${JSON.stringify(coach)}`)
        const courses = await dataSource.getRepository('Course').find({
          select: {
            id: true,
            name: true,
            description: true,
            start_at: true,
            end_at: true,
            max_participants: true,
            Skill: {
              name: true
            }
          },
          where: {
            user_id: coach.user_id
          },
          relations: {
            Skill: true
          }
        })
        logger.info(`courses: ${JSON.stringify(courses)}`)
        res.status(200).json({
          status: 'success',
          data: courses.map((course) => ({
            id: course.id,
            name: course.name,
            description: course.description,
            start_at: course.start_at,
            end_at: course.end_at,
            max_participants: course.max_participants,
            coach_name: coach.User.name,
            skill_name: course.Skill.name
          }))
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

module.exports = {
    getCoach,
    getCoachId,
    getCoachCourses
}