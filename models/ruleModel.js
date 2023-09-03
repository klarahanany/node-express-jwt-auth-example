const mongoose = require ("mongoose")

const ruleSchema = new mongoose.Schema({


    name: {
        type : String,

    }

})

module.exports = ruleSchema
