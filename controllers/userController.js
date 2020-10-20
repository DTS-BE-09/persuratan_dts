import User from '../models/user.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Conf from '../config.js'
import bodyParser from 'body-parser'

const userRouter = express.Router()

userRouter.use(bodyParser.urlencoded({extended: false}));
userRouter.use(bodyParser.json());

// login
userRouter.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        const currentUser = await new Promise((resolve, reject) => {
            User.find({
                "username": username
            }, function (err, user) {
                if (err) 
                    reject(err)
                
                resolve(user)
            })
        })
        // cek apakah ada user?
        if (currentUser[0]) { // check password
            bcrypt.compare(password, currentUser[0].password).then((result) => {
                if (result) { // urus token disini
                    var token = jwt.sign({
                        id: currentUser[0]._id,
                        jabatan: currentUser[0].jabatan
                    }, Conf.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.status(200).send({"status": "logged in!", auth: true, token: token});
                } else 
                    res.status(201).json({"status": "wrong password."});
                
            });
        } else {
            res.status(401).json({"status": "user not found"});
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
})


// add new user
userRouter.post('/add', async (req, res) => {
    try {

        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, 'secret', (err, user) => {
                if (user.jabatan != 'bos') 
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

        // digit angkat mau berapa banyak
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
userRouter.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 'bos') 
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
userRouter.get('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 'bos') 
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

// update user username and password
userRouter.patch('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 'bos') 
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

userRouter.delete('/:id', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            if (user.jabatan != 'bos') 
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

        const deletedUser = await user.remove()
        res.status(201).json({"status": "Data berhasil dihapus!"});
    } catch (error) {
        res.status(500).json({error: error})
    }
})

export default userRouter
