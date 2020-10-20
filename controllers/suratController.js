import Surat from '../models/surat.js'
import express from 'express'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import path from 'path'
import fileUpload from 'express-fileupload'
import fs from 'fs'

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
    const authHeader = req.headers.authorization;
    var userdata = [];
    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            userdata = user
            const jabatanAllowed = [1,2] //cek jika user dengan kode jabatan yang di define tidak ada maka return eror
            if (!jabatanAllowed.includes(user.jabatan)) 
                return res.status(403).json({"message": "Anda tidak memiliki wewenang"});
            if (err) {
                console.log(err)
                return res.sendStatus(403);
            }
        });
    } else {
        res.sendStatus(401);
    }

    if (! req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('Tidak ada file yang diupload');
    }

    try {
        const surat = req.files.surat;
        const filename = 'Surat-' + Date.now() + path.extname(surat.name)
    
        surat.mv(__dirname + '/uploads/'+filename, function (err) {
            if (err) 
                return res.status(500).send(err);
        });

        //jika jabatan nya adalah pegawai biasa
        if(userdata.jabatan == 1)
        {
            const newSurat = new Surat(
                {
                    "user_id":userdata.id,
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
                    "user_id":userdata.id,
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
});

export default suratRouter

