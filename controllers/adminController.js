import User from '../models/user.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'

const adminRouter = express.Router()

adminRouter.use(bodyParser.urlencoded({extended: false}));
adminRouter.use(bodyParser.json());

// add new user
adminRouter.post('/register', async (req, res) => {
    try {

        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, 'secret', (err, user) => {
                if (user.jabatan != 0) 
                    return res.status(403).json({"message": "Anda tidak memiliki wewenang"});
                if (err) {
                    console.log(err)
                    return res.sendStatus(403);
                }
            });
        } else {
            res.sendStatus(401);
        }

        const {username, email, password, jabatan} = req.body

        var saltRounds = 10;
        const hashedPw = await bcrypt.hash(password, saltRounds)
        const newUser = new User({"username": username, "email": email, "password": hashedPw, "jabatan": jabatan})
        const createdUser = await newUser.save()
        res.status(201).json(createdUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error})
    }
})

// get all user
adminRouter.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 0) 
                return res.status(403).json({"message": "Anda tidak memiliki wewenang"});
            
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
        });
    } else {
        res.sendStatus(401);
    }

    const user = await User.find({})

    if (user && user.length !== 0) {
        res.json(user)
    } else {
        res.status(404).json({message: 'User not found'})
    }
})

// get user by id
adminRouter.get('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 0) 
                return res.status(403).json({"message": "Anda tidak memiliki wewenang"});
            
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
        });
    } else {
        res.sendStatus(401);
    }

    try {
        const user = await new Promise((resolve, reject) => {
            User.findById(req.params.id, (err, user) => {
                if (err) 
                    reject(err)
                resolve(user)
            })
        })
        res.json(user)
    } catch (error) {
        res.status(500).json({error: error})
    }
})

// update user data
adminRouter.patch('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 0) 
                return res.status(403).json({"message": "Anda tidak memiliki wewenang"});
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
        });
    } else {
        res.sendStatus(401);
    }

    var ObjectId = require('mongodb').ObjectID
    try {
        const user = await new Promise((resolve, reject) => {
            User.findById(req.params.id, (err, user) => {
                if (err) 
                    reject(err)
                resolve(user)
            })
        })
        const data = req.body

        if (data.hasOwnProperty('password')) {
            var saltRounds = 10;
            const hashedPw = await bcrypt.hash(data.password, saltRounds)
            data.password = hashedPw
        }

        await User.update({
            _id: ObjectId(req.params.id)
        }, {$set: data});
        res.status(201).json({"status": "Update success!"});

    } catch (error) {
        console.log(error)
        res.status(500).json({"status": "user not found"});
    }
})

export default adminRouter
