

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/userRoute.js'
import categoryRouter from './route/categoryRoute.js'
import uploadRouter from './route/uploadRoute.js'
import subCategoryRouter from './route/subCategoryRoute.js'
import productRouter from './route/productRoute.js'
import cartRouter from './route/cartRoute.js'
import addressRouter from './route/addressRoute.js'
import orderRouter from './route/orderRoute.js'

const app = express()
app.use(cors({
    credentials : true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin : process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = 8080 || process.env.PORT 


app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})



app.use('/api/user',userRouter)
app.use('/api/auth',userRouter) 
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)
    })
})
