const mongoose = require ("mongoose")

const LogSchema = new mongoose.Schema({


    name: {
        type : String,

    }

})

module.exports = LogSchema
