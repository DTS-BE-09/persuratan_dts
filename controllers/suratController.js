import Surat from '../models/surat.js'
import express from 'express'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'
import path from 'path'
import fileUpload from 'express-fileupload'

const __dirname = path.resolve();

const suratRouter = express.Router()

userRouter.use(bodyParser.urlencoded({extended: false}));
userRouter.use(bodyParser.json());
suratRouter.use(fileUpload());

suratRouter.post('/upload-surat', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, 'secret', (err, user) => {
            const jabatanAllowed = [1,2]
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

        const newSurat = new Surat({"surat": filename})
        const createdSurat = await newSurat.save()
        res.status(200).send({"message": "File berhasil diupload"});
    } catch (error) {
        console.log(error)
    }
});

export default suratRouter

