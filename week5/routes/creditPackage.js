const express = require('express')

const router = express.Router()
const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('CreditPackage')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})
const {
  getCreditPackage,
  postCreditPackage,
  postCreditPackageId,
  deCreditPackageId
} =require('../controllers/creditPackage')


router.get('/', getCreditPackage)
router.post('/', postCreditPackage)
router.post('/:creditPackageId', auth, postCreditPackageId)
router.delete('/:creditPackageId', deCreditPackageId)

module.exports = router
