const mongoose = require('mongoose');
const connectDB = require('./connectDB')
const dotenv = require('dotenv');
const app = require('./app');
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });

// const connect = async () => {
//     try {
//         const DB = 'mongodb://127.0.0.1:27017/node-auth';
//         await mongoose.connect(DB, {
//             useNewUrlParser: true,
//         })
//             .then(() => console.log('DB connection successful!'));
//     }  catch (error) {
//     console.log(error);
// }
// }
// connect().then();
 connectDB().then(r => console.log('DB connection successful!'))


const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});





process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

