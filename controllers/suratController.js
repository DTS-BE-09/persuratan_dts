import Surat from '../models/surat.js'
import express from 'express'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import path from 'path'
import fileUpload from 'express-fileupload'
import fs from 'fs'
import Conf from '../config.js'

const __dirname = path.resolve();
const suratRouter = express.Router()

suratRouter.use(bodyParser.urlencoded({extended: false}));
suratRouter.use(bodyParser.json());
suratRouter.use(fileUpload());

var dir = './uploads';



//buat folder untuk upload jika belum ada
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

//api untuk upload surat
suratRouter.post('/upload-surat', async (req, res) => {

    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '1' | jabatan == '2'){

        try {
            const surat = req.files.surat;
            const filename = 'Surat-' + Date.now() + path.extname(surat.name)
        
            surat.mv(__dirname + '/uploads/'+filename, function (err) {
                if (err) 
                    return res.status(500).send(err);
            });
    
            //jika jabatan nya adalah pegawai biasa
            if(jabatan == 1)
            {
                const newSurat = new Surat(
                    {
                        "user_id":user.id,
                        "surat": filename,
                        "feedback_spv" : false,
                        "feedback_spv_time":null,
                        "feedback_bos" : false,
                        "feedback_bos_time":null,
                    })
                await newSurat.save()
            }
            else //jika jabatan yang mengupload adalah supervisor maka kolom persetujuan spv langsung otomatis true 
            {
                const newSurat = new Surat(
                    {
                        "user_id":user.id,
                        "surat": filename,
                        "feedback_spv" : true,
                        "feedback_bos" : false,
                        "feedback_bos_time":null,
                    }
                )
                await newSurat.save()
            }
            
            res.status(200).send({"message": "File berhasil diupload"});
        } catch (error) {
            console.log(error)
        }

      } else {
        res.status(201).json({"status":"Anda tidak berwenang upload file"})
      }

    })
});


suratRouter.get('/waiting', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '2' | jabatan == '3'){

        const user = await Surat.find({});
        res.json(user)

      } else {
        res.status(201).json({"status":"Anda tidak berwenang melihat data waiting"})
      }

    })
})

suratRouter.get('/in-progress', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      const user_id = user.id
      if (jabatan == '1' | jabatan == '2'){

        const user = await Surat.find({user_id});
        res.json(user)

      } else {
        res.status(201).json({"status":"Anda tidak berwenang melihat data in-progress"})
      }

    })
})

suratRouter.patch('/verify/:id', async (req, res) => {
    //header apabila akan melakukan akses
    var token = req.headers.authorization;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, user) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      const jabatan = user.jabatan;
      if (jabatan == '2' | jabatan == '3'){
        const surat = await Surat.findById(req.params.id);
        if (jabatan == '3'){
            var waktu = Date.now()
            surat.user_id= surat.user_id
            surat.surat = surat.surat
            surat.feedback_spv = surat.feedback_spv
            surat.feedback_spv_time = surat.feedback_spv_time
            surat.feedback_bos= true;
            surat.feedback_bos_time= waktu;

            const updatedSurat = await surat.save();

            res.json(updatedSurat);

        } else if (jabatan == '2'){       
            var waktu = Date.now()   
            surat.user_id= surat.user_id
            surat.surat = surat.surat
            surat.feedback_spv = true
            surat.feedback_spv_time = waktu
            surat.feedback_bos= surat.feedback_bos;
            surat.feedback_bos_time= surat.feedback_bos_time;
            const updatedSurat = await surat.save();

            res.json(updatedSurat);

        }else {
            res.status(404).json({
                message: 'surat not found'
            })
        }

      } else {
        res.status(201).json({"status":"Anda tidak berwenang Approve surat"})
      }

    })
})



export default suratRouter

