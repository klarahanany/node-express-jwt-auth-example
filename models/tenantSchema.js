const mongoose= require ('mongoose')
const tenantSchema = mongoose.Schema({
    firstName: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    companyName: {
        type: String,
        unique: true,
    },
})

module.exports= tenantSchema