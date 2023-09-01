const mongoose= require ('mongoose')

const employeeSchema = mongoose.Schema({
    employeeId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
    },
    companyName: {
        type: String,
    },
})
module.exports= employeeSchema