const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const Conf = require('./config')
dotenv.config()

const userRouter = require('./controllers/UserController')

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
