import User from '../models/user.js'
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import Conf from '../config.js'

const adminRouter = express.Router()

adminRouter.use(bodyParser.urlencoded({extended: false}));
adminRouter.use(bodyParser.json());

// add new user
adminRouter.post('/register', async (req, res) => {

    
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
        
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          const jabatan = user.jabatan;
          if (jabatan == '0'){
            try {

                const {name, email, password, jabatan} = req.body

                var saltRounds = 10;
                const hashedPw = await bcrypt.hash(password, saltRounds)
                const newUser = new User({"name": name, "email": email, "password": hashedPw, "jabatan": jabatan})
                const createdUser = await newUser.save()
                res.status(201).json(createdUser)
            } catch (error) {
                console.log(error)
                res.status(500).json({error: error})
            }
        } else {
            res.status(201).json({"status":"Anda tidak berwenang melakukan registrasi!"})
        }

    })
})

// get all user
adminRouter.get('/', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '0'){
        const user = await User.find({});
        res.json(user)
      } else {
        res.status(201).json({"status":"Anda tidak berwenang melihat daftar user"})
      }

    })
})

// get user by id
adminRouter.get('/:id', async (req, res) => {
 
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '0'){
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
    } else {
        res.status(201).json({"status":"Anda tidak berwenang melihat daftar user"})
      }

    })

})

// update user data
adminRouter.patch('/:id', async (req, res) => {
    
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '0'){
        try {
            const { name, email, password, jabatan } = req.body;

            const user = await User.findById(req.params.id);

            if(user){
                
                user.name= name;
                user.email= email;
                var saltRounds = 10;
                const hashedPw = await bcrypt.hash(password, saltRounds);
                user.password = hashedPw;
                user.jabatan = jabatan

                const updatedUser = await user.save();

                res.json(updatedUser);
            } else {
                res.status(404).json({
                    message: 'user not found'
                })
            }

    
        } catch (error) {
            console.log(error)
            res.status(500).json({"status": "user not found"});
        }

      } else {
        res.status(201).json({"status":"Anda tidak berwenang untuk update user"})
      }

    })
})

export default adminRouter
