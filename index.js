import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import Conf from './config.js'

dotenv.config()

import userRouter from './controllers/UserController.js'

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

app.use('/api/user', userRouter)


const PORT = process.env.PORT || '3000'

app.listen(PORT, () => {
    console.log(`App listen to port ${PORT}`)
})
