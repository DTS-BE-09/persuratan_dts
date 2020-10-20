import mongoose from 'mongoose'

const suratSchema = mongoose.Schema({
    Surat : {
        type:String,
        required:true
    },
    feedback_spv: {
        type: Boolean,
        default : null
    },
    feedback_spv_time: {
        type: Date,
        default: Date.now
    },
    feedback_bos: {
        type: Boolean,
        default : null
    },
    feedback_bos_time: {
        type: Date,
        default : Date.now
    },
}, {timestamps: true})

const Surat = mongoose.model('Surat', suratSchema)

export default Surat

