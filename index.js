import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

import userRouter from './controllers/userController.js'
import adminRouter from './controllers/adminController.js'

const app = express();

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('Connect to DB Success')
    } catch (error) {
        console.log(error)
    }
} 

connectDB()

// middleware
app.use(morgan('dev'))

// routing
app.use(express.json());
app.get('/', (req, res) => {
    res.json({message: 'success'});
})

app.use('/api/v1/admin/', adminRouter)
app.use('/api/v1/', userRouter)

const PORT = process.env.PORT || '3000'

app.listen(PORT, () => {
    console.log(`App listen to port ${PORT}`)
})
