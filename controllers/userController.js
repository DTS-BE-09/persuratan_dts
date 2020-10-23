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
        const {email, password} = req.body;

        const currentUser = await new Promise((resolve, reject) => {
            User.find({
                "email": email
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

export default userRouter
