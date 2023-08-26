import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({

    userId: {
        bsonType: "objectId",
        description: "Reference to the user who created this log source"
    },
    name: {
        bsonType: "string",
        description: "Name of the log source"
    },
    description: {
        bsonType: "string",
        description: "Description of the log source"
    },
    createdAt: {
        bsonType: "date",
        description: "Timestamp of when the log source was created"
    }
})
