
const express = require('express')

const config = require('../config/index')
const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('Upload')
const auth = require('../middlewares/auth')({
  secret: config.get('secret').jwtSecret,
  userRepository: dataSource.getRepository('User'),
  logger
})

const formidable = require('formidable')

//firebase 初始化
const firebaseAdmin = require('firebase-admin') //引入了 firebase-admin 套件
firebaseAdmin.initializeApp({ //初始化 Firebase Admin SDK
  credential: firebaseAdmin.credential.cert(config.get('secret.firebase.serviceAccount')), //使用服務帳戶憑證來認證 Firebase Admin SDK
  storageBucket: config.get('secret.firebase.storageBucket') //設定 Firebase Storage 的儲存桶（bucket）
})


//檔案上傳邏輯
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true
}

const bucket = firebaseAdmin.storage().bucket()


const router = express.Router()

router.post('/', auth, async  (req, res, next)=> {// POST 請求到達 /api/upload 路徑時，會觸發這個函式，並且會經過 auth 中介軟體進行驗證
    try {
      const form = formidable.formidable({ //使用 formidable 函式庫來處理上傳的文件
        multiple: false, //表示一次只能上傳一個文件
        maxFileSize: MAX_FILE_SIZE, //設定了上傳文件的最大大小(js:20)
        filter: ({ mimetype }) => {
          return !!ALLOWED_FILE_TYPES[mimetype] //設置過濾器，檢查上傳文件的 MIME 類型，確保上傳的文件是允許的類型（js:21）
        }
      })
      const [fields, files] = await form.parse(req) //fields：包含表單的非文件字段（例如：標題、描述等）、files：包含所有上傳的文件資訊
      logger.info('files')
      logger.info(files)
      logger.info('fields')
      logger.info(fields)
      const filePath = files.file[0].filepath //從 files 變數中提取出上傳的文件路徑（filepath）
      const remoteFilePath = `images/${new Date().toISOString()}-${files.file[0].originalFilename}` 
      //文件上傳到 Firebase Storage 的遠端路徑
      //使用 new Date().toISOString() 來生成當前時間的 ISO 格式字符串，避免重名問題。
      //files.file[0].originalFilename 是上傳文件的原始檔名
      await bucket.upload(filePath, { destination: remoteFilePath }) //將文件從伺服器的臨時存儲位置（filePath）上傳到 Firebase Storage 
      const options = {
        action: 'read', //會用來讀取文件。
        expires: Date.now() + 24 * 60 * 60 * 1000 //設置 URL 的有效期為 24 小時（從當前時間開始）。
      }
      const [imageUrl] = await bucket.file(remoteFilePath).getSignedUrl(options) //存取上傳的圖片
      logger.info(imageUrl)
      res.status(200).json({
        status: 'success',
        data: {
          image_url: imageUrl
        }
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  })

module.exports = router