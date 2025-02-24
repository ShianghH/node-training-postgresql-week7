const express = require('express')

const router = express.Router()
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')


function isUndefined (value) {
    return value === undefined
  }
  
  function isNotValidSting (value) {
    return typeof value !== "string" || value.trim().length === 0 || value === ""
  }
  
  function isNotValidInteger (value) {
    return typeof value !== "number" || value < 0 || value % 1 !== 0
  }


router.get('/', async (req, res, next) => {
    try {
        const packages = await dataSource.getRepository('CreditPackage').find({
            select: ["id", "name", "credit_amount", "price"]
        })
        res.status(200).json({
        status : 'success',
        data: packages
    })    
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const data = req.body
        if(isUndefined(data.name) || isNotValidSting(data.name) ||
        isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
        isUndefined(data.price) || isNotValidInteger(data.price)){
            res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確'
                })
                return
        }
        const creditPackageRepo = await dataSource.getRepository('CreditPackage')
        const existPackage = await creditPackageRepo.find({
            where: {
                name : data.name 
            }
        })
        if(existPackage.length > 0 ){
            res.status(409).json({
                status: 'failed',
                message: '資料重複'
                })
                return
        }
        const newPackage = await creditPackageRepo.create({
            name: data.name,
            credit_amount: data.credit_amount,
            price: data.price
        })
        const result = await creditPackageRepo.save(newPackage)
        res.status(200).json({
            status: 'success',
            data: result
        })

    } catch (error) {
        logger.error(error)
        next(error)
    }
})

router.delete('/:creditPackageId', async (req, res, next) => {
    try {
        const {creditPackageId} = req.params
        if(isUndefined(creditPackageId) || isNotValidSting(creditPackageId)){
            res.status(400).json({
                status: 'failed',
                message: 'ID錯誤'
            })
            return 
        }
        const result =  await dataSource.getRepository('CreditPackage').delete(creditPackageId)
        if(result.affected === 0 ){
            res.status(400).json({
                status: 'failed',
                message: 'ID錯誤'
            })
            return
        }
        res.status(200).json({
            status: 'success',
            data: result
        })
    } catch (error) {
        logger.error(error)
        next(error)
    }
})

module.exports = router
