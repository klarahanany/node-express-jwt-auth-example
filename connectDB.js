
const mongoose= require ('mongoose')
const dotenv= require ('dotenv')

dotenv.config()
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    minPoolSize : 5,
    maxPoolSize : 10

}

function  connectDB() {
    return new Promise((resolve, reject) => {
        const mongoURL = `mongodb://127.0.0.1:27017/?authSource=admin`
        mongoose
            .connect(mongoURL, mongoOptions)
            .then((conn) => {
                console.log('switch DB connection')

                resolve(conn)
            })
            .catch((error) => reject(error))
    })
}

module.exports=  connectDB