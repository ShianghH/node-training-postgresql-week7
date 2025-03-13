require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")
const { json } = require("stream/consumers")

function isUndefined (value) {
  return value === undefined
}

function isNotValidSting (value) {
  return typeof value !== "string" || value.trim().length === 0 || value === ""
}

function isNotValidInteger (value) {
  return typeof value !== "number" || value < 0 || value % 1 !== 0
}

const requestListener = async (req, res) => {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
}
  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

const sendResponse = (res, statusCode, data) =>{
    res.writeHead(statusCode, headers);
    res.write(JSON.stringify(data));//把資料轉成 JSON 格式
    res.end();//用 res.end() 結束回應
}
  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      //從 TypeORM 資料庫來源 AppDataSource 裡，取得 CreditPackage 資料表的 Repository
      const packages = await AppDataSource.getRepository("CreditPackage").find({
        //選取四個顯示的欄位(陣列)
        select: ["id", "name", "credit_amount", "price"]
      })
      //查詢成功 → 回傳資料給前端
      sendResponse(res,200,{
        status: "success",
        data: packages
      });
    } catch (error) {
      sendResponse(res,500,{
        status: "error",
        message: "伺服器錯誤"
      });
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on("end", async () => { //等待客戶端把資料傳送完，然後才開始處理
      try {
        const data = JSON.parse(body) //接收到的 body（通常是 JSON 字串）轉成 JavaScript 物件
        //資料驗證: 格式等 正確與否
        if (isUndefined(data.name) || isNotValidSting(data.name) ||
                isUndefined(data.credit_amount) || isNotValidInteger(data.credit_amount) ||
                isUndefined(data.price) || isNotValidInteger(data.price)) {
          sendResponse(res,400,{
              status: "failed",
              message: "欄位未填寫正確"
          });
          return
        }
        const creditPackageRepo = await AppDataSource.getRepository("CreditPackage")
        //檢查資料庫,看看有沒有同名的方案,如果已經有這個名稱 → 回傳錯誤
        const existPackage = await creditPackageRepo.find({
          where: {
            name: data.name
          }
        })
        if (existPackage.length > 0) {
          sendResponse(res,400,{
              status: "failed",
              message: "資料重複"
          });
          return
        }
        //沒有重複 → 新增資料到資料庫
        // .create()：在記憶體生成一筆新的資料
        const newPackage = await creditPackageRepo.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        })
        //.save()：把這筆資料寫進資料庫
        const result = await creditPackageRepo.save(newPackage)
        sendResponse(res,201,{
          status: "success",
          data: result
        });
      } catch (error) {
        sendResponse(res,500,{
            status: "error",
            message: "伺服器錯誤"
        });
      }
    })
  } else if (req.url.startsWith("/api/credit-package/") && req.method === "DELETE") {
    try {
      // 取得 URL 裡的 ID
      const packageId = req.url.split("/").pop()
      //檢查 ID 是否有效
      if (  isNotValidSting(packageId)) {
        sendResponse(res,400,{
          status: "failed",
          message: "ID錯誤"
        });
        return
      }
      //用 TypeORM 的 delete() 方法，根據 packageId 刪除資料
      const result = await AppDataSource.getRepository("CreditPackage").delete(packageId)
      //result.affected 表示刪除的筆數
      if (result.affected === 0) {
        sendResponse(res,400,{
          status: "failed",
          message: "ID錯誤"
        });
        return
      }
      sendResponse(res,200,{
          status: "success"
      });
    } catch (error) {
      sendResponse(res,500,{
        status: "error",
        message: "伺服器錯誤"
      });
    }
  } else if(req.url === "/api/coaches/skill" && req.method === "GET"){
    try {
      const skill = await AppDataSource.getRepository("Skill").find({
        select:["id", "name"]
      })
      sendResponse(res,200,{
        status: "success",
        data: skill
      });
    } catch (error) {
      sendResponse(res,500,{
        status: "error",
        message: "伺服器錯誤"        
      });
    }
  } else if(req.url === "/api/coaches/skill" && req.method === "POST"){
    req.on("end", async () =>{
      try {
        const skillData = JSON.parse(body)
        if(isNotValidSting(skillData.name)){
          sendResponse(res,400,{
            status: "failed",
            message: "欄位未填寫正確"
          });
          return
        }
        const skillRepo = await AppDataSource.getRepository("Skill")
        const skillPackage = await skillRepo.find({
          where:{
            name: skillData.name
          }
        })
        if(skillPackage.length > 0){
          sendResponse(res,409,{
            status: "failed",
            message: "資料重複"            
          });
          return
        }
        const newSkill = await skillRepo.create({
          name:skillData.name
        })
        const skillResult = await skillRepo.save(newSkill)
        sendResponse(res,201,{
          status: "success",
          data: skillResult          
        });
      } catch (error) {
        sendResponse(res,500,{
          status: "error",
          message: "伺服器錯誤"          
        });
      }
    })

  } else if(req.url.startsWith("/api/coaches/skill/") && req.method === "DELETE"){
    try {
      const skillId = req.url.split("/").pop()
      if(isUndefined(skillId) || isNotValidSting(skillId)){
        sendResponse(res,400,{
          status: "failed",
          message: "ID錯誤"          
        });
        return
      }
      const result = await AppDataSource.getRepository("Skill").delete(skillId)
      if(result.affected === 0){
        sendResponse(res,400,{
          status: "failed",
          message: "ID錯誤"          
        });
        return
      }
    } catch (error) {
      sendResponse(res,500,{
        status: "error",
        message: "伺服器錯誤"        
      });
    }

  } else if (req.method === "OPTIONS") {
    sendResponse(res,200,{
      
    });

  } else {
    sendResponse(res,404,{
      status: "failed",
      message: "無此網站路由"      
    });
  }
}

const server = http.createServer(requestListener)

async function startServer () {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();